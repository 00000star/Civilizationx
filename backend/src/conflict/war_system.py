"""
War System for Settlement-Level Conflicts

This module handles extended conflicts between settlements including:
- War declarations and peace treaties
- Sieges and territorial conquest
- War weariness and economic impact
- Alliance dynamics during wars

Key Concepts:
- Wars are NOT instant - they play out over many ticks
- War weariness reduces morale and productivity over time
- Allies can be called into wars
- Peace treaties can be negotiated at any time
- Territorial conquest changes settlement boundaries

Documentation:
- Wars affect civilian morale and productivity
- Prolonged wars drain resources
- Defensive wars have lower war weariness
- Alliances can dramatically shift war outcomes
"""
import logging
from typing import List, Dict, Optional, Set
from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


class WarStatus(Enum):
    """Status of a war."""
    DECLARED = "declared"  # War recently declared
    ACTIVE = "active"  # Active combat ongoing
    STALEMATE = "stalemate"  # No progress by either side
    CEASEFIRE = "ceasefire"  # Temporary halt
    CONCLUDED = "concluded"  # War ended


class WarGoal(Enum):
    """Objectives for war."""
    CONQUEST = "conquest"  # Take territory
    RESOURCES = "resources"  # Loot resources
    SUBJUGATION = "subjugation"  # Force surrender
    DEFENSE = "defense"  # Defensive war
    REVENGE = "revenge"  # Retaliation
    LIBERATION = "liberation"  # Free conquered territory


@dataclass
class War:
    """Represents an ongoing war between settlements."""
    war_id: str
    aggressor_id: str
    aggressor_name: str
    defender_id: str
    defender_name: str
    war_goal: WarGoal
    status: WarStatus
    declared_at: datetime
    ended_at: Optional[datetime] = None

    # Combat tracking
    battles_fought: int = 0
    aggressor_victories: int = 0
    defender_victories: int = 0
    total_casualties: int = 0

    # War score (-100 to +100, positive favors aggressor)
    war_score: float = 0.0

    # War weariness (0 to 100, higher = more exhausted)
    aggressor_weariness: float = 0.0
    defender_weariness: float = 0.0

    # Participants (IDs of allied settlements)
    aggressor_allies: Set[str] = field(default_factory=set)
    defender_allies: Set[str] = field(default_factory=set)

    # Occupied territories
    occupied_territories: List[Dict] = field(default_factory=list)

    def get_war_duration_days(self) -> float:
        """Get war duration in days."""
        if self.ended_at:
            return (self.ended_at - self.declared_at).days
        return (datetime.now() - self.declared_at).days

    def get_victory_margin(self) -> str:
        """Get description of current victory margin."""
        if abs(self.war_score) < 20:
            return "stalemate"
        elif abs(self.war_score) < 50:
            return "slight advantage"
        elif abs(self.war_score) < 80:
            return "significant advantage"
        else:
            return "decisive advantage"


@dataclass
class PeaceTreaty:
    """Represents peace treaty terms."""
    treaty_id: str
    war_id: str
    proposer_id: str
    target_id: str

    # Terms
    territory_transfer: List[Dict] = field(default_factory=list)  # Territory given up
    resource_tribute: Dict[str, int] = field(default_factory=dict)  # Resources paid
    prisoner_release: bool = True
    non_aggression_years: int = 5  # Years of guaranteed peace

    # Status
    status: str = "proposed"  # proposed, accepted, rejected
    proposed_at: datetime = field(default_factory=datetime.now)


