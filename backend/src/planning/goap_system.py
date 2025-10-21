"""GOAP (Goal-Oriented Action Planning) system for intelligent agent behavior."""
import logging
from typing import List, Dict, Optional, Set, Tuple
from dataclasses import dataclass, field
from enum import Enum
import heapq

logger = logging.getLogger(__name__)


class ActionType(Enum):
    """Types of actions agents can perform."""
    GATHER_FOOD = "gather_food"
    EAT_FOOD = "eat_food"
    REST = "rest"
    SOCIALIZE = "socialize"
    EXPLORE = "explore"
    CRAFT_TOOL = "craft_tool"
    BUILD_SHELTER = "build_shelter"
    HUNT = "hunt"
    TEACH_TECHNOLOGY = "teach_technology"
    LEARN_TECHNOLOGY = "learn_technology"
    TRADE = "trade"


@dataclass
class WorldState:
    """Represents the current state of the world from agent's perspective."""
    # Agent state
    hunger_level: float = 100.0  # 0-100
    energy_level: float = 100.0  # 0-100
    social_level: float = 100.0  # 0-100

    # Inventory
    has_food: bool = False
    has_tools: bool = False
    has_shelter: bool = False
    food_count: int = 0

    # Location/environment
    near_food_source: bool = False
    near_other_agents: bool = False
    at_shelter: bool = False
    safe_location: bool = True

    # Knowledge
    knows_technologies: Set[str] = field(default_factory=set)

    def copy(self) -> 'WorldState':
        """Create a copy of this world state."""
        return WorldState(
            hunger_level=self.hunger_level,
            energy_level=self.energy_level,
            social_level=self.social_level,
            has_food=self.has_food,
            has_tools=self.has_tools,
            has_shelter=self.has_shelter,
            food_count=self.food_count,
            near_food_source=self.near_food_source,
            near_other_agents=self.near_other_agents,
            at_shelter=self.at_shelter,
            safe_location=self.safe_location,
            knows_technologies=self.knows_technologies.copy()
        )

    def satisfies(self, conditions: Dict) -> bool:
        """Check if this state satisfies given conditions."""
        for key, value in conditions.items():
            if not hasattr(self, key):
                return False

            current_value = getattr(self, key)

            # Handle different comparison types
            if isinstance(value, tuple):  # Range check (min, max)
                if not (value[0] <= current_value <= value[1]):
                    return False
            elif isinstance(value, str) and value.startswith('>'):
                threshold = float(value[1:])
                if current_value <= threshold:
                    return False
            elif isinstance(value, str) and value.startswith('<'):
                threshold = float(value[1:])
                if current_value >= threshold:
                    return False
            else:
                if current_value != value:
                    return False

        return True


@dataclass
class Goal:
    """Represents a goal an agent wants to achieve."""
    name: str
    desired_state: Dict
    priority: float  # Higher = more important

    def is_satisfied(self, world_state: WorldState) -> bool:
        """Check if goal is satisfied in given world state."""
        return world_state.satisfies(self.desired_state)


@dataclass
class Action:
    """Represents an action an agent can perform."""
    action_type: ActionType
    name: str
    preconditions: Dict  # Conditions that must be true
    effects: Dict  # Changes to world state
    cost: float  # Cost to perform action (for planning)

    def can_perform(self, world_state: WorldState) -> bool:
        """Check if action can be performed in given world state."""
        return world_state.satisfies(self.preconditions)

    def apply_effects(self, world_state: WorldState) -> WorldState:
        """Apply action effects to world state, returning new state."""
        new_state = world_state.copy()

        for key, value in self.effects.items():
            if hasattr(new_state, key):
                if isinstance(value, str) and value.startswith('+'):
                    # Increment
                    current = getattr(new_state, key)
                    delta = float(value[1:])
                    setattr(new_state, key, current + delta)
                elif isinstance(value, str) and value.startswith('-'):
                    # Decrement
                    current = getattr(new_state, key)
                    delta = float(value[1:])
                    setattr(new_state, key, current - delta)
                else:
                    # Direct set
                    setattr(new_state, key, value)

        return new_state


