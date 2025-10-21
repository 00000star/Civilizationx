"""
Combat System for Agent and Settlement Conflicts

This module handles all forms of combat in the simulation:
- Agent vs Agent duels
- Agent raids on resources/settlements
- Settlement vs Settlement battles
- War mechanics between civilizations

Key Concepts:
- Combat Strength: Calculated from technologies, skills, and numbers
- Morale: Affects combat effectiveness
- Casualties: Agents can die in combat
- Victory Conditions: Determined by strength differential and morale

Documentation:
- Combat is NOT always to the death - agents can retreat
- Technology advantage (weapons, tactics) provides significant bonuses
- Numbers matter - 5v1 is heavily advantageous
- Settlement wars affect diplomatic relations permanently
"""
import logging
import random
from typing import List, Dict, Optional, Tuple
from datetime import datetime
from enum import Enum
from dataclasses import dataclass

logger = logging.getLogger(__name__)


class ConflictType(Enum):
    """Types of conflicts in the simulation."""
    DUEL = "duel"  # 1v1 agent combat
    SKIRMISH = "skirmish"  # Small group combat (2-5 vs 2-5)
    RAID = "raid"  # Attack on resources or small settlement
    BATTLE = "battle"  # Large-scale combat (5+ vs 5+)
    WAR = "war"  # Extended conflict between settlements
    SIEGE = "siege"  # Attack on fortified settlement


class CombatOutcome(Enum):
    """Possible outcomes of combat."""
    DECISIVE_VICTORY = "decisive_victory"  # Complete victory, high casualties for loser
    VICTORY = "victory"  # Clear victory, moderate casualties
    NARROW_VICTORY = "narrow_victory"  # Close victory, casualties on both sides
    STALEMATE = "stalemate"  # No clear winner, both retreat
    RETREAT = "retreat"  # One side retreats before combat concludes


@dataclass
class CombatParticipant:
    """Represents a participant in combat (agent or group)."""
    id: str
    name: str
    combat_strength: float  # Base strength (0-100)
    health: float  # Current health (0-100)
    morale: float  # Morale level (0-100)
    technologies: List[str]  # Known combat technologies
    is_defender: bool = False  # Defender gets bonuses


@dataclass
class CombatResult:
    """Results of a combat encounter."""
    conflict_type: ConflictType
    outcome: CombatOutcome
    victor_ids: List[str]
    defeated_ids: List[str]
    casualties: List[str]  # IDs of agents who died
    survivors: List[str]  # IDs of agents who survived
    loot: Dict[str, int]  # Resources captured
    territory_gained: Optional[Dict] = None
    morale_impact: Dict[str, float] = None  # agent_id -> morale change


