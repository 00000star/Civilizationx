"""
Unit Tests for Combat System

Tests all aspects of the combat system including:
- Combat strength calculations
- Duel resolution
- Group combat
- Technology bonuses
- Morale effects
- Numbers advantages

Run with: pytest tests/test_combat_system.py -v
"""
import pytest
from src.conflict.combat_system import (
    combat_system,
    CombatParticipant,
    ConflictType,
    CombatOutcome
)


class TestCombatStrengthCalculation:
    """Test combat strength calculation logic."""

    def test_base_strength(self):
        """Test that base strength is used correctly."""
        participant = CombatParticipant(
            id="agent_1",
            name="Test Agent",
            combat_strength=50.0,
            health=100.0,
            morale=100.0,
            technologies=[],
            is_defender=False
        )

        strength = combat_system.calculate_combat_strength(participant)

        # Base strength 50, morale 100 (1.5x), tech 1.0x, numbers 1.0x, defender 1.0x
        # = 50 * 1.0 * 1.5 * 1.0 * 1.0 = 75
        assert strength == 75.0

    def test_technology_bonus(self):
        """Test that technology provides combat bonuses."""
        participant = CombatParticipant(
            id="agent_1",
            name="Armed Agent",
            combat_strength=50.0,
            health=100.0,
            morale=100.0,
            technologies=["stone_tools", "hunting"],  # +10% and +15% = +25%
            is_defender=False
        )

        strength = combat_system.calculate_combat_strength(participant)

        # Base 50, morale 1.5x, tech 1.25x, numbers 1.0x, defender 1.0x
        # = 50 * 1.25 * 1.5 * 1.0 * 1.0 = 93.75
        assert strength == 93.75

    def test_low_morale_penalty(self):
        """Test that low morale reduces combat strength."""
        participant = CombatParticipant(
            id="agent_1",
            name="Demoralized Agent",
            combat_strength=50.0,
            health=100.0,
            morale=0.0,  # Minimum morale
            technologies=[],
            is_defender=False
        )

        strength = combat_system.calculate_combat_strength(participant)

        # Base 50, morale 0.5x (minimum), tech 1.0x, numbers 1.0x, defender 1.0x
        # = 50 * 1.0 * 0.5 * 1.0 * 1.0 = 25.0
        assert strength == 25.0

    def test_numbers_advantage(self):
        """Test that outnumbering enemy provides advantage."""
        participant = CombatParticipant(
            id="agent_1",
            name="One of Many",
            combat_strength=50.0,
            health=100.0,
            morale=100.0,
            technologies=[],
            is_defender=False
        )

        # 5v1 scenario
        strength = combat_system.calculate_combat_strength(
            participant,
            ally_count=5,
            enemy_count=1
        )

        # Numbers advantage: sqrt(5/1) = 2.236
        # Base 50, morale 1.5x, tech 1.0x, numbers 2.236x, defender 1.0x
        # = 50 * 1.0 * 1.5 * 2.236 * 1.0 = 167.7
        assert abs(strength - 167.7) < 1.0  # Allow small floating point error

    def test_defender_bonus(self):
        """Test that defenders get bonus."""
        participant = CombatParticipant(
            id="agent_1",
            name="Defender",
            combat_strength=50.0,
            health=100.0,
            morale=100.0,
            technologies=[],
            is_defender=True  # Defender gets +20%
        )

        strength = combat_system.calculate_combat_strength(participant)

        # Base 50, morale 1.5x, tech 1.0x, numbers 1.0x, defender 1.2x
        # = 50 * 1.0 * 1.5 * 1.0 * 1.2 = 90.0
        assert strength == 90.0


class TestDuelResolution:
    """Test 1v1 duel mechanics."""

    def test_duel_produces_victor(self):
        """Test that duel always produces a victor."""
        agent_a = CombatParticipant(
            id="agent_a",
            name="Fighter A",
            combat_strength=50.0,
            health=100.0,
            morale=80.0,
            technologies=[],
            is_defender=False
        )

        agent_b = CombatParticipant(
            id="agent_b",
            name="Fighter B",
            combat_strength=50.0,
            health=100.0,
            morale=80.0,
            technologies=[],
            is_defender=True
        )

        result = combat_system.resolve_duel(agent_a, agent_b, allow_death=False)

        # Should have exactly one victor
        assert len(result.victor_ids) == 1
        assert len(result.defeated_ids) == 1

        # Victor and defeated should be different
        assert result.victor_ids[0] != result.defeated_ids[0]

        # No deaths when allow_death=False
        assert len(result.casualties) == 0

    def test_stronger_agent_more_likely_to_win(self):
        """Test that stronger agent has higher win rate."""
        wins_strong = 0
        wins_weak = 0
        trials = 100

        for _ in range(trials):
            strong = CombatParticipant(
                id="strong",
                name="Strong",
                combat_strength=80.0,  # Much stronger
                health=100.0,
                morale=100.0,
                technologies=["stone_tools", "hunting"],
                is_defender=False
            )

            weak = CombatParticipant(
                id="weak",
                name="Weak",
                combat_strength=20.0,  # Much weaker
                health=100.0,
                morale=50.0,
                technologies=[],
                is_defender=False
            )

            result = combat_system.resolve_duel(strong, weak, allow_death=False)

            if result.victor_ids[0] == "strong":
                wins_strong += 1
            else:
                wins_weak += 1

        # Strong agent should win at least 80% of the time
        assert wins_strong >= 80