@dataclass(order=True)
class PlanNode:
    """Node in A* search for planning."""
    f_score: float
    state: WorldState = field(compare=False)
    actions: List[Action] = field(default_factory=list, compare=False)
    g_score: float = field(default=0.0, compare=False)


class GOAPPlanner:
    """GOAP planner using A* search to find action sequences."""

    def __init__(self):
        self.actions: List[Action] = []
        self._initialize_actions()

    def _initialize_actions(self):
        """Initialize available actions."""
        self.actions = [
            # Gather food action
            Action(
                action_type=ActionType.GATHER_FOOD,
                name="Gather Food",
                preconditions={"near_food_source": True},
                effects={"has_food": True, "food_count": "+1"},
                cost=2.0
            ),

            # Eat food action
            Action(
                action_type=ActionType.EAT_FOOD,
                name="Eat Food",
                preconditions={"has_food": True},
                effects={"hunger_level": "+20", "has_food": False, "food_count": "-1"},
                cost=1.0
            ),

            # Rest action
            Action(
                action_type=ActionType.REST,
                name="Rest",
                preconditions={},
                effects={"energy_level": "+30"},
                cost=2.0
            ),

            # Socialize action
            Action(
                action_type=ActionType.SOCIALIZE,
                name="Socialize",
                preconditions={"near_other_agents": True},
                effects={"social_level": "+15"},
                cost=1.5
            ),

            # Explore action
            Action(
                action_type=ActionType.EXPLORE,
                name="Explore",
                preconditions={},
                effects={"near_food_source": True},  # Simplified - exploring finds resources
                cost=3.0
            ),
        ]

    def plan(self, current_state: WorldState, goal: Goal, max_iterations: int = 100) -> Optional[List[Action]]:
        """
        Create a plan to achieve goal using A* search.

        Args:
            current_state: Current world state
            goal: Goal to achieve
            max_iterations: Maximum planning iterations

        Returns:
            List of actions to perform, or None if no plan found
        """
        if goal.is_satisfied(current_state):
            return []  # Goal already satisfied

        # A* search
        open_list = []
        closed_set = set()

        start_node = PlanNode(
            f_score=self._heuristic(current_state, goal),
            state=current_state,
            actions=[],
            g_score=0.0
        )

        heapq.heappush(open_list, start_node)
        iterations = 0

        while open_list and iterations < max_iterations:
            iterations += 1
            current_node = heapq.heappop(open_list)

            # Goal check
            if goal.is_satisfied(current_node.state):
                logger.info(f"Plan found with {len(current_node.actions)} actions (iterations: {iterations})")
                return current_node.actions

            # Add to closed set
            state_hash = self._hash_state(current_node.state)
            if state_hash in closed_set:
                continue
            closed_set.add(state_hash)

            # Explore neighbors (apply each possible action)
            for action in self.actions:
                if action.can_perform(current_node.state):
                    new_state = action.apply_effects(current_node.state)
                    new_actions = current_node.actions + [action]
                    new_g_score = current_node.g_score + action.cost
                    new_h_score = self._heuristic(new_state, goal)
                    new_f_score = new_g_score + new_h_score

                    new_node = PlanNode(
                        f_score=new_f_score,
                        state=new_state,
                        actions=new_actions,
                        g_score=new_g_score
                    )

                    heapq.heappush(open_list, new_node)

        logger.warning(f"No plan found after {iterations} iterations")
        return None

    def _heuristic(self, state: WorldState, goal: Goal) -> float:
        """Estimate cost to reach goal from state."""
        cost = 0.0

        for key, desired_value in goal.desired_state.items():
            if hasattr(state, key):
                current_value = getattr(state, key)

                if isinstance(current_value, (int, float)) and isinstance(desired_value, (int, float)):
                    # Numerical difference
                    cost += abs(current_value - desired_value) / 10.0
                elif current_value != desired_value:
                    # Boolean or other difference
                    cost += 1.0

        return cost

    def _hash_state(self, state: WorldState) -> str:
        """Create hash of world state for closed set."""
        return f"{state.hunger_level:.1f}_{state.energy_level:.1f}_{state.social_level:.1f}_{state.has_food}_{state.near_food_source}"


