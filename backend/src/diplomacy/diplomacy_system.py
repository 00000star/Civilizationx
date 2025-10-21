"""Diplomacy system for inter-settlement relations."""
import logging
from typing import Dict, List, Optional, Set
from datetime import datetime, timedelta
from enum import Enum
import random

logger = logging.getLogger(__name__)


class RelationshipStatus(Enum):
    """Diplomatic relationship status between settlements."""
    UNKNOWN = "unknown"
    NEUTRAL = "neutral"
    FRIENDLY = "friendly"
    ALLIED = "allied"
    TENSE = "tense"
    HOSTILE = "hostile"
    WAR = "war"


class DiplomaticAction(Enum):
    """Types of diplomatic actions."""
    GREETING = "greeting"
    TRADE_AGREEMENT = "trade_agreement"
    ALLIANCE_PROPOSAL = "alliance_proposal"
    PEACE_TREATY = "peace_treaty"
    TERRITORIAL_CLAIM = "territorial_claim"
    RESOURCE_SHARING = "resource_sharing"
    KNOWLEDGE_EXCHANGE = "knowledge_exchange"
    DECLARATION_OF_WAR = "declaration_of_war"


class DiplomaticRelationship:
    """Represents diplomatic relationship between two settlements."""

    def __init__(self, settlement_a_id: str, settlement_b_id: str):
        self.settlement_a_id = settlement_a_id
        self.settlement_b_id = settlement_b_id
        self.status = RelationshipStatus.UNKNOWN
        self.trust_level = 0.0  # -100 to +100
        self.trade_volume = 0
        self.shared_knowledge_count = 0
        self.conflict_count = 0
        self.cooperation_count = 0
        self.first_contact_at = datetime.now()
        self.last_interaction_at = datetime.now()
        self.active_agreements: List[Dict] = []
        self.historical_events: List[Dict] = []

    def update_status(self):
        """Update relationship status based on trust level and interactions."""
        if self.trust_level >= 70:
            self.status = RelationshipStatus.ALLIED
        elif self.trust_level >= 40:
            self.status = RelationshipStatus.FRIENDLY
        elif self.trust_level >= -20:
            self.status = RelationshipStatus.NEUTRAL
        elif self.trust_level >= -50:
            self.status = RelationshipStatus.TENSE
        elif self.trust_level >= -80:
            self.status = RelationshipStatus.HOSTILE
        else:
            self.status = RelationshipStatus.WAR

    def modify_trust(self, amount: float):
        """Modify trust level."""
        self.trust_level = max(-100.0, min(100.0, self.trust_level + amount))
        self.update_status()

    def add_agreement(self, agreement_type: str, terms: Dict):
        """Add a diplomatic agreement."""
        agreement = {
            "type": agreement_type,
            "terms": terms,
            "signed_at": datetime.now().isoformat(),
            "expires_at": None
        }
        self.active_agreements.append(agreement)

    def record_event(self, event_type: str, description: str):
        """Record a diplomatic event."""
        self.historical_events.append({
            "type": event_type,
            "description": description,
            "timestamp": datetime.now().isoformat()
        })
        self.last_interaction_at = datetime.now()


class DiplomaticProposal:
    """Represents a diplomatic proposal between settlements."""

    def __init__(
        self,
        proposal_id: str,
        proposer_id: str,
        target_id: str,
        action_type: DiplomaticAction,
        terms: Dict
    ):
        self.id = proposal_id
        self.proposer_id = proposer_id
        self.target_id = target_id
        self.action_type = action_type
        self.terms = terms
        self.status = "pending"  # pending, accepted, rejected
        self.created_at = datetime.now()
        self.resolved_at: Optional[datetime] = None


