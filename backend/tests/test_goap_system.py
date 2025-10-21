"""
Unit Tests for GOAP Planning System

Tests Goal-Oriented Action Planning including:
- World state representation
- Goal selection and satisfaction
- Action preconditions and effects
- A* planning algorithm
- Multi-step plan execution

Run with: pytest tests/test_goap_system.py -v
"""
import pytest
from src.planning.goap_system import (
    goap_system,
    GOAPPlanner,
    WorldState,
    Goal,
    Action,
    ActionType
)


class TestWorldState:
    """Test world state representation and satisfaction checks."""

    def test_world_state_copy(self):
        """Test that world state copy creates independent instance."""
        original = WorldState(hunger_level=50.0, has_food=True)
        copy = original.copy()

        copy.hunger_level = 80.0
        copy.has_food = False

        assert original.hunger_level == 50.0
        assert original.has_food == True

    def test_satisfies_exact_match(self):
        """Test satisfaction check with exact value match."""
        state = WorldState(has_food=True, near_food_source=False)

        assert state.satisfies({"has_food": True})
        assert not state.satisfies({"has_food": False})
        assert not state.satisfies({"near_food_source": True})

    def test_satisfies_range_check(self):
        """Test satisfaction check with numerical ranges."""
        state = WorldState(hunger_level=75.0)

        # String comparisons (from Goal system)
        assert state.satisfies({"hunger_level": ">70"})
        assert not state.satisfies({"hunger_level": ">80"})
        assert state.satisfies({"hunger_level": "<80"})


class TestGoals:
    """Test goal definition and satisfaction."""

    def test_goal_satisfaction(self):
        """Test that goals correctly detect when they're satisfied."""
        state = WorldState(hunger_level=80.0, energy_level=90.0)

        goal = Goal(
            name="Satisfy Hunger",
            desired_state={"hunger_level": ">70"},
            priority=10.0
        )

        assert goal.is_satisfied(state)

    def test_goal_not_satisfied(self):
        """Test that goals correctly detect when they're not satisfied."""
        state = WorldState(hunger_level=50.0)

        goal = Goal(
            name="Satisfy Hunger",
            desired_state={"hunger_level": ">70"},
            priority=10.0
        )

        assert not goal.is_satisfied(state)


class TestActions:
    """Test action preconditions and effects."""

    def test_action_preconditions(self):
        """Test that action can_perform checks preconditions correctly."""
        action = Action(
            action_type=ActionType.GATHER_FOOD,
            name="Gather Food",
            preconditions={"near_food_source": True},
            effects={"has_food": True},
            cost=2.0
        )

        state_can_perform = WorldState(near_food_source=True)
        state_cannot_perform = WorldState(near_food_source=False)

        assert action.can_perform(state_can_perform)
        assert not action.can_perform(state_cannot_perform)

    def test_action_effects_boolean(self):
        """Test that action effects modify state correctly (boolean)."""
        action = Action(
            action_type=ActionType.GATHER_FOOD,
            name="Gather Food",
            preconditions={"near_food_source": True},
            effects={"has_food": True},
            cost=2.0
        )

        state = WorldState(has_food=False, near_food_source=True)
        new_state = action.apply_effects(state)

        assert new_state.has_food == True
        assert state.has_food == False  # Original unchanged

    def test_action_effects_increment(self):
        """Test that action effects can increment values."""
        action = Action(
            action_type=ActionType.EAT_FOOD,
            name="Eat Food",
            preconditions={"has_food": True},
            effects={"hunger_level": "+20"},
            cost=1.0
        )

        state = WorldState(hunger_level=50.0, has_food=True)
        new_state = action.apply_effects(state)

        assert new_state.hunger_level == 70.0


