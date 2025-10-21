"""Leadership emergence and governance system."""
import logging
from typing import Dict, List, Optional, Set
from datetime import datetime
from enum import Enum
from collections import defaultdict
import random

logger = logging.getLogger(__name__)


class GovernanceType(Enum):
    """Types of governance structures."""
    NONE = "none"  # No formal leadership
    ELDER = "elder"  # Respected elder leads
    COUNCIL = "council"  # Council of representatives
    CHIEFDOM = "chiefdom"  # Single chief with authority
    DEMOCRACY = "democracy"  # Elected representatives
    MONARCHY = "monarchy"  # Hereditary rule


class LeadershipQuality(Enum):
    """Leadership qualities that agents can possess."""
    CHARISMATIC = "charismatic"
    WISE = "wise"
    STRONG = "strong"
    DIPLOMATIC = "diplomatic"
    INNOVATIVE = "innovative"
    JUST = "just"


class Leader:
    """Represents a leader in a settlement."""

    def __init__(
        self,
        agent_id: str,
        agent_name: str,
        settlement_id: str,
        role: str = "chief"
    ):
        self.agent_id = agent_id
        self.agent_name = agent_name
        self.settlement_id = settlement_id
        self.role = role  # chief, elder, council_member, monarch
        self.appointed_at = datetime.now()
        self.approval_rating = 70.0  # 0-100
        self.decisions_made: List[Dict] = []
        self.challenges_faced = 0
        self.leadership_qualities: Set[LeadershipQuality] = set()

    def make_decision(self, decision_type: str, outcome: str, impact: float):
        """Record a leadership decision."""
        decision = {
            "type": decision_type,
            "outcome": outcome,
            "impact": impact,
            "timestamp": datetime.now().isoformat()
        }
        self.decisions_made.append(decision)

        # Affect approval rating
        self.approval_rating = max(0.0, min(100.0, self.approval_rating + impact))

    def add_quality(self, quality: LeadershipQuality):
        """Add a leadership quality."""
        self.leadership_qualities.add(quality)