class WarSystem:
    """
    Manages all aspects of warfare between settlements.

    War Mechanics:
    ==============
    1. Declaration: Aggressor declares war with a goal
    2. Mobilization: Both sides prepare for combat (1-3 ticks)
    3. Active Combat: Regular battles occur automatically
    4. War Score: Tracks progress towards victory
    5. Conclusion: Peace treaty or total victory

    War Score Calculation:
    =====================
    +10 per battle victory
    +20 per territory occupied
    -5 per battle defeat
    -10 per territory lost

    War ends when:
    - War score reaches ±100 (total victory)
    - Peace treaty accepted
    - One side has no combatants left
    - War weariness reaches 100 (collapse)
    """

    def __init__(self):
        # Active wars: war_id -> War
        self.active_wars: Dict[str, War] = {}

        # War history
        self.war_history: List[War] = []

        # Peace treaty proposals
        self.peace_proposals: Dict[str, PeaceTreaty] = {}

    def declare_war(
        self,
        aggressor_id: str,
        aggressor_name: str,
        defender_id: str,
        defender_name: str,
        war_goal: WarGoal,
        casus_belli: str
    ) -> War:
        """
        Declare war between two settlements.

        Args:
            aggressor_id: Attacking settlement ID
            aggressor_name: Attacking settlement name
            defender_id: Defending settlement ID
            defender_name: Defending settlement name
            war_goal: Objective of the war
            casus_belli: Reason for war (for narrative)

        Returns:
            War object
        """
        war_id = f"war_{len(self.active_wars)}_{datetime.now().timestamp()}"

        war = War(
            war_id=war_id,
            aggressor_id=aggressor_id,
            aggressor_name=aggressor_name,
            defender_id=defender_id,
            defender_name=defender_name,
            war_goal=war_goal,
            status=WarStatus.DECLARED,
            declared_at=datetime.now()
        )

        self.active_wars[war_id] = war

        logger.warning(
            f"⚔️ WAR DECLARED: {aggressor_name} vs {defender_name} "
            f"(Goal: {war_goal.value}, Reason: {casus_belli})"
        )

        return war

    def process_battle_result(
        self,
        war_id: str,
        victor_id: str,
        defeated_id: str,
        casualties: int
    ):
        """
        Process the result of a battle in an ongoing war.

        Args:
            war_id: War ID
            victor_id: ID of the victor
            defeated_id: ID of the defeated
            casualties: Number of casualties
        """
        war = self.active_wars.get(war_id)
        if not war:
            logger.warning(f"Attempted to process battle for non-existent war {war_id}")
            return

        war.battles_fought += 1
        war.total_casualties += casualties
        war.status = WarStatus.ACTIVE

        # Update victory counts and war score
        if victor_id == war.aggressor_id:
            war.aggressor_victories += 1
            war.war_score += 10
            war.defender_weariness += 5.0
            logger.info(f"⚔️ Battle victory for {war.aggressor_name} (War score: {war.war_score:+.0f})")
        elif victor_id == war.defender_id:
            war.defender_victories += 1
            war.war_score -= 10
            war.aggressor_weariness += 5.0
            logger.info(f"⚔️ Battle victory for {war.defender_name} (War score: {war.war_score:+.0f})")

        # Increase war weariness over time
        war.aggressor_weariness += 1.0
        war.defender_weariness += 0.7  # Defenders have slightly less weariness

        # Check for war conclusion
        self._check_war_conclusion(war)

    def occupy_territory(
        self,
        war_id: str,
        occupier_id: str,
        territory: Dict
    ):
        """
        Record territorial occupation during war.

        Args:
            war_id: War ID
            occupier_id: ID of the occupying settlement
            territory: Territory information
        """
        war = self.active_wars.get(war_id)
        if not war:
            return

        war.occupied_territories.append({
            "occupier_id": occupier_id,
            "territory": territory,
            "occupied_at": datetime.now()
        })

        # Update war score
        if occupier_id == war.aggressor_id:
            war.war_score += 20
            logger.info(f"🏴 {war.aggressor_name} occupied territory")
        elif occupier_id == war.defender_id:
            war.war_score -= 20
            logger.info(f"🏴 {war.defender_name} recaptured territory")

        self._check_war_conclusion(war)

    def call_ally_to_war(
        self,
        war_id: str,
        ally_id: str,
        ally_name: str,
        side: str  # "aggressor" or "defender"
    ):
        """
        Add an ally to an ongoing war.

        Args:
            war_id: War ID
            ally_id: ID of the ally joining
            ally_name: Name of the ally
            side: Which side they're joining
        """
        war = self.active_wars.get(war_id)
        if not war:
            return

        if side == "aggressor":
            war.aggressor_allies.add(ally_id)
            logger.info(f"🤝 {ally_name} joined {war.aggressor_name} in the war")
        elif side == "defender":
            war.defender_allies.add(ally_id)
            logger.info(f"🤝 {ally_name} joined {war.defender_name} in the war")

    def propose_peace(
        self,
        war_id: str,
        proposer_id: str,
        terms: Dict
    ) -> PeaceTreaty:
        """
        Propose peace treaty to end a war.

        Args:
            war_id: War ID
            proposer_id: ID of the proposing settlement
            terms: Treaty terms

        Returns:
            PeaceTreaty object
        """
        war = self.active_wars.get(war_id)
        if not war:
            raise ValueError(f"War {war_id} not found")

        # Determine target
        if proposer_id == war.aggressor_id:
            target_id = war.defender_id
        else:
            target_id = war.aggressor_id

        treaty_id = f"treaty_{war_id}_{datetime.now().timestamp()}"

        treaty = PeaceTreaty(
            treaty_id=treaty_id,
            war_id=war_id,
            proposer_id=proposer_id,
            target_id=target_id,
            territory_transfer=terms.get("territory_transfer", []),
            resource_tribute=terms.get("resource_tribute", {}),
            prisoner_release=terms.get("prisoner_release", True),
            non_aggression_years=terms.get("non_aggression_years", 5)
        )

        self.peace_proposals[treaty_id] = treaty

        logger.info(f"🕊️ Peace proposal: {proposer_id[:8]} to {target_id[:8]}")

        return treaty

    def evaluate_peace_proposal(
        self,
        treaty_id: str,
        war: War,
        target_settlement_data: Dict
    ) -> bool:
        """
        Evaluate if a peace proposal should be accepted.

        Args:
            treaty_id: Treaty ID
            war: War object
            target_settlement_data: Data about the target settlement

        Returns:
            True if should accept
        """
        treaty = self.peace_proposals.get(treaty_id)
        if not treaty:
            return False

        # Factors affecting acceptance:
        # 1. War score (losing side more likely to accept)
        # 2. War weariness (exhausted more likely to accept)
        # 3. Treaty terms (harsh terms less likely)
        # 4. Casualties (high casualties increase acceptance)

        is_aggressor = treaty.target_id == war.aggressor_id

        if is_aggressor:
            war_position = war.war_score  # Positive = winning
            weariness = war.aggressor_weariness
        else:
            war_position = -war.war_score  # Negative = losing (from defender view)
            weariness = war.defender_weariness

        # Base acceptance chance
        acceptance_chance = 0.3

        # Losing badly increases acceptance
        if war_position < -50:
            acceptance_chance += 0.4
        elif war_position < -20:
            acceptance_chance += 0.2

        # High weariness increases acceptance
        if weariness > 70:
            acceptance_chance += 0.3
        elif weariness > 50:
            acceptance_chance += 0.15

        # Evaluate terms harshness
        territories_demanded = len(treaty.territory_transfer)
        if territories_demanded > 2:
            acceptance_chance -= 0.2
        elif territories_demanded > 0:
            acceptance_chance -= 0.1

        return random.random() < acceptance_chance

    def accept_peace_treaty(self, treaty_id: str):
        """Accept a peace treaty and end the war."""
        treaty = self.peace_proposals.get(treaty_id)
        if not treaty:
            return

        treaty.status = "accepted"
        war = self.active_wars.get(treaty.war_id)

        if war:
            war.status = WarStatus.CONCLUDED
            war.ended_at = datetime.now()

            # Move to history
            self.war_history.append(war)
            del self.active_wars[treaty.war_id]

            logger.info(
                f"🕊️ PEACE: War between {war.aggressor_name} and {war.defender_name} ended "
                f"(Duration: {war.get_war_duration_days():.1f} days, "
                f"Battles: {war.battles_fought}, Casualties: {war.total_casualties})"
            )

        del self.peace_proposals[treaty_id]

    def _check_war_conclusion(self, war: War):
        """Check if war should conclude based on conditions."""
        # Decisive victory
        if abs(war.war_score) >= 100:
            war.status = WarStatus.CONCLUDED
            war.ended_at = datetime.now()

            victor = war.aggressor_name if war.war_score > 0 else war.defender_name
            logger.warning(
                f"🏆 DECISIVE VICTORY: {victor} has won the war! "
                f"(Final score: {war.war_score:+.0f})"
            )

            self.war_history.append(war)
            del self.active_wars[war.war_id]
            return

        # Collapse from war weariness
        if war.aggressor_weariness >= 100:
            war.status = WarStatus.CONCLUDED
            war.ended_at = datetime.now()
            war.war_score = -100  # Defender wins

            logger.warning(
                f"🏳️ {war.aggressor_name} collapsed from war weariness"
            )

            self.war_history.append(war)
            del self.active_wars[war.war_id]
            return

        if war.defender_weariness >= 100:
            war.status = WarStatus.CONCLUDED
            war.ended_at = datetime.now()
            war.war_score = 100  # Aggressor wins

            logger.warning(
                f"🏳️ {war.defender_name} collapsed from war weariness"
            )

            self.war_history.append(war)
            del self.active_wars[war.war_id]
            return

        # Stalemate detection
        if war.battles_fought >= 10:
            if abs(war.war_score) < 20:
                war.status = WarStatus.STALEMATE
                logger.info(f"⚔️ War reached stalemate after {war.battles_fought} battles")

    def get_war_statistics(self) -> Dict:
        """Get overall war statistics."""
        return {
            "active_wars": len(self.active_wars),
            "total_wars_fought": len(self.war_history) + len(self.active_wars),
            "total_battles": sum(w.battles_fought for w in self.active_wars.values()) +
                            sum(w.battles_fought for w in self.war_history),
            "total_war_casualties": sum(w.total_casualties for w in self.active_wars.values()) +
                                   sum(w.total_casualties for w in self.war_history)
        }

    def get_settlement_wars(self, settlement_id: str) -> List[War]:
        """Get all wars a settlement is involved in."""
        wars = []
        for war in self.active_wars.values():
            if (war.aggressor_id == settlement_id or
                war.defender_id == settlement_id or
                settlement_id in war.aggressor_allies or
                settlement_id in war.defender_allies):
                wars.append(war)
        return wars


# Global instance
war_system = WarSystem()