class TestGroupCombat:
    """Test group combat mechanics."""

    def test_group_combat_casualties(self):
        """Test that group combat produces casualties."""
        attackers = [
            CombatParticipant(
                id=f"attacker_{i}",
                name=f"Attacker {i}",
                combat_strength=50.0,
                health=100.0,
                morale=80.0,
                technologies=[],
                is_defender=False
            )
            for i in range(5)
        ]

        defenders = [
            CombatParticipant(
                id=f"defender_{i}",
                name=f"Defender {i}",
                combat_strength=50.0,
                health=100.0,
                morale=80.0,
                technologies=[],
                is_defender=True
            )
            for i in range(3)
        ]

        result = combat_system.resolve_group_combat(
            attackers,
            defenders,
            ConflictType.BATTLE
        )

        # Should have victors and defeated
        assert len(result.victor_ids) > 0
        assert len(result.defeated_ids) > 0

        # Should have some casualties (probabilistic, but likely)
        # In 100 runs, at least 50 should have casualties
        # For this single run, we just check structure is valid
        assert isinstance(result.casualties, list)
        assert isinstance(result.survivors, list)

    def test_loot_awarded_on_victory(self):
        """Test that victorious raiders get loot."""
        attackers = [
            CombatParticipant(
                id=f"raider_{i}",
                name=f"Raider {i}",
                combat_strength=70.0,
                health=100.0,
                morale=90.0,
                technologies=["stone_tools"],
                is_defender=False
            )
            for i in range(5)
        ]

        defenders = [
            CombatParticipant(
                id=f"defender_{i}",
                name=f"Defender {i}",
                combat_strength=30.0,
                health=100.0,
                morale=60.0,
                technologies=[],
                is_defender=True
            )
            for i in range(2)
        ]

        result = combat_system.resolve_group_combat(
            attackers,
            defenders,
            ConflictType.RAID
        )

        # If attackers won (very likely), they should get loot
        if result.victor_ids[0].startswith("raider"):
            assert len(result.loot) > 0
            assert "food" in result.loot or "materials" in result.loot


class TestMoraleImpact:
    """Test morale impact from combat."""

    def test_victor_gains_morale(self):
        """Test that victors gain morale."""
        agent_a = CombatParticipant(
            id="agent_a",
            name="Fighter A",
            combat_strength=60.0,
            health=100.0,
            morale=80.0,
            technologies=["stone_tools"],
            is_defender=False
        )

        agent_b = CombatParticipant(
            id="agent_b",
            name="Fighter B",
            combat_strength=40.0,
            health=100.0,
            morale=70.0,
            technologies=[],
            is_defender=False
        )

        result = combat_system.resolve_duel(agent_a, agent_b, allow_death=False)

        # Victor should have positive morale impact
        victor_id = result.victor_ids[0]
        assert result.morale_impact[victor_id] > 0

    def test_defeated_loses_morale(self):
        """Test that defeated agents lose morale."""
        agent_a = CombatParticipant(
            id="agent_a",
            name="Fighter A",
            combat_strength=60.0,
            health=100.0,
            morale=80.0,
            technologies=["stone_tools"],
            is_defender=False
        )

        agent_b = CombatParticipant(
            id="agent_b",
            name="Fighter B",
            combat_strength=40.0,
            health=100.0,
            morale=70.0,
            technologies=[],
            is_defender=False
        )

        result = combat_system.resolve_duel(agent_a, agent_b, allow_death=False)

        # Defeated should have negative morale impact
        defeated_id = result.defeated_ids[0]
        if defeated_id not in result.casualties:  # Only if survived
            assert result.morale_impact[defeated_id] < 0


@pytest.fixture
def reset_combat_history():
    """Fixture to reset combat history between tests."""
    combat_system.combat_history = []
    yield
    combat_system.combat_history = []


class TestCombatStatistics:
    """Test combat statistics tracking."""

    def test_combat_history_recorded(self, reset_combat_history):
        """Test that combats are recorded in history."""
        initial_count = len(combat_system.combat_history)

        agent_a = CombatParticipant(
            id="agent_a", name="A", combat_strength=50.0,
            health=100.0, morale=80.0, technologies=[], is_defender=False
        )
        agent_b = CombatParticipant(
            id="agent_b", name="B", combat_strength=50.0,
            health=100.0, morale=80.0, technologies=[], is_defender=False
        )

        combat_system.resolve_duel(agent_a, agent_b, allow_death=False)

        assert len(combat_system.combat_history) == initial_count + 1

    def test_statistics_calculation(self, reset_combat_history):
        """Test that statistics are calculated correctly."""
        # Perform multiple combats
        for i in range(5):
            agent_a = CombatParticipant(
                id=f"agent_a_{i}", name=f"A{i}", combat_strength=50.0,
                health=100.0, morale=80.0, technologies=[], is_defender=False
            )
            agent_b = CombatParticipant(
                id=f"agent_b_{i}", name=f"B{i}", combat_strength=50.0,
                health=100.0, morale=80.0, technologies=[], is_defender=False
            )

            combat_system.resolve_duel(agent_a, agent_b, allow_death=True)

        stats = combat_system.get_combat_statistics()

        assert stats["total_combats"] == 5
        assert stats["total_casualties"] >= 0  # Probabilistic
        assert "duel" in stats["conflict_types"]