class TestGOAPPlanner:
    """Test A* planning algorithm."""

    def test_plan_single_action(self):
        """Test planning when goal requires single action."""
        planner = GOAPPlanner()

        current_state = WorldState(
            hunger_level=50.0,
            has_food=True  # Already has food
        )

        goal = Goal(
            name="Satisfy Hunger",
            desired_state={"hunger_level": ">70"},
            priority=10.0
        )

        plan = planner.plan(current_state, goal)

        # Should plan to eat food
        assert plan is not None
        assert len(plan) == 1
        assert plan[0].action_type == ActionType.EAT_FOOD

    def test_plan_multi_action(self):
        """Test planning when goal requires multiple actions."""
        planner = GOAPPlanner()

        current_state = WorldState(
            hunger_level=50.0,
            has_food=False,
            near_food_source=True
        )

        goal = Goal(
            name="Satisfy Hunger",
            desired_state={"hunger_level": ">70"},
            priority=10.0
        )

        plan = planner.plan(current_state, goal)

        # Should plan: gather food → eat food
        assert plan is not None
        assert len(plan) == 2
        assert plan[0].action_type == ActionType.GATHER_FOOD
        assert plan[1].action_type == ActionType.EAT_FOOD

    def test_plan_with_exploration(self):
        """Test planning when exploration is needed."""
        planner = GOAPPlanner()

        current_state = WorldState(
            hunger_level=50.0,
            has_food=False,
            near_food_source=False  # Need to explore first
        )

        goal = Goal(
            name="Satisfy Hunger",
            desired_state={"hunger_level": ">70"},
            priority=10.0
        )

        plan = planner.plan(current_state, goal)

        # Should plan: explore → gather food → eat food
        assert plan is not None
        assert len(plan) == 3
        assert plan[0].action_type == ActionType.EXPLORE
        assert plan[1].action_type == ActionType.GATHER_FOOD
        assert plan[2].action_type == ActionType.EAT_FOOD

    def test_plan_already_satisfied(self):
        """Test planning when goal is already satisfied."""
        planner = GOAPPlanner()

        current_state = WorldState(hunger_level=80.0)

        goal = Goal(
            name="Satisfy Hunger",
            desired_state={"hunger_level": ">70"},
            priority=10.0
        )

        plan = planner.plan(current_state, goal)

        # Should return empty plan (goal already satisfied)
        assert plan is not None
        assert len(plan) == 0


class TestGOAPSystem:
    """Test GOAP system integration."""

    def test_goal_selection_hunger(self):
        """Test that system selects hunger goal when hungry."""
        agent_data = {
            "needs": {"hunger": 30.0, "energy": 80.0, "social": 70.0},
            "inventory": {},
            "near_resources": True,
            "near_agents": False,
            "technologies": []
        }

        state = goap_system._build_world_state(agent_data)
        goal = goap_system._select_goal(state)

        assert goal is not None
        assert goal.name == "Satisfy Hunger"
        assert goal.priority > 5.0  # High priority

    def test_goal_selection_energy(self):
        """Test that system selects energy goal when tired."""
        agent_data = {
            "needs": {"hunger": 80.0, "energy": 30.0, "social": 70.0},
            "inventory": {},
            "near_resources": False,
            "near_agents": False,
            "technologies": []
        }

        state = goap_system._build_world_state(agent_data)
        goal = goap_system._select_goal(state)

        assert goal is not None
        assert goal.name == "Restore Energy"

    def test_update_agent_plan_creates_plan(self):
        """Test that update_agent_plan creates new plan."""
        agent_id = "test_agent_1"
        agent_data = {
            "needs": {"hunger": 40.0, "energy": 80.0, "social": 70.0},
            "inventory": {},
            "near_resources": True,
            "near_agents": False,
            "technologies": []
        }

        # Clear any existing plan
        if agent_id in goap_system.agent_plans:
            del goap_system.agent_plans[agent_id]

        action = goap_system.update_agent_plan(agent_id, agent_data)

        assert action is not None
        assert agent_id in goap_system.agent_plans

    def test_update_agent_plan_advances_plan(self):
        """Test that update_agent_plan advances through plan."""
        agent_id = "test_agent_2"

        # Clear any existing plan
        if agent_id in goap_system.agent_plans:
            del goap_system.agent_plans[agent_id]

        # First call - create plan
        agent_data = {
            "needs": {"hunger": 40.0, "energy": 80.0, "social": 70.0},
            "inventory": {},
            "near_resources": False,  # Will need to explore
            "near_agents": False,
            "technologies": []
        }

        action1 = goap_system.update_agent_plan(agent_id, agent_data)
        assert action1 is not None

        # Second call - should advance to next action
        agent_data["near_resources"] = True  # Now near resources
        action2 = goap_system.update_agent_plan(agent_id, agent_data)

        # Should get next action in plan
        assert action2 is not None

    def test_plan_summary(self):
        """Test getting plan summary."""
        agent_id = "test_agent_3"
        agent_data = {
            "needs": {"hunger": 40.0, "energy": 80.0, "social": 70.0},
            "inventory": {},
            "near_resources": True,
            "near_agents": False,
            "technologies": []
        }

        # Clear existing plan
        if agent_id in goap_system.agent_plans:
            del goap_system.agent_plans[agent_id]

        # Create plan
        goap_system.update_agent_plan(agent_id, agent_data)

        summary = goap_system.get_agent_plan_summary(agent_id)

        assert summary is not None
        assert "goal" in summary
        assert "total_actions" in summary
        assert "next_action" in summary
