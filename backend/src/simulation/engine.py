"""Simulation engine for Civilizationx."""
import asyncio
import logging
import time
import random
from typing import List, Dict, Optional
from datetime import datetime

from src.agents.agent import Agent
from src.world.world_state import WorldState
from config import settings

# Phase 2-3 Systems
from src.agents.memory.memory_manager import memory_manager
from src.agents.memory.reflection import reflection_engine
from src.technology.discovery_engine import discovery_engine
from src.social.relationship_manager import relationship_manager
from src.social.conversation_engine import conversation_engine
from src.settlements.settlement_detector import settlement_detector
from src.economy.trade_system import trade_system
from src.culture.culture_system import culture_system
from src.diplomacy.diplomacy_system import diplomacy_system
from src.governance.leadership_system import leadership_system
# GOAP Planning System
from src.planning.goap_system import goap_system, ActionType
# Conflict Mechanics
from src.conflict.combat_system import combat_system, CombatParticipant, ConflictType
from src.conflict.war_system import war_system, WarGoal

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

        # Phase 2-3: All systems are global singletons, no initialization needed
        # They're imported and ready to use
        logger.info("All Phase 2-3 systems loaded")

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

        # Phase 2-3: Check for social interactions
        if self.tick_count % 10 == 0:  # Every 10 ticks
            await self._check_social_interactions()

        # Phase 2-3: Check for settlement formation
        if self.tick_count % 50 == 0:  # Every 50 ticks
            self._check_settlement_formation()

        # Phase 2-3: Update settlements
        if self.tick_count % 20 == 0:  # Every 20 ticks
            self._update_settlements()

        # Phase 2-3: Decay relationships and diplomacy
        if self.tick_count % 100 == 0:  # Every 100 ticks
            relationship_manager.decay_relationships(hours_elapsed=1.0)
            diplomacy_system.decay_relationships(hours_elapsed=1.0)

        # Conflict mechanics: Check for conflicts periodically
        if self.tick_count % 150 == 0:  # Every 150 ticks
            await self._check_for_conflicts()

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
        Execute agent behavior logic with GOAP planning.

        The agent now uses Goal-Oriented Action Planning (GOAP) to create
        intelligent multi-step plans to achieve goals.

        Phase 2-3 additions:
        - Technology discovery attempts
        - Reflection triggers
        - Trade opportunities
        - LLM integration for narratives
        """
        # Phase 2-3: Check for reflection (now async with LLM)
        if reflection_engine.should_reflect(agent.id, agent.to_dict()):
            await reflection_engine.perform_reflection(agent.id, agent.name)

        # Phase 2-3: Check for technology discovery (now async with LLM)
        simulation_days = (self.simulation_time - agent.birth_time).days
        
        # Build agent context for LLM narrative generation
        agent_context = {
            "location": agent.position,
            "recent_activities": [agent.current_activity],
            "needs": agent.needs.to_dict(),
            "inventory": agent.inventory
        }
        
        discovered_tech = await discovery_engine.check_for_discovery(
            agent.id,
            agent.name,
            agent.current_activity,
            simulation_days,
            agent_context
        )

        if discovered_tech:
            # Technology discovered! Emit event
            self._emit_event({
                "type": "technology_discovered",
                "agent_id": agent.id,
                "agent_name": agent.name,
                "technology": discovered_tech["display_name"],
                "timestamp": self.simulation_time.isoformat()
            })

        # Phase 2-3: Check if agent is in conversation
        if conversation_engine.is_in_conversation(agent.id):
            # Don't interrupt ongoing conversations
            agent.current_activity = "socializing"
            return

        # GOAP Planning: Get next action from planning system
        # Build agent data with environmental awareness
        alive_agents = [a for a in self.agents if a.is_alive and a.id != agent.id]
        nearby_agents = [
            a for a in alive_agents
            if self._distance(agent.position, a.position) < 10.0
        ]
        nearby_resources = self.world.get_resources_near(agent.position, radius=5.0)
        
        agent_data = agent.to_dict()
        agent_data["near_resources"] = len(nearby_resources) > 0
        agent_data["near_agents"] = len(nearby_agents) > 0
        
        next_action = goap_system.update_agent_plan(agent.id, agent_data)
        
        if next_action:
            # Execute the planned action
            await self._execute_goap_action(agent, next_action, nearby_resources, nearby_agents)
        else:
            # Fallback: Use simple needs-based behavior if GOAP returns nothing
            await self._simple_behavior_fallback(agent)

    async def _execute_goap_action(self, agent: Agent, action, nearby_resources, nearby_agents):
        """Execute a GOAP planned action."""
        
        if action.action_type == ActionType.GATHER_FOOD:
            agent.current_activity = "gathering_food"
            # Find and gather food
            berry_bushes = [r for r in nearby_resources if r["resource_type"] == "bush"
                           and not r.get("is_depleted", False)]
            
            if berry_bushes:
                bush = berry_bushes[0]
                # Move towards bush if not there
                if self._distance(agent.position, bush["position"]) > 1.0:
                    agent.set_target_position(bush["position"])
                else:
                    # Harvest
                    harvested = self.world.harvest_resource(bush, amount=1)
                    if harvested > 0:
                        agent.gather_resource("berries", harvested)
                        trade_system.record_activity(agent.id, "gathering_resources", {"berries": harvested})
                        
                        memory_manager.create_memory(
                            agent_id=agent.id,
                            memory_type="episodic",
                            content=f"I gathered {harvested} berries from a bush.",
                            importance_score=3.0,
                            metadata={"location": agent.position, "activity": "gathering"}
                        )
            else:
                # No food nearby, need to explore first
                agent.current_activity = "seeking_food"
                
        elif action.action_type == ActionType.EAT_FOOD:
            agent.current_activity = "eating"
            if agent.inventory.get("berries", 0) > 0:
                agent.inventory["berries"] -= 1
                agent.eat_food(20.0)
                
                memory_manager.create_memory(
                    agent_id=agent.id,
                    memory_type="episodic",
                    content=f"I ate berries to satisfy my hunger.",
                    importance_score=4.0,
                    metadata={"location": agent.position, "activity": "eating"}
                )
                
        elif action.action_type == ActionType.REST:
            agent.current_activity = "sleeping"
            agent.rest()
            agent.target_position = None
            
        elif action.action_type == ActionType.SOCIALIZE:
            agent.current_activity = "socializing"
            # Social interaction will be handled by _check_social_interactions
            
        elif action.action_type == ActionType.EXPLORE:
            agent.current_activity = "exploring"
            # Wander to explore
            if not agent.target_position:
                # Set random target nearby
                import random
                angle = random.random() * 2 * 3.14159
                distance = 20.0
                target_x = agent.position[0] + distance * random.random() * (1 if random.random() > 0.5 else -1)
                target_y = agent.position[1] + distance * random.random() * (1 if random.random() > 0.5 else -1)
                
                # Clamp to world bounds
                target_x = max(0, min(self.world_size - 1, target_x))
                target_y = max(0, min(self.world_size - 1, target_y))
                
                agent.set_target_position((target_x, target_y))
                
            trade_system.record_activity(agent.id, "exploring")

    async def _simple_behavior_fallback(self, agent: Agent):
        """Simple needs-based behavior as fallback when GOAP doesn't provide action."""
        critical_need = agent.get_critical_need()

        if critical_need == "hunger":
            # Find nearest food source (berries)
            food_resource = self.world.get_nearest_resource(agent.position, "bush")

            if food_resource and not agent.target_position:
                # Move towards food
                agent.set_target_position(food_resource["position"])
                agent.current_activity = "seeking_food"
                trade_system.record_activity(agent.id, "gathering_resources")

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
                        trade_system.record_activity(agent.id, "gathering_resources", {"berries": harvested})
                        
                        # Eat immediately when hungry
                        if agent.inventory.get("berries", 0) > 0:
                            agent.inventory["berries"] -= 1
                            agent.eat_food(20.0)
                            
                            memory_manager.create_memory(
                                agent_id=agent.id,
                                memory_type="episodic",
                                content=f"I gathered and ate berries to satisfy my hunger.",
                                importance_score=4.0,
                                metadata={"location": agent.position, "activity": "eating"}
                            )

        elif critical_need == "energy":
            # Rest to restore energy
            if agent.current_activity != "sleeping":
                agent.rest()
                agent.target_position = None

        elif critical_need == "social":
            # Seek social interaction
            agent.current_activity = "seeking_social"
            # This will be handled by _check_social_interactions

        else:
            # No critical needs - check for trade opportunities
            if random.random() < 0.05:  # 5% chance per tick
                self._check_trade_opportunity(agent)
            
            # Otherwise wander or idle
            if agent.current_activity in ["seeking_food", "sleeping"]:
                agent.current_activity = "idle"

    async def _check_social_interactions(self):
        """Phase 2-3: Check for social interactions between nearby agents."""
        alive_agents = [a for a in self.agents if a.is_alive]

        for i, agent_a in enumerate(alive_agents):
            # Skip if already in conversation
            if conversation_engine.is_in_conversation(agent_a.id):
                continue

            # Find nearby agents
            nearby = relationship_manager.get_nearby_agents_for_interaction(
                agent_a.id,
                [a.to_dict() for a in alive_agents],
                radius=5.0
            )

            if not nearby:
                continue

            # Pick a random nearby agent
            agent_b_id = random.choice(nearby)
            agent_b = next((a for a in alive_agents if a.id == agent_b_id), None)

            if not agent_b or conversation_engine.is_in_conversation(agent_b.id):
                continue

            # Check if they can start conversation
            if conversation_engine.can_start_conversation(agent_a.id, agent_b.id):
                # Build agent contexts for LLM-based conversations
                agent_a_context = {
                    "memories": memory_manager.get_recent_memories(agent_a.id, hours=24, limit=5),
                    "position": agent_a.position,
                    "needs": agent_a.needs.to_dict(),
                    "current_activity": agent_a.current_activity
                }
                
                agent_b_context = {
                    "memories": memory_manager.get_recent_memories(agent_b.id, hours=24, limit=5),
                    "position": agent_b.position,
                    "needs": agent_b.needs.to_dict(),
                    "current_activity": agent_b.current_activity
                }
                
                # Initiate conversation
                context = {
                    "has_critical_need": agent_a.get_critical_need() is not None
                }

                conv = conversation_engine.initiate_conversation(
                    agent_a.id,
                    agent_a.name,
                    agent_b.id,
                    agent_b.name,
                    context
                )

                if conv:
                    # Continue conversation for a few turns (now async with LLM)
                    for _ in range(random.randint(2, 4)):
                        continued = await conversation_engine.continue_conversation(
                            conv.id,
                            agent_a.id,
                            agent_a.name,
                            agent_b.id,
                            agent_b.name,
                            agent_a_context,
                            agent_b_context
                        )
                        if not continued:
                            break

                    self._emit_event({
                        "type": "conversation",
                        "participants": [agent_a.name, agent_b.name],
                        "topic": conv.topic,
                        "timestamp": self.simulation_time.isoformat()
                    })

            # Only one conversation per check to avoid overwhelming
            break

    def _check_settlement_formation(self):
        """Phase 2-3: Check for settlement formation."""
        agent_data = [a.to_dict() for a in self.agents]
        
        settlement_detector.check_for_settlement_formation(
            agents=agent_data,
            min_group_size=3,
            proximity_radius=15.0,
            stability_hours=0.5  # Faster for testing
        )

        # Check for new settlements
        settlements = settlement_detector.get_all_settlements()
        if settlements:
            for settlement in settlements:
                # Create settlement culture
                culture_system.create_or_get_culture(settlement.id, settlement.name)

                # Assign agents to culture
                for agent_id in settlement.member_ids:
                    culture_system.assign_agent_to_culture(agent_id, settlement.id)

                # Check for leadership emergence
                leadership_system.update_leadership_scores(
                    settlement.id,
                    [a.to_dict() for a in self.agents if a.id in settlement.member_ids],
                    settlement.to_dict()
                )

                leadership_system.check_for_leadership_emergence(
                    settlement.id,
                    settlement.name,
                    settlement.population,
                    (datetime.now() - settlement.founded_at).days
                )

    def _update_settlements(self):
        """Phase 2-3: Update existing settlements."""
        agent_data = [a.to_dict() for a in self.agents]
        
        # Update settlement membership
        settlement_detector.update_settlements(agent_data)

        # Update cultures
        settlements = settlement_detector.get_all_settlements()
        for settlement in settlements:
            # Check for cultural trait development
            culture_system.check_and_develop_traits(
                settlement.id,
                settlement.to_dict(),
                [a.to_dict() for a in self.agents if a.id in settlement.member_ids]
            )

            # Update leadership approval ratings
            leadership_system.update_approval_ratings(
                settlement.id,
                settlement_prosperity=50.0,  # Placeholder
                conflicts=0,
                cooperation=1
            )

    def _check_trade_opportunity(self, agent: Agent):
        """Phase 2-3: Check if agent should seek trade."""
        trade_need = trade_system.evaluate_trade_need(
            agent.id,
            agent.inventory,
            agent.needs.to_dict()
        )

        if not trade_need:
            return

        offering_items, requesting_items = trade_need

        # Find nearby agents
        alive_agents = [a for a in self.agents if a.is_alive and a.id != agent.id]
        nearby = relationship_manager.get_nearby_agents_for_interaction(
            agent.id,
            [a.to_dict() for a in alive_agents],
            radius=10.0
        )

        if not nearby:
            return

        # Create trade offer to random nearby agent
        target_id = random.choice(nearby)
        target_agent = next((a for a in alive_agents if a.id == target_id), None)

        if not target_agent:
            return

        # Create trade offer
        offer = trade_system.create_trade_offer(
            agent.id,
            target_id,
            offering_items,
            requesting_items
        )

        # Evaluate if target accepts
        rel = relationship_manager.get_relationship(agent.id, target_id)
        relationship_score = rel.relationship_score if rel else 0.0

        accepts = trade_system.evaluate_trade_offer(
            offer.id,
            target_agent.inventory,
            target_agent.needs.to_dict(),
            relationship_score
        )

        if accepts:
            # Execute trade
            success = trade_system.execute_trade(
                offer.id,
                agent.inventory,
                target_agent.inventory
            )

            if success:
                # Positive relationship impact
                relationship_manager.handle_positive_interaction(agent.id, target_id, "cooperation")

                self._emit_event({
                    "type": "trade_completed",
                    "agents": [agent.name, target_agent.name],
                    "timestamp": self.simulation_time.isoformat()
                })
        else:
            # Trade rejected
            trade_system.reject_trade(offer.id)

    def set_simulation_speed(self, speed: float):
        """Set simulation speed multiplier."""
        self.simulation_speed = max(0.1, min(10.0, speed))
        logger.info(f"Simulation speed set to {self.simulation_speed}x")

    def get_simulation_state(self) -> Dict:
        """Get current simulation state."""
        settlements = settlement_detector.get_all_settlements()
        
        return {
            "is_running": self.is_running,
            "simulation_speed": self.simulation_speed,
            "tick_count": self.tick_count,
            "simulation_time": self.simulation_time.isoformat(),
            "agent_count": len(self.agents),
            "alive_agent_count": sum(1 for a in self.agents if a.is_alive),
            "world_summary": self.world.get_world_summary(),
            "tick_duration": self.tick_duration,
            # Phase 2-3 additions
            "settlement_count": len(settlements),
            "total_technologies_known": len(set(
                tech 
                for agent in self.agents 
                for tech in discovery_engine.get_agent_technologies(agent.id)
            )),
            "active_conversations": len(conversation_engine.active_conversations),
            "trade_statistics": trade_system.get_trade_statistics(),
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

    def _distance(self, pos1: tuple, pos2: tuple) -> float:
        """Calculate distance between two positions."""
        dx = pos1[0] - pos2[0]
        dy = pos1[1] - pos2[1]
        return (dx * dx + dy * dy) ** 0.5