class LeadershipSystem:
    """Manages leadership and governance in settlements."""

    def __init__(self):
        # Current leaders: settlement_id -> Leader or list of Leaders
        self.settlement_leaders: Dict[str, any] = {}

        # Governance types: settlement_id -> GovernanceType
        self.governance_types: Dict[str, GovernanceType] = {}

        # Leadership candidates: settlement_id -> list of (agent_id, score)
        self.leadership_candidates: Dict[str, List[tuple]] = {}

        # Agent leadership scores: agent_id -> score
        self.leadership_scores: Dict[str, float] = defaultdict(float)

    def update_leadership_scores(
        self,
        settlement_id: str,
        agents: List[Dict],
        settlement_data: Dict
    ):
        """
        Update leadership scores for agents in a settlement.

        Factors:
        - Age/experience (simulation days alive)
        - Technologies known
        - Relationships (positive relationships)
        - Contributions (resources gathered, items crafted, etc.)
        - Reputation (based on memories and interactions)
        """
        candidates = []

        for agent in agents:
            agent_id = agent["id"]
            score = 0.0

            # Age/Experience factor (max 20 points)
            simulation_days = agent.get("simulation_days", 0)
            age_score = min(20, simulation_days * 0.5)
            score += age_score

            # Technologies known (max 30 points)
            known_techs = agent.get("known_technologies", [])
            tech_score = min(30, len(known_techs) * 3)
            score += tech_score

            # Relationships (max 20 points)
            positive_relationships = agent.get("positive_relationships", 0)
            relationship_score = min(20, positive_relationships * 2)
            score += relationship_score

            # Contributions (max 20 points)
            contributions = agent.get("total_contributions", 0)
            contribution_score = min(20, contributions * 0.1)
            score += contribution_score

            # Teaching/knowledge sharing (max 10 points)
            teaching_count = agent.get("teaching_count", 0)
            teaching_score = min(10, teaching_count * 2)
            score += teaching_score

            # Update agent's leadership score
            self.leadership_scores[agent_id] = score

            candidates.append((agent_id, agent.get("name", "Unknown"), score))

        # Sort by score
        candidates.sort(key=lambda x: x[2], reverse=True)
        self.leadership_candidates[settlement_id] = candidates

    def check_for_leadership_emergence(
        self,
        settlement_id: str,
        settlement_name: str,
        population: int,
        settlement_age_days: int
    ) -> bool:
        """
        Check if settlement should establish formal leadership.

        Returns:
            True if leadership was established
        """
        # Already has leadership
        if settlement_id in self.settlement_leaders:
            return False

        # Settlements need some time and population before leadership emerges
        min_population = 5
        min_age_days = 3

        if population < min_population or settlement_age_days < min_age_days:
            return False

        # Determine governance type based on population and culture
        governance_type = self._determine_governance_type(population, settlement_age_days)

        if governance_type == GovernanceType.NONE:
            return False

        # Establish leadership
        return self._establish_leadership(
            settlement_id,
            settlement_name,
            governance_type
        )

    def _determine_governance_type(
        self,
        population: int,
        age_days: int
    ) -> GovernanceType:
        """Determine appropriate governance type."""
        if population < 5:
            return GovernanceType.NONE

        elif population < 10:
            # Small settlements: elder leadership
            if age_days > 10:
                return GovernanceType.ELDER
            else:
                return GovernanceType.NONE

        elif population < 20:
            # Medium settlements: chiefdom or council
            if random.random() < 0.7:
                return GovernanceType.CHIEFDOM
            else:
                return GovernanceType.COUNCIL

        else:
            # Large settlements: more complex governance
            if age_days > 30 and random.random() < 0.3:
                return GovernanceType.DEMOCRACY
            elif random.random() < 0.2:
                return GovernanceType.MONARCHY
            elif random.random() < 0.5:
                return GovernanceType.COUNCIL
            else:
                return GovernanceType.CHIEFDOM

    def _establish_leadership(
        self,
        settlement_id: str,
        settlement_name: str,
        governance_type: GovernanceType
    ) -> bool:
        """Establish leadership in a settlement."""
        candidates = self.leadership_candidates.get(settlement_id, [])

        if not candidates:
            return False

        self.governance_types[settlement_id] = governance_type

        if governance_type == GovernanceType.ELDER:
            # Oldest/most experienced becomes elder
            leader_data = candidates[0]  # Top candidate
            leader = Leader(leader_data[0], leader_data[1], settlement_id, "elder")
            leader.add_quality(LeadershipQuality.WISE)
            self.settlement_leaders[settlement_id] = leader

            logger.info(
                f"👑 '{settlement_name}' established Elder leadership - "
                f"Elder: {leader.agent_name}"
            )

        elif governance_type == GovernanceType.CHIEFDOM:
            # Top candidate becomes chief
            leader_data = candidates[0]
            leader = Leader(leader_data[0], leader_data[1], settlement_id, "chief")

            # Assign leadership qualities
            if leader_data[2] > 60:
                leader.add_quality(LeadershipQuality.CHARISMATIC)
            leader.add_quality(LeadershipQuality.STRONG)

            self.settlement_leaders[settlement_id] = leader

            logger.info(
                f"👑 '{settlement_name}' established Chiefdom - "
                f"Chief: {leader.agent_name}"
            )

        elif governance_type == GovernanceType.COUNCIL:
            # Top 3-5 candidates form council
            council_size = min(5, max(3, len(candidates) // 3))
            council = []

            for i in range(council_size):
                if i < len(candidates):
                    leader_data = candidates[i]
                    council_member = Leader(
                        leader_data[0],
                        leader_data[1],
                        settlement_id,
                        "council_member"
                    )
                    council_member.add_quality(LeadershipQuality.DIPLOMATIC)
                    council.append(council_member)

            self.settlement_leaders[settlement_id] = council

            logger.info(
                f"👑 '{settlement_name}' established Council - "
                f"{len(council)} members: {', '.join([m.agent_name for m in council[:3]])}..."
            )

        elif governance_type == GovernanceType.DEMOCRACY:
            # Elected leader from top candidates
            # For now, simple selection of top candidate
            leader_data = candidates[0]
            leader = Leader(leader_data[0], leader_data[1], settlement_id, "elected_leader")
            leader.add_quality(LeadershipQuality.DIPLOMATIC)
            leader.add_quality(LeadershipQuality.JUST)
            self.settlement_leaders[settlement_id] = leader

            logger.info(
                f"👑 '{settlement_name}' established Democracy - "
                f"Elected leader: {leader.agent_name}"
            )

        elif governance_type == GovernanceType.MONARCHY:
            # First monarch
            leader_data = candidates[0]
            leader = Leader(leader_data[0], leader_data[1], settlement_id, "monarch")
            leader.add_quality(LeadershipQuality.STRONG)
            self.settlement_leaders[settlement_id] = leader

            logger.info(
                f"👑 '{settlement_name}' established Monarchy - "
                f"Monarch: {leader.agent_name}"
            )

        return True

    def make_settlement_decision(
        self,
        settlement_id: str,
        decision_type: str,
        options: List[Dict]
    ) -> Optional[Dict]:
        """
        Make a settlement-level decision through leadership.

        Args:
            settlement_id: Settlement ID
            decision_type: Type of decision (resource_allocation, diplomacy, etc.)
            options: List of decision options with pros/cons

        Returns:
            Chosen option or None
        """
        leaders = self.settlement_leaders.get(settlement_id)
        if not leaders:
            # No leadership, random decision
            return random.choice(options) if options else None

        governance_type = self.governance_types.get(settlement_id, GovernanceType.NONE)

        if governance_type == GovernanceType.COUNCIL:
            # Council votes
            return self._council_vote(leaders, options)

        elif isinstance(leaders, Leader):
            # Single leader decides
            return self._leader_decides(leaders, options)

        return None

    def _leader_decides(self, leader: Leader, options: List[Dict]) -> Optional[Dict]:
        """Single leader makes decision."""
        if not options:
            return None

        # Leaders prefer options aligned with their qualities
        best_option = options[0]
        best_score = 0

        for option in options:
            score = option.get("base_value", 50)

            # Modify based on leader qualities
            if LeadershipQuality.WISE in leader.leadership_qualities:
                score += option.get("long_term_benefit", 0) * 1.5

            if LeadershipQuality.INNOVATIVE in leader.leadership_qualities:
                score += option.get("innovation_factor", 0) * 2

            if LeadershipQuality.DIPLOMATIC in leader.leadership_qualities:
                score += option.get("diplomatic_value", 0) * 1.5

            if LeadershipQuality.STRONG in leader.leadership_qualities:
                score += option.get("immediate_impact", 0) * 1.5

            if score > best_score:
                best_score = score
                best_option = option

        # Record decision
        leader.make_decision(
            "settlement_decision",
            best_option.get("name", "unknown"),
            random.uniform(-5, 10)  # Impact on approval
        )

        return best_option

    def _council_vote(self, council: List[Leader], options: List[Dict]) -> Optional[Dict]:
        """Council votes on decision."""
        if not options or not council:
            return None

        # Each council member scores options
        votes = defaultdict(int)

        for member in council:
            chosen = self._leader_decides(member, options)
            if chosen:
                votes[chosen.get("name", "unknown")] += 1

        # Majority wins
        if votes:
            winner = max(votes.items(), key=lambda x: x[1])
            chosen_option = next((o for o in options if o.get("name") == winner[0]), options[0])
            return chosen_option

        return options[0]

    def handle_leadership_challenge(
        self,
        settlement_id: str,
        challenger_id: str,
        challenger_name: str,
        reason: str
    ):
        """Handle a challenge to existing leadership."""
        leader = self.settlement_leaders.get(settlement_id)

        if not leader or isinstance(leader, list):
            # Can't challenge council easily
            return

        leader.challenges_faced += 1

        # Challenge success based on approval rating and challenger's leadership score
        challenger_score = self.leadership_scores.get(challenger_id, 0)
        success_prob = (100 - leader.approval_rating) / 100 * 0.5 + (challenger_score / 100) * 0.5

        if random.random() < success_prob:
            # Challenge succeeds!
            logger.info(
                f"⚔️ Leadership challenge successful! {challenger_name} overthrows "
                f"{leader.agent_name} in settlement"
            )

            # New leader
            new_leader = Leader(
                challenger_id,
                challenger_name,
                settlement_id,
                leader.role
            )
            new_leader.add_quality(LeadershipQuality.STRONG)
            self.settlement_leaders[settlement_id] = new_leader

        else:
            # Challenge fails
            logger.info(
                f"⚔️ Leadership challenge failed! {leader.agent_name} remains leader"
            )
            leader.approval_rating = min(100, leader.approval_rating + 5)

    def get_settlement_leader(self, settlement_id: str) -> any:
        """Get leader(s) of a settlement."""
        return self.settlement_leaders.get(settlement_id)

    def get_governance_type(self, settlement_id: str) -> Optional[GovernanceType]:
        """Get governance type of a settlement."""
        return self.governance_types.get(settlement_id)

    def update_approval_ratings(
        self,
        settlement_id: str,
        settlement_prosperity: float,
        conflicts: int,
        cooperation: int
    ):
        """Update leader approval ratings based on settlement performance."""
        leaders = self.settlement_leaders.get(settlement_id)
        if not leaders:
            return

        # Calculate approval change
        prosperity_impact = (settlement_prosperity - 50) / 10  # -5 to +5
        conflict_impact = -conflicts * 2
        cooperation_impact = cooperation * 1

        total_impact = prosperity_impact + conflict_impact + cooperation_impact

        # Apply to leader(s)
        if isinstance(leaders, Leader):
            leaders.approval_rating = max(0, min(100, leaders.approval_rating + total_impact))

            # Very low approval may trigger replacement
            if leaders.approval_rating < 20:
                logger.warning(
                    f"⚠️ Leader {leaders.agent_name} has very low approval ({leaders.approval_rating:.1f})"
                )

        elif isinstance(leaders, list):
            for member in leaders:
                member.approval_rating = max(0, min(100, member.approval_rating + total_impact))

    def get_leadership_info(self, settlement_id: str) -> Dict:
        """Get detailed leadership information."""
        leaders = self.settlement_leaders.get(settlement_id)
        governance = self.governance_types.get(settlement_id, GovernanceType.NONE)

        if not leaders:
            return {
                "governance_type": governance.value,
                "has_leadership": False
            }

        if isinstance(leaders, Leader):
            return {
                "governance_type": governance.value,
                "has_leadership": True,
                "leader": {
                    "agent_id": leaders.agent_id,
                    "agent_name": leaders.agent_name,
                    "role": leaders.role,
                    "approval_rating": leaders.approval_rating,
                    "qualities": [q.value for q in leaders.leadership_qualities],
                    "decisions_made": len(leaders.decisions_made),
                    "challenges_faced": leaders.challenges_faced
                }
            }
        else:  # Council
            return {
                "governance_type": governance.value,
                "has_leadership": True,
                "council": [
                    {
                        "agent_id": member.agent_id,
                        "agent_name": member.agent_name,
                        "approval_rating": member.approval_rating,
                        "qualities": [q.value for q in member.leadership_qualities]
                    }
                    for member in leaders
                ]
            }


# Global instance
leadership_system = LeadershipSystem()
