"""Agent class definition for Phase 1."""
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import uuid


@dataclass
class AgentNeeds:
    """Agent needs (hunger, energy, social)."""
    hunger: float = 100.0  # 0 = starving, 100 = full
    energy: float = 100.0  # 0 = exhausted, 100 = fully rested
    social: float = 100.0  # 0 = isolated, 100 = socially fulfilled

    def decay(self, delta_time: float, activity_type: str = "idle"):
        """Decay needs over time based on activity."""
        # Base decay rates per hour
        base_hunger_decay = 2.0
        base_energy_decay = 1.5
        base_social_decay = 1.0

        # Activity modifiers
        activity_modifiers = {
            "idle": {"hunger": 1.0, "energy": 0.5, "social": 1.0},
            "moving": {"hunger": 1.5, "energy": 1.5, "social": 1.0},
            "gathering": {"hunger": 2.0, "energy": 2.0, "social": 1.0},
            "eating": {"hunger": -5.0, "energy": 0.5, "social": 0.5},
            "sleeping": {"hunger": 0.5, "energy": -8.0, "social": 1.5},
            "socializing": {"hunger": 1.0, "energy": 0.8, "social": -3.0},
        }

        modifier = activity_modifiers.get(activity_type, {"hunger": 1.0, "energy": 1.0, "social": 1.0})

        # Apply decay (delta_time is in seconds, convert to hours)
        hours = delta_time / 3600.0
        self.hunger = max(0.0, min(100.0, self.hunger + base_hunger_decay * modifier["hunger"] * hours))
        self.energy = max(0.0, min(100.0, self.energy + base_energy_decay * modifier["energy"] * hours))
        self.social = max(0.0, min(100.0, self.social + base_social_decay * modifier["social"] * hours))

    def get_critical_need(self) -> Optional[str]:
        """Get the most critical need (below 30)."""
        if self.hunger < 30:
            return "hunger"
        if self.energy < 30:
            return "energy"
        if self.social < 30:
            return "social"
        return None

    def to_dict(self) -> Dict:
        """Convert to dictionary."""
        return {
            "hunger": self.hunger,
            "energy": self.energy,
            "social": self.social
        }


@dataclass
class Agent:
    """
    Agent class for Phase 1.

    Phase 1 features:
    - Basic needs (hunger, energy, social)
    - Simple movement and position
    - Basic state tracking
    - Inventory for gathered resources
    """
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = "Agent"
    position: Tuple[float, float] = (0.0, 0.0)
    birth_time: datetime = field(default_factory=datetime.now)

    # Needs
    needs: AgentNeeds = field(default_factory=AgentNeeds)

    # State
    current_activity: str = "idle"
    is_alive: bool = True

    # Inventory (Phase 1: simple dict of item counts)
    inventory: Dict[str, int] = field(default_factory=dict)

    # Movement
    target_position: Optional[Tuple[float, float]] = None
    movement_speed: float = 2.0  # tiles per second

    # Simple memory (Phase 1: just recent actions)
    recent_actions: List[str] = field(default_factory=list)

    def update(self, delta_time: float):
        """
        Update agent state per simulation tick.

        Args:
            delta_time: Time elapsed since last update (in seconds)
        """
        # Decay needs based on current activity
        self.needs.decay(delta_time, self.current_activity)

        # Check survival
        if self.needs.hunger <= 0 or self.needs.energy <= 0:
            self.is_alive = False
            self.current_activity = "dead"

        # Handle movement
        if self.target_position and self.is_alive:
            self._move_towards_target(delta_time)

    def _move_towards_target(self, delta_time: float):
        """Move towards target position."""
        if not self.target_position:
            return

        dx = self.target_position[0] - self.position[0]
        dy = self.target_position[1] - self.position[1]
        distance = (dx ** 2 + dy ** 2) ** 0.5

        if distance < 0.1:  # Reached target
            self.position = self.target_position
            self.target_position = None
            self.current_activity = "idle"
        else:
            # Move towards target
            move_distance = self.movement_speed * delta_time
            if move_distance >= distance:
                self.position = self.target_position
                self.target_position = None
                self.current_activity = "idle"
            else:
                ratio = move_distance / distance
                new_x = self.position[0] + dx * ratio
                new_y = self.position[1] + dy * ratio
                self.position = (new_x, new_y)
                self.current_activity = "moving"

    def set_target_position(self, target: Tuple[float, float]):
        """Set movement target."""
        self.target_position = target

    def eat_food(self, food_value: float):
        """Consume food to restore hunger."""
        self.needs.hunger = min(100.0, self.needs.hunger + food_value)
        self.current_activity = "eating"
        self.recent_actions.append(f"Ate food (+{food_value} hunger)")

    def rest(self):
        """Rest to restore energy."""
        self.current_activity = "sleeping"

    def gather_resource(self, resource_type: str, quantity: int = 1):
        """Gather a resource."""
        if resource_type not in self.inventory:
            self.inventory[resource_type] = 0
        self.inventory[resource_type] += quantity
        self.current_activity = "gathering"
        self.recent_actions.append(f"Gathered {quantity} {resource_type}")

    def get_critical_need(self) -> Optional[str]:
        """Get most critical need."""
        return self.needs.get_critical_need()

    def to_dict(self) -> Dict:
        """Convert agent to dictionary for serialization."""
        return {
            "id": self.id,
            "name": self.name,
            "position": {"x": self.position[0], "y": self.position[1]},
            "birth_time": self.birth_time.isoformat(),
            "needs": self.needs.to_dict(),
            "current_activity": self.current_activity,
            "is_alive": self.is_alive,
            "inventory": self.inventory,
            "target_position": {
                "x": self.target_position[0],
                "y": self.target_position[1]
            } if self.target_position else None,
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'Agent':
        """Create agent from dictionary."""
        agent = cls(
            id=data["id"],
            name=data["name"],
            position=(data["position"]["x"], data["position"]["y"]),
            birth_time=datetime.fromisoformat(data["birth_time"]),
            current_activity=data.get("current_activity", "idle"),
            is_alive=data.get("is_alive", True),
            inventory=data.get("inventory", {}),
        )

        # Restore needs
        needs_data = data.get("needs", {})
        agent.needs = AgentNeeds(
            hunger=needs_data.get("hunger", 100.0),
            energy=needs_data.get("energy", 100.0),
            social=needs_data.get("social", 100.0)
        )

        # Restore target position
        if data.get("target_position"):
            agent.target_position = (
                data["target_position"]["x"],
                data["target_position"]["y"]
            )

        return agent
