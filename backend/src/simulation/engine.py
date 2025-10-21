"""Simulation engine for Civilizationx."""
import asyncio
import logging
import time
from typing import List, Dict, Optional
from datetime import datetime

from src.agents.agent import Agent
from src.world.world_state import WorldState
from config import settings

logger = logging.getLogger(__name__)


class SimulationEngine:
    """Main simulation engine that runs the simulation loop."""

    def __init__(self, world_size: int = None, seed: int = None):
        """
        Initialize simulation engine.

        Args:
            world_size: Size of world (default from config)
            seed: Random seed (default: timestamp)
        """
        self.world_size = world_size or settings.world_size
        self.seed = seed or int(time.time())

        # Simulation state
        self.is_running = False
        self.simulation_speed = settings.simulation_speed
        self.tick_count = 0
        self.simulation_time = datetime.now()
        self.delta_time = 1.0  # 1 second per tick by default

        # World and agents
        self.world = WorldState(self.world_size, self.world_size, self.seed)
        self.agents: List[Agent] = []

        # Event callbacks
        self.on_tick_callbacks = []
        self.on_agent_update_callbacks = []
        self.on_event_callbacks = []

        # Performance tracking
        self.last_tick_time = 0.0
        self.tick_duration = 0.0

    async def initialize(self):
        """Initialize simulation (generate world, etc.)."""
        logger.info("Initializing simulation...")

        # Generate world
        self.world.generate_world()

        logger.info("Simulation initialized successfully")

    def spawn_agent(self, position: Optional[tuple] = None, name: Optional[str] = None) -> Agent:
        """
        Spawn a new agent.

        Args:
            position: (x, y) position or None for random spawn location
            name: Agent name or None for default

        Returns:
            Created agent
        """
        if position is None:
            # Get random spawn location
            spawn_locations = self.world.get_spawn_locations(count=1)
            if spawn_locations:
                position = spawn_locations[0]
            else:
                position = (self.world_size // 2, self.world_size // 2)

        if name is None:
            name = f"Agent_{len(self.agents) + 1}"

        agent = Agent(
            name=name,
            position=position,
            birth_time=self.simulation_time
        )

        self.agents.append(agent)
        logger.info(f"Spawned agent: {agent.name} at {agent.position}")

        # Notify callbacks
        self._emit_event({
            "type": "agent_spawned",
            "agent": agent.to_dict(),
            "timestamp": self.simulation_time.isoformat()
        })

        return agent

    def spawn_multiple_agents(self, count: int = 10):
        """Spawn multiple agents at different locations."""
        spawn_locations = self.world.get_spawn_locations(count=count)

        for i, position in enumerate(spawn_locations):
            self.spawn_agent(position=position, name=f"Agent_{len(self.agents) + 1}")

        logger.info(f"Spawned {count} agents")

    async def start(self):
        """Start the simulation loop."""
        if self.is_running:
            logger.warning("Simulation already running")
            return

        logger.info("Starting simulation...")
        self.is_running = True

        # Run simulation loop
        asyncio.create_task(self._simulation_loop())

    async def stop(self):
        """Stop the simulation."""
        logger.info("Stopping simulation...")
        self.is_running = False

    async def _simulation_loop(self):
        """Main simulation loop."""
        logger.info("Simulation loop started")

        while self.is_running:
            tick_start = time.time()

            # Calculate delta time (adjusted by simulation speed)
            self.delta_time = 1.0 * self.simulation_speed

            # Run simulation tick
            await self._tick()

            # Update performance metrics
            self.tick_duration = time.time() - tick_start
            self.last_tick_time = tick_start

            # Sleep to maintain ~1 tick per second (real time)
            sleep_time = max(0.0, 1.0 - self.tick_duration)
            await asyncio.sleep(sleep_time)

        logger.info("Simulation loop stopped")

    async def _tick(self):
        """Execute one simulation tick."""
        self.tick_count += 1

        # Update simulation time
        # 1 simulation second = 1 real second * simulation_speed
        self.simulation_time = datetime.now()

        # Update world (resource regeneration)
        self.world.update_resource_regeneration(self.delta_time)

        # Update all agents
        await self._update_agents()

        # Emit tick event
        for callback in self.on_tick_callbacks:
            await callback(self.get_simulation_state())

    async def _update_agents(self):
        """Update all agents."""
        for agent in self.agents:
            if not agent.is_alive:
                continue

            # Agent's internal update (needs decay, movement)
            agent.update(self.delta_time)

            # Agent behavior logic (Phase 1: simple needs-based)
            await self._agent_behavior(agent)

            # Emit agent update event
            for callback in self.on_agent_update_callbacks:
                await callback(agent.to_dict())

    async def _agent_behavior(self, agent: Agent):
        """
        Execute agent behavior logic (Phase 1 simple version).

        In Phase 1, agents have simple needs-based behavior:
        - If hungry: find and gather food
        - If tired: rest
        - If low social: socialize (not implemented yet)
        - Otherwise: wander or idle
        """
        # Check critical needs
        critical_need = agent.get_critical_need()

        if critical_need == "hunger":
            # Find nearest food source (berries)
            food_resource = self.world.get_nearest_resource(agent.position, "bush")

            if food_resource and not agent.target_position:
                # Move towards food
                agent.set_target_position(food_resource["position"])
                agent.current_activity = "seeking_food"

            elif agent.target_position is None:
                # Check if at food resource
                nearby_food = self.world.get_resources_near(agent.position, radius=1.0)
                berry_bushes = [r for r in nearby_food if r["resource_type"] == "bush"
                               and not r.get("is_depleted", False)]

                if berry_bushes:
                    # Harvest berries
                    bush = berry_bushes[0]
                    harvested = self.world.harvest_resource(bush, amount=1)
                    if harvested > 0:
                        agent.gather_resource("berries", harvested)
                        # Eat immediately when hungry
                        if agent.inventory.get("berries", 0) > 0:
                            agent.inventory["berries"] -= 1
                            agent.eat_food(20.0)  # Berries restore 20 hunger

        elif critical_need == "energy":
            # Rest to restore energy
            if agent.current_activity != "sleeping":
                agent.rest()
                agent.target_position = None

        else:
            # No critical needs - wander or idle
            if agent.current_activity in ["seeking_food", "sleeping"]:
                agent.current_activity = "idle"

    def set_simulation_speed(self, speed: float):
        """Set simulation speed multiplier."""
        self.simulation_speed = max(0.1, min(10.0, speed))
        logger.info(f"Simulation speed set to {self.simulation_speed}x")

    def get_simulation_state(self) -> Dict:
        """Get current simulation state."""
        return {
            "is_running": self.is_running,
            "simulation_speed": self.simulation_speed,
            "tick_count": self.tick_count,
            "simulation_time": self.simulation_time.isoformat(),
            "agent_count": len(self.agents),
            "alive_agent_count": sum(1 for a in self.agents if a.is_alive),
            "world_summary": self.world.get_world_summary(),
            "tick_duration": self.tick_duration,
        }

    def get_agents_state(self) -> List[Dict]:
        """Get all agents' state."""
        return [agent.to_dict() for agent in self.agents]

    def get_world_tiles(self, x_min: int = 0, y_min: int = 0,
                       x_max: int = None, y_max: int = None) -> List[Dict]:
        """Get world tiles in range."""
        if x_max is None:
            x_max = self.world.width
        if y_max is None:
            y_max = self.world.height

        # Clamp to valid range
        x_min = max(0, x_min)
        y_min = max(0, y_min)
        x_max = min(self.world.width, x_max)
        y_max = min(self.world.height, y_max)

        tiles = []
        for y in range(y_min, y_max):
            for x in range(x_min, x_max):
                tile = self.world.get_tile(x, y)
                if tile:
                    tiles.append(tile)

        return tiles

    def get_resources(self) -> List[Dict]:
        """Get all resources."""
        return self.world.resources

    def register_tick_callback(self, callback):
        """Register callback for tick events."""
        self.on_tick_callbacks.append(callback)

    def register_agent_update_callback(self, callback):
        """Register callback for agent update events."""
        self.on_agent_update_callbacks.append(callback)

    def register_event_callback(self, callback):
        """Register callback for simulation events."""
        self.on_event_callbacks.append(callback)

    def _emit_event(self, event: Dict):
        """Emit simulation event to callbacks."""
        for callback in self.on_event_callbacks:
            asyncio.create_task(callback(event))