class CombatSystem:
    """
    Main combat system handling all conflict resolution.

    Combat Calculation Formula:
    =========================
    Total Strength = Base Strength × Tech Multiplier × Morale Modifier × Numbers Advantage

    - Base Strength: Individual agent's combat capability (0-100)
    - Tech Multiplier: 1.0 + (0.1 per combat tech known), max 2.0
    - Morale Modifier: 0.5 to 1.5 based on morale (0-100)
    - Numbers Advantage: sqrt(your_count / their_count), capped at 3.0

    Victory is probabilistic based on strength ratio.
    """

    def __init__(self):
        # Combat technologies and their bonuses
        self.combat_techs = {
            "stone_tools": 0.1,  # +10% combat strength
            "hunting": 0.15,  # +15% combat strength
            "fire": 0.05,  # Minor advantage (intimidation)
            "basic_weapons": 0.2,  # +20% combat strength
            "advanced_weapons": 0.3,  # +30% combat strength
            "tactics": 0.25,  # +25% combat strength
            "fortifications": 0.4,  # +40% defense only
        }

        # Active conflicts: (agent_a_id, agent_b_id) -> conflict_data
        self.active_conflicts: Dict[Tuple[str, str], Dict] = {}

        # Combat history
        self.combat_history: List[CombatResult] = []

    def calculate_combat_strength(
        self,
        participant: CombatParticipant,
        ally_count: int = 1,
        enemy_count: int = 1
    ) -> float:
        """
        Calculate total combat strength for a participant.

        Args:
            participant: The combat participant
            ally_count: Number of allies including this participant
            enemy_count: Number of enemies

        Returns:
            Total combat strength value
        """
        # Base strength
        strength = participant.combat_strength

        # Technology multiplier (max +100%)
        tech_bonus = sum(
            self.combat_techs.get(tech, 0)
            for tech in participant.technologies
            if tech in self.combat_techs
        )
        tech_multiplier = min(2.0, 1.0 + tech_bonus)

        # Morale modifier (0.5x to 1.5x)
        morale_modifier = 0.5 + (participant.morale / 100.0)

        # Numbers advantage (sqrt ratio, max 3x)
        if enemy_count > 0:
            numbers_advantage = min(3.0, (ally_count / enemy_count) ** 0.5)
        else:
            numbers_advantage = 3.0

        # Defender bonus (+20%)
        defender_bonus = 1.2 if participant.is_defender else 1.0

        # Total strength
        total = strength * tech_multiplier * morale_modifier * numbers_advantage * defender_bonus

        logger.debug(
            f"{participant.name}: base={strength:.1f}, tech={tech_multiplier:.2f}, "
            f"morale={morale_modifier:.2f}, numbers={numbers_advantage:.2f}, "
            f"defender={defender_bonus:.2f} → total={total:.1f}"
        )

        return total

    def resolve_duel(
        self,
        agent_a: CombatParticipant,
        agent_b: CombatParticipant,
        allow_death: bool = True
    ) -> CombatResult:
        """
        Resolve a 1v1 duel between two agents.

        Args:
            agent_a: First combatant
            agent_b: Second combatant
            allow_death: Whether agents can die (False for sparring/training)

        Returns:
            CombatResult with outcome
        """
        logger.info(f"⚔️ DUEL: {agent_a.name} vs {agent_b.name}")

        # Calculate strengths
        strength_a = self.calculate_combat_strength(agent_a)
        strength_b = self.calculate_combat_strength(agent_b)

        # Determine winner probabilistically
        total_strength = strength_a + strength_b
        if total_strength > 0:
            victory_chance_a = strength_a / total_strength
        else:
            victory_chance_a = 0.5

        # Roll for victory
        a_wins = random.random() < victory_chance_a

        # Calculate casualties and damage
        strength_ratio = max(strength_a, strength_b) / max(min(strength_a, strength_b), 1.0)

        casualties = []
        survivors = []
        outcome = CombatOutcome.STALEMATE

        if strength_ratio > 2.0:
            outcome = CombatOutcome.DECISIVE_VICTORY
            death_chance = 0.8 if allow_death else 0.0
        elif strength_ratio > 1.5:
            outcome = CombatOutcome.VICTORY
            death_chance = 0.4 if allow_death else 0.0
        else:
            outcome = CombatOutcome.NARROW_VICTORY
            death_chance = 0.2 if allow_death else 0.0

        if a_wins:
            victor_ids = [agent_a.id]
            defeated_ids = [agent_b.id]

            # Loser might die
            if random.random() < death_chance:
                casualties.append(agent_b.id)
                logger.info(f"💀 {agent_b.name} was killed in combat!")
            else:
                survivors.append(agent_b.id)
                logger.info(f"🏃 {agent_b.name} survived but was defeated")

            survivors.append(agent_a.id)
        else:
            victor_ids = [agent_b.id]
            defeated_ids = [agent_a.id]

            if random.random() < death_chance:
                casualties.append(agent_a.id)
                logger.info(f"💀 {agent_a.name} was killed in combat!")
            else:
                survivors.append(agent_a.id)
                logger.info(f"🏃 {agent_a.name} survived but was defeated")

            survivors.append(agent_b.id)

        # Morale impact
        morale_impact = {
            victor_ids[0]: +15.0,  # Victor gains morale
            defeated_ids[0]: -25.0 if defeated_ids[0] in casualties else -15.0
        }

        result = CombatResult(
            conflict_type=ConflictType.DUEL,
            outcome=outcome,
            victor_ids=victor_ids,
            defeated_ids=defeated_ids,
            casualties=casualties,
            survivors=survivors,
            loot={},
            morale_impact=morale_impact
        )

        self.combat_history.append(result)
        logger.info(f"✓ Duel resolved: {outcome.value}, Victor: {victor_ids[0][:8]}")

        return result

    def resolve_group_combat(
        self,
        attackers: List[CombatParticipant],
        defenders: List[CombatParticipant],
        conflict_type: ConflictType = ConflictType.SKIRMISH
    ) -> CombatResult:
        """
        Resolve combat between two groups of agents.

        Args:
            attackers: List of attacking participants
            defenders: List of defending participants
            conflict_type: Type of conflict (skirmish, battle, etc.)

        Returns:
            CombatResult with outcome and casualties
        """
        logger.info(
            f"⚔️ {conflict_type.value.upper()}: "
            f"{len(attackers)} attackers vs {len(defenders)} defenders"
        )

        # Calculate total strengths
        attacker_strength = sum(
            self.calculate_combat_strength(a, len(attackers), len(defenders))
            for a in attackers
        )

        defender_strength = sum(
            self.calculate_combat_strength(d, len(defenders), len(attackers))
            for d in defenders
        )

        logger.info(
            f"Strength: Attackers={attacker_strength:.1f}, Defenders={defender_strength:.1f}"
        )

        # Determine outcome
        total_strength = attacker_strength + defender_strength
        if total_strength > 0:
            attacker_victory_chance = attacker_strength / total_strength
        else:
            attacker_victory_chance = 0.5

        attackers_win = random.random() < attacker_victory_chance

        # Calculate casualties based on strength ratio
        strength_ratio = max(attacker_strength, defender_strength) / max(
            min(attacker_strength, defender_strength), 1.0
        )

        if strength_ratio > 3.0:
            outcome = CombatOutcome.DECISIVE_VICTORY
            loser_casualty_rate = 0.7
            winner_casualty_rate = 0.1
        elif strength_ratio > 2.0:
            outcome = CombatOutcome.VICTORY
            loser_casualty_rate = 0.5
            winner_casualty_rate = 0.2
        elif strength_ratio > 1.3:
            outcome = CombatOutcome.NARROW_VICTORY
            loser_casualty_rate = 0.4
            winner_casualty_rate = 0.3
        else:
            outcome = CombatOutcome.STALEMATE
            loser_casualty_rate = 0.3
            winner_casualty_rate = 0.3

        # Determine casualties
        casualties = []
        survivors = []
        victor_ids = []
        defeated_ids = []

        if attackers_win:
            # Attackers win
            victor_ids = [a.id for a in attackers]
            defeated_ids = [d.id for d in defenders]

            # Defender casualties
            for defender in defenders:
                if random.random() < loser_casualty_rate:
                    casualties.append(defender.id)
                else:
                    survivors.append(defender.id)

            # Attacker casualties
            for attacker in attackers:
                if random.random() < winner_casualty_rate:
                    casualties.append(attacker.id)
                else:
                    survivors.append(attacker.id)

        else:
            # Defenders win
            victor_ids = [d.id for d in defenders]
            defeated_ids = [a.id for a in attackers]

            # Attacker casualties
            for attacker in attackers:
                if random.random() < loser_casualty_rate:
                    casualties.append(attacker.id)
                else:
                    survivors.append(attacker.id)

            # Defender casualties
            for defender in defenders:
                if random.random() < winner_casualty_rate:
                    casualties.append(defender.id)
                else:
                    survivors.append(defender.id)

        logger.info(
            f"💀 Casualties: {len(casualties)}, Survivors: {len(survivors)}"
        )

        # Loot (attackers get resources if they win)
        loot = {}
        if attackers_win and conflict_type in [ConflictType.RAID, ConflictType.BATTLE]:
            # Attackers loot resources
            loot = {
                "food": random.randint(5, 20),
                "materials": random.randint(3, 15)
            }

        # Morale impact
        morale_impact = {}
        for victor_id in victor_ids:
            morale_impact[victor_id] = +10.0 if outcome == CombatOutcome.DECISIVE_VICTORY else +5.0
        for defeated_id in defeated_ids:
            if defeated_id not in casualties:
                morale_impact[defeated_id] = -15.0 if outcome == CombatOutcome.DECISIVE_VICTORY else -10.0

        result = CombatResult(
            conflict_type=conflict_type,
            outcome=outcome,
            victor_ids=victor_ids,
            defeated_ids=defeated_ids,
            casualties=casualties,
            survivors=survivors,
            loot=loot,
            morale_impact=morale_impact
        )

        self.combat_history.append(result)
        logger.info(f"✓ Combat resolved: {outcome.value}")

        return result

    def can_initiate_combat(
        self,
        aggressor_id: str,
        target_id: str,
        cooldown_hours: float = 1.0
    ) -> bool:
        """
        Check if combat can be initiated between two parties.

        Args:
            aggressor_id: ID of the aggressor
            target_id: ID of the target
            cooldown_hours: Hours required between combats

        Returns:
            True if combat can be initiated
        """
        # Check for existing conflict
        key = tuple(sorted([aggressor_id, target_id]))
        if key in self.active_conflicts:
            return False

        # Check recent combat history (cooldown)
        for result in reversed(self.combat_history[-10:]):
            if aggressor_id in result.victor_ids + result.defeated_ids:
                if target_id in result.victor_ids + result.defeated_ids:
                    # Both were in recent combat
                    # For now, allow it (can add timestamp check later)
                    pass

        return True

    def get_combat_statistics(self) -> Dict:
        """Get overall combat statistics."""
        total_combats = len(self.combat_history)
        total_casualties = sum(len(r.casualties) for r in self.combat_history)

        conflict_type_counts = {}
        for result in self.combat_history:
            conflict_type_counts[result.conflict_type.value] = \
                conflict_type_counts.get(result.conflict_type.value, 0) + 1

        return {
            "total_combats": total_combats,
            "total_casualties": total_casualties,
            "conflict_types": conflict_type_counts,
            "average_casualties_per_combat": total_casualties / max(total_combats, 1)
        }


# Global instance
combat_system = CombatSystem()