class GOAPSystem:
    """Main GOAP system managing agent planning."""

    def __init__(self):
        self.planner = GOAPPlanner()

        # Agent plans: agent_id -> (goal, plan, current_action_index)
        self.agent_plans: Dict[str, Tuple[Goal, List[Action], int]] = {}

    def update_agent_plan(self, agent_id: str, agent_data: Dict) -> Optional[Action]:
        """
        Update agent's plan and return next action to perform.

        Args:
            agent_id: Agent's ID
            agent_data: Agent's current data

        Returns:
            Next action to perform, or None
        """
        # Build current world state from agent data
        current_state = self._build_world_state(agent_data)

        # Check if agent has a plan
        if agent_id in self.agent_plans:
            goal, plan, action_index = self.agent_plans[agent_id]

            # Check if goal still relevant
            if goal.is_satisfied(current_state):
                # Goal achieved!
                logger.info(f"Agent {agent_id[:8]} achieved goal: {goal.name}")
                del self.agent_plans[agent_id]
                return None

            # Check if plan is still valid
            if action_index < len(plan):
                next_action = plan[action_index]
                if next_action.can_perform(current_state):
                    # Advance to next action
                    self.agent_plans[agent_id] = (goal, plan, action_index + 1)
                    return next_action
                else:
                    # Plan broken, replan
                    logger.info(f"Agent {agent_id[:8]} plan broken, replanning")
                    del self.agent_plans[agent_id]
            else:
                # Plan completed but goal not achieved, replan
                del self.agent_plans[agent_id]

        # Need new plan - select goal and plan
        goal = self._select_goal(current_state)
        if not goal:
            return None

        plan = self.planner.plan(current_state, goal)
        if plan:
            self.agent_plans[agent_id] = (goal, plan, 0)
            logger.info(f"Agent {agent_id[:8]} created plan for goal '{goal.name}' with {len(plan)} actions")
            if plan:
                # Execute first action
                self.agent_plans[agent_id] = (goal, plan, 1)
                return plan[0]

        return None

    def _build_world_state(self, agent_data: Dict) -> WorldState:
        """Build world state from agent data."""
        needs = agent_data.get("needs", {})
        inventory = agent_data.get("inventory", {})

        return WorldState(
            hunger_level=needs.get("hunger", 100.0),
            energy_level=needs.get("energy", 100.0),
            social_level=needs.get("social", 100.0),
            has_food=inventory.get("berries", 0) > 0,
            food_count=inventory.get("berries", 0),
            has_tools=inventory.get("tools", 0) > 0,
            near_food_source=agent_data.get("near_resources", False),
            near_other_agents=agent_data.get("near_agents", False),
            knows_technologies=set(agent_data.get("technologies", []))
        )

    def _select_goal(self, current_state: WorldState) -> Optional[Goal]:
        """Select most important goal for current state."""
        goals = []

        # Survival goals
        if current_state.hunger_level < 50:
            goals.append(Goal(
                name="Satisfy Hunger",
                desired_state={"hunger_level": ">70"},
                priority=10.0 - (current_state.hunger_level / 10.0)
            ))

        if current_state.energy_level < 40:
            goals.append(Goal(
                name="Restore Energy",
                desired_state={"energy_level": ">70"},
                priority=8.0
            ))

        if current_state.social_level < 30:
            goals.append(Goal(
                name="Socialize",
                desired_state={"social_level": ">60"},
                priority=5.0
            ))

        # Preparation goals (lower priority)
        if not current_state.has_food:
            goals.append(Goal(
                name="Acquire Food",
                desired_state={"has_food": True},
                priority=6.0
            ))

        if not goals:
            return None

        # Select highest priority goal
        goals.sort(key=lambda g: g.priority, reverse=True)
        return goals[0]

    def get_agent_plan_summary(self, agent_id: str) -> Optional[Dict]:
        """Get summary of agent's current plan."""
        if agent_id not in self.agent_plans:
            return None

        goal, plan, action_index = self.agent_plans[agent_id]
        return {
            "goal": goal.name,
            "total_actions": len(plan),
            "completed_actions": action_index,
            "remaining_actions": len(plan) - action_index,
            "next_action": plan[action_index].name if action_index < len(plan) else "None"
        }


# Global instance
goap_system = GOAPSystem()