class DiplomacySystem:
    """Manages diplomatic relations between settlements."""

    def __init__(self):
        # Diplomatic relationships: (settlement_a_id, settlement_b_id) -> DiplomaticRelationship
        self.relationships: Dict[tuple, DiplomaticRelationship] = {}

        # Active proposals: proposal_id -> DiplomaticProposal
        self.active_proposals: Dict[str, DiplomaticProposal] = {}

        # Track territorial claims: settlement_id -> list of claimed regions
        self.territorial_claims: Dict[str, List[Dict]] = {}

    def _get_relationship_key(self, settlement_a_id: str, settlement_b_id: str) -> tuple:
        """Get normalized relationship key."""
        return tuple(sorted([settlement_a_id, settlement_b_id]))

    def get_or_create_relationship(
        self,
        settlement_a_id: str,
        settlement_b_id: str
    ) -> DiplomaticRelationship:
        """Get or create diplomatic relationship."""
        key = self._get_relationship_key(settlement_a_id, settlement_b_id)

        if key not in self.relationships:
            rel = DiplomaticRelationship(settlement_a_id, settlement_b_id)
            rel.status = RelationshipStatus.UNKNOWN
            self.relationships[key] = rel
            logger.info(f"First contact between settlements {settlement_a_id[:8]} and {settlement_b_id[:8]}")

        return self.relationships[key]

    def establish_first_contact(
        self,
        settlement_a_id: str,
        settlement_a_name: str,
        settlement_b_id: str,
        settlement_b_name: str,
        context: Optional[Dict] = None
    ):
        """Establish first contact between settlements."""
        rel = self.get_or_create_relationship(settlement_a_id, settlement_b_id)

        if rel.status == RelationshipStatus.UNKNOWN:
            # Determine initial relationship based on context
            initial_trust = 0.0

            if context:
                # Friendly encounter (trade, shared resources)
                if context.get("encounter_type") == "trade":
                    initial_trust = 10.0
                elif context.get("encounter_type") == "resource_sharing":
                    initial_trust = 15.0
                # Territorial dispute
                elif context.get("encounter_type") == "territorial":
                    initial_trust = -20.0

            rel.modify_trust(initial_trust)
            rel.status = RelationshipStatus.NEUTRAL
            rel.record_event(
                "first_contact",
                f"First contact established between {settlement_a_name} and {settlement_b_name}"
            )

            logger.info(
                f"🤝 First contact: '{settlement_a_name}' and '{settlement_b_name}' - "
                f"Initial trust: {initial_trust}"
            )

    def propose_diplomatic_action(
        self,
        proposer_id: str,
        proposer_name: str,
        target_id: str,
        target_name: str,
        action_type: DiplomaticAction,
        terms: Optional[Dict] = None
    ) -> DiplomaticProposal:
        """Propose a diplomatic action."""
        proposal_id = f"proposal_{len(self.active_proposals)}_{datetime.now().timestamp()}"

        proposal = DiplomaticProposal(
            proposal_id,
            proposer_id,
            target_id,
            action_type,
            terms or {}
        )

        self.active_proposals[proposal_id] = proposal

        logger.info(
            f"📜 Diplomatic proposal: '{proposer_name}' proposes {action_type.value} "
            f"to '{target_name}'"
        )

        return proposal

    def evaluate_proposal(
        self,
        proposal_id: str,
        settlement_stats: Dict
    ) -> bool:
        """
        Evaluate if a proposal should be accepted.

        Returns:
            True if should accept, False otherwise
        """
        proposal = self.active_proposals.get(proposal_id)
        if not proposal or proposal.status != "pending":
            return False

        rel = self.get_or_create_relationship(proposal.proposer_id, proposal.target_id)

        # Base acceptance on relationship status and proposal type
        acceptance_prob = 0.5

        if proposal.action_type == DiplomaticAction.GREETING:
            acceptance_prob = 0.9

        elif proposal.action_type == DiplomaticAction.TRADE_AGREEMENT:
            # More likely if friendly
            if rel.status in [RelationshipStatus.FRIENDLY, RelationshipStatus.ALLIED]:
                acceptance_prob = 0.8
            elif rel.status == RelationshipStatus.NEUTRAL:
                acceptance_prob = 0.6
            else:
                acceptance_prob = 0.2

        elif proposal.action_type == DiplomaticAction.ALLIANCE_PROPOSAL:
            # Requires friendly relationship
            if rel.status == RelationshipStatus.FRIENDLY and rel.trust_level >= 50:
                acceptance_prob = 0.7
            elif rel.status == RelationshipStatus.ALLIED:
                acceptance_prob = 0.9
            else:
                acceptance_prob = 0.1

        elif proposal.action_type == DiplomaticAction.PEACE_TREATY:
            # More likely if war has been costly
            if rel.conflict_count > 5:
                acceptance_prob = 0.7
            else:
                acceptance_prob = 0.4

        elif proposal.action_type == DiplomaticAction.KNOWLEDGE_EXCHANGE:
            # Usually beneficial
            acceptance_prob = 0.7 if rel.status != RelationshipStatus.HOSTILE else 0.2

        elif proposal.action_type == DiplomaticAction.RESOURCE_SHARING:
            # Depends on resources available
            target_resources = settlement_stats.get("resources", 0)
            if target_resources > 100:
                acceptance_prob = 0.6
            else:
                acceptance_prob = 0.3

        # Add trust modifier
        trust_modifier = rel.trust_level / 200.0  # -0.5 to +0.5
        acceptance_prob += trust_modifier

        return random.random() < acceptance_prob

    def accept_proposal(self, proposal_id: str) -> bool:
        """Accept a diplomatic proposal."""
        proposal = self.active_proposals.get(proposal_id)
        if not proposal or proposal.status != "pending":
            return False

        proposal.status = "accepted"
        proposal.resolved_at = datetime.now()

        rel = self.get_or_create_relationship(proposal.proposer_id, proposal.target_id)

        # Apply effects based on action type
        if proposal.action_type == DiplomaticAction.GREETING:
            rel.modify_trust(5.0)
            rel.record_event("greeting", "Friendly greeting exchanged")

        elif proposal.action_type == DiplomaticAction.TRADE_AGREEMENT:
            rel.modify_trust(10.0)
            rel.add_agreement("trade", proposal.terms)
            rel.record_event("trade_agreement", "Trade agreement signed")

        elif proposal.action_type == DiplomaticAction.ALLIANCE_PROPOSAL:
            rel.modify_trust(30.0)
            rel.status = RelationshipStatus.ALLIED
            rel.add_agreement("alliance", proposal.terms)
            rel.record_event("alliance", "Alliance formed")

        elif proposal.action_type == DiplomaticAction.PEACE_TREATY:
            rel.modify_trust(20.0)
            rel.status = RelationshipStatus.NEUTRAL
            rel.add_agreement("peace", proposal.terms)
            rel.record_event("peace_treaty", "Peace treaty signed")

        elif proposal.action_type == DiplomaticAction.KNOWLEDGE_EXCHANGE:
            rel.modify_trust(8.0)
            rel.shared_knowledge_count += 1
            rel.cooperation_count += 1
            rel.record_event("knowledge_exchange", "Knowledge exchanged")

        elif proposal.action_type == DiplomaticAction.RESOURCE_SHARING:
            rel.modify_trust(12.0)
            rel.cooperation_count += 1
            rel.record_event("resource_sharing", "Resources shared")

        del self.active_proposals[proposal_id]

        logger.info(f"✓ Proposal {proposal.action_type.value} accepted between settlements")
        return True

    def reject_proposal(self, proposal_id: str, reason: Optional[str] = None):
        """Reject a diplomatic proposal."""
        proposal = self.active_proposals.get(proposal_id)
        if not proposal or proposal.status != "pending":
            return

        proposal.status = "rejected"
        proposal.resolved_at = datetime.now()

        rel = self.get_or_create_relationship(proposal.proposer_id, proposal.target_id)

        # Rejection affects trust slightly
        trust_impact = {
            DiplomaticAction.GREETING: -2.0,
            DiplomaticAction.TRADE_AGREEMENT: -5.0,
            DiplomaticAction.ALLIANCE_PROPOSAL: -10.0,
            DiplomaticAction.PEACE_TREATY: -15.0,
            DiplomaticAction.KNOWLEDGE_EXCHANGE: -3.0,
            DiplomaticAction.RESOURCE_SHARING: -5.0
        }

        impact = trust_impact.get(proposal.action_type, -5.0)
        rel.modify_trust(impact)
        rel.record_event("proposal_rejected", f"{proposal.action_type.value} rejected - {reason or 'No reason given'}")

        del self.active_proposals[proposal_id]

        logger.info(f"✗ Proposal {proposal.action_type.value} rejected")

    def declare_war(
        self,
        aggressor_id: str,
        aggressor_name: str,
        target_id: str,
        target_name: str,
        reason: str
    ):
        """Declare war between settlements."""
        rel = self.get_or_create_relationship(aggressor_id, target_id)

        rel.modify_trust(-50.0)
        rel.status = RelationshipStatus.WAR
        rel.conflict_count += 1

        # Cancel all agreements
        rel.active_agreements = []

        rel.record_event(
            "war_declared",
            f"{aggressor_name} declared war on {target_name}. Reason: {reason}"
        )

        logger.warning(
            f"⚔️ WAR: '{aggressor_name}' declared war on '{target_name}' - Reason: {reason}"
        )

    def handle_conflict(
        self,
        settlement_a_id: str,
        settlement_b_id: str,
        conflict_type: str,
        victor_id: Optional[str] = None
    ):
        """Handle a conflict between settlements."""
        rel = self.get_or_create_relationship(settlement_a_id, settlement_b_id)

        rel.conflict_count += 1
        rel.modify_trust(-20.0)

        if conflict_type == "skirmish":
            rel.record_event("conflict", "Minor skirmish occurred")
        elif conflict_type == "battle":
            rel.record_event("conflict", f"Major battle - Victor: {victor_id[:8] if victor_id else 'unclear'}")
        elif conflict_type == "raid":
            rel.record_event("conflict", "Settlement raid occurred")

        logger.info(f"⚔️ Conflict ({conflict_type}) between settlements - trust decreased")

    def handle_cooperation(
        self,
        settlement_a_id: str,
        settlement_b_id: str,
        cooperation_type: str
    ):
        """Handle cooperative action between settlements."""
        rel = self.get_or_create_relationship(settlement_a_id, settlement_b_id)

        rel.cooperation_count += 1
        rel.modify_trust(10.0)

        rel.record_event("cooperation", f"Cooperative action: {cooperation_type}")

        logger.info(f"🤝 Cooperation ({cooperation_type}) between settlements - trust increased")

    def decay_relationships(self, hours_elapsed: float = 24.0):
        """Decay relationships over time without interaction."""
        for rel in self.relationships.values():
            hours_since = (datetime.now() - rel.last_interaction_at).total_seconds() / 3600.0

            if hours_since >= hours_elapsed:
                # Extreme relationships decay toward neutral
                if rel.trust_level > 10:
                    rel.modify_trust(-0.5)
                elif rel.trust_level < -10:
                    rel.modify_trust(0.5)

    def get_relationship(
        self,
        settlement_a_id: str,
        settlement_b_id: str
    ) -> Optional[DiplomaticRelationship]:
        """Get relationship between settlements."""
        key = self._get_relationship_key(settlement_a_id, settlement_b_id)
        return self.relationships.get(key)

    def get_allies(self, settlement_id: str) -> List[str]:
        """Get list of allied settlement IDs."""
        allies = []
        for (a_id, b_id), rel in self.relationships.items():
            if rel.status == RelationshipStatus.ALLIED:
                if a_id == settlement_id:
                    allies.append(b_id)
                elif b_id == settlement_id:
                    allies.append(a_id)
        return allies

    def get_enemies(self, settlement_id: str) -> List[str]:
        """Get list of enemy settlement IDs."""
        enemies = []
        for (a_id, b_id), rel in self.relationships.items():
            if rel.status in [RelationshipStatus.HOSTILE, RelationshipStatus.WAR]:
                if a_id == settlement_id:
                    enemies.append(b_id)
                elif b_id == settlement_id:
                    enemies.append(a_id)
        return enemies

    def claim_territory(
        self,
        settlement_id: str,
        region: Dict
    ):
        """Claim a territory for a settlement."""
        if settlement_id not in self.territorial_claims:
            self.territorial_claims[settlement_id] = []

        self.territorial_claims[settlement_id].append({
            "region": region,
            "claimed_at": datetime.now().isoformat()
        })

        # Check for overlapping claims
        for other_settlement_id, claims in self.territorial_claims.items():
            if other_settlement_id == settlement_id:
                continue

            for claim in claims:
                if self._regions_overlap(region, claim["region"]):
                    # Territorial dispute!
                    rel = self.get_or_create_relationship(settlement_id, other_settlement_id)
                    rel.modify_trust(-15.0)
                    rel.record_event(
                        "territorial_dispute",
                        f"Overlapping territorial claims detected"
                    )

                    logger.warning(
                        f"⚠️ Territorial dispute between {settlement_id[:8]} and {other_settlement_id[:8]}"
                    )

    def _regions_overlap(self, region_a: Dict, region_b: Dict) -> bool:
        """Check if two regions overlap."""
        # Simple bounding box overlap check
        a_x1, a_y1 = region_a["min_x"], region_a["min_y"]
        a_x2, a_y2 = region_a["max_x"], region_a["max_y"]
        b_x1, b_y1 = region_b["min_x"], region_b["min_y"]
        b_x2, b_y2 = region_b["max_x"], region_b["max_y"]

        return not (a_x2 < b_x1 or a_x1 > b_x2 or a_y2 < b_y1 or a_y1 > b_y2)


# Global instance
diplomacy_system = DiplomacySystem()
