"""Relationship management system."""
import logging
from typing import Dict, List, Optional, Tuple
from datetime import datetime

logger = logging.getLogger(__name__)


class Relationship:
    """Represents a relationship between two agents."""

    def __init__(self, agent_a_id: str, agent_b_id: str):
        self.agent_a_id = agent_a_id
        self.agent_b_id = agent_b_id
        self.relationship_score = 0.0  # -100 to +100
        self.trust_level = 0.3  # 0.0 to 1.0
        self.familiarity = 0  # 0 to 100
        self.relationship_type = "neutral"
        self.first_met_at = datetime.now()
        self.last_interaction_at = datetime.now()
        self.interaction_count = 0
        self.shared_experiences = []

    def update_score(self, delta: float):
        """Update relationship score."""
        self.relationship_score = max(-100.0, min(100.0, self.relationship_score + delta))
        self._update_relationship_type()

    def update_trust(self, delta: float):
        """Update trust level."""
        self.trust_level = max(0.0, min(1.0, self.trust_level + delta))

    def interact(self):
        """Record an interaction."""
        self.interaction_count += 1
        self.familiarity = min(100, self.familiarity + 1)
        self.last_interaction_at = datetime.now()

    def _update_relationship_type(self):
        """Update relationship type based on score and familiarity."""
        score = self.relationship_score
        fam = self.familiarity

        if score > 60 and self.trust_level > 0.7 and fam > 50:
            self.relationship_type = "close_friend"
        elif score > 40 and fam > 30:
            self.relationship_type = "friend"
        elif score > 20:
            self.relationship_type = "acquaintance"
        elif -20 <= score <= 20:
            self.relationship_type = "neutral"
        elif score < -40 and fam > 20:
            self.relationship_type = "rival"
        elif score < -60:
            self.relationship_type = "enemy"
        else:
            self.relationship_type = "neutral"

    def to_dict(self) -> Dict:
        """Convert to dictionary."""
        return {
            "agent_a_id": self.agent_a_id,
            "agent_b_id": self.agent_b_id,
            "relationship_score": self.relationship_score,
            "trust_level": self.trust_level,
            "familiarity": self.familiarity,
            "relationship_type": self.relationship_type,
            "interaction_count": self.interaction_count,
            "first_met_at": self.first_met_at.isoformat(),
            "last_interaction_at": self.last_interaction_at.isoformat(),
        }


class RelationshipManager:
    """Manages relationships between agents."""

    def __init__(self):
        # Store relationships: (agent_a_id, agent_b_id) -> Relationship
        self.relationships: Dict[Tuple[str, str], Relationship] = {}

    def _get_relationship_key(self, agent_a_id: str, agent_b_id: str) -> Tuple[str, str]:
        """Get normalized relationship key (always smaller ID first)."""
        return tuple(sorted([agent_a_id, agent_b_id]))

    def get_relationship(self, agent_a_id: str, agent_b_id: str) -> Optional[Relationship]:
        """Get relationship between two agents."""
        key = self._get_relationship_key(agent_a_id, agent_b_id)
        return self.relationships.get(key)

    def get_or_create_relationship(self, agent_a_id: str, agent_b_id: str) -> Relationship:
        """Get existing relationship or create new one."""
        key = self._get_relationship_key(agent_a_id, agent_b_id)

        if key not in self.relationships:
            self.relationships[key] = Relationship(agent_a_id, agent_b_id)
            logger.info(f"Created new relationship between {agent_a_id[:8]} and {agent_b_id[:8]}")

        return self.relationships[key]

    def update_relationship(
        self,
        agent_a_id: str,
        agent_b_id: str,
        score_delta: float = 0.0,
        trust_delta: float = 0.0,
        interaction: bool = True
    ):
        """Update relationship between two agents."""
        rel = self.get_or_create_relationship(agent_a_id, agent_b_id)

        if score_delta != 0:
            rel.update_score(score_delta)

        if trust_delta != 0:
            rel.update_trust(trust_delta)

        if interaction:
            rel.interact()

    def get_agent_relationships(self, agent_id: str, min_score: float = None) -> List[Relationship]:
        """Get all relationships for an agent."""
        agent_rels = []

        for (a_id, b_id), rel in self.relationships.items():
            if agent_id in (a_id, b_id):
                if min_score is None or rel.relationship_score >= min_score:
                    agent_rels.append(rel)

        # Sort by relationship score
        agent_rels.sort(key=lambda r: r.relationship_score, reverse=True)
        return agent_rels

    def get_friends(self, agent_id: str) -> List[str]:
        """Get list of agent IDs that are friends (score > 40)."""
        friends = []
        for rel in self.get_agent_relationships(agent_id, min_score=40):
            friend_id = rel.agent_b_id if rel.agent_a_id == agent_id else rel.agent_a_id
            friends.append(friend_id)
        return friends

    def get_nearby_agents_for_interaction(
        self,
        agent_id: str,
        all_agents: List[Dict],
        radius: float = 5.0
    ) -> List[str]:
        """Get nearby agents suitable for interaction."""
        nearby = []

        # Get agent position
        agent_pos = None
        for a in all_agents:
            if a["id"] == agent_id:
                agent_pos = a["position"]
                break

        if not agent_pos:
            return []

        # Find agents within radius
        for other_agent in all_agents:
            if other_agent["id"] == agent_id or not other_agent.get("is_alive", True):
                continue

            other_pos = other_agent["position"]
            distance = ((agent_pos[0] - other_pos[0]) ** 2 + (agent_pos[1] - other_pos[1]) ** 2) ** 0.5

            if distance <= radius:
                nearby.append(other_agent["id"])

        return nearby

    def handle_positive_interaction(self, agent_a_id: str, agent_b_id: str, interaction_type: str):
        """Handle a positive interaction between agents."""
        score_changes = {
            "greeting": 2,
            "cooperation": 5,
            "teaching": 8,
            "gift": 10,
            "help": 15,
        }

        score_delta = score_changes.get(interaction_type, 3)
        trust_delta = 0.02

        self.update_relationship(agent_a_id, agent_b_id, score_delta, trust_delta, interaction=True)

    def handle_negative_interaction(self, agent_a_id: str, agent_b_id: str, interaction_type: str):
        """Handle a negative interaction between agents."""
        score_changes = {
            "disagreement": -3,
            "theft": -30,
            "betrayal": -50,
            "aggression": -60,
        }

        score_delta = score_changes.get(interaction_type, -5)
        trust_delta = -0.05

        self.update_relationship(agent_a_id, agent_b_id, score_delta, trust_delta, interaction=True)

    def decay_relationships(self, hours_elapsed: float = 24.0):
        """Decay relationships over time if no interaction."""
        for rel in self.relationships.values():
            hours_since_interaction = (datetime.now() - rel.last_interaction_at).total_seconds() / 3600.0

            if hours_since_interaction >= hours_elapsed:
                # Positive relationships decay slowly
                if rel.relationship_score > 0:
                    rel.update_score(-0.1)
                # Negative relationships heal slowly
                elif rel.relationship_score < 0:
                    rel.update_score(0.2)


# Global instance
relationship_manager = RelationshipManager()
