"""Cultural evolution and tradition system."""
import logging
from typing import Dict, List, Optional, Set
from datetime import datetime
from collections import defaultdict
import random

logger = logging.getLogger(__name__)


class CulturalTrait:
    """Represents a cultural trait of a settlement."""

    def __init__(
        self,
        trait_id: str,
        trait_type: str,
        name: str,
        description: str,
        strength: float = 1.0
    ):
        self.id = trait_id
        self.trait_type = trait_type  # values, practices, beliefs, aesthetics, social_norms
        self.name = name
        self.description = description
        self.strength = strength  # 0.0 to 10.0, how strongly held
        self.emerged_at = datetime.now()
        self.adherents: Set[str] = set()  # agent IDs who follow this trait

    def add_adherent(self, agent_id: str):
        """Add an agent who follows this trait."""
        self.adherents.add(agent_id)

    def remove_adherent(self, agent_id: str):
        """Remove an agent from adherents."""
        if agent_id in self.adherents:
            self.adherents.remove(agent_id)

    def strengthen(self, amount: float = 0.1):
        """Strengthen the trait."""
        self.strength = min(10.0, self.strength + amount)

    def weaken(self, amount: float = 0.1):
        """Weaken the trait."""
        self.strength = max(0.0, self.strength - amount)


class Tradition:
    """Represents a tradition or ritual."""

    def __init__(
        self,
        tradition_id: str,
        name: str,
        description: str,
        trigger: str,
        effects: Dict[str, any]
    ):
        self.id = tradition_id
        self.name = name
        self.description = description
        self.trigger = trigger  # when this tradition occurs
        self.effects = effects  # effects of the tradition
        self.times_practiced = 0
        self.last_practiced_at: Optional[datetime] = None
        self.established_at = datetime.now()


class SettlementCulture:
    """Represents the culture of a settlement."""

    def __init__(self, settlement_id: str, settlement_name: str):
        self.settlement_id = settlement_id
        self.settlement_name = settlement_name

        # Cultural traits
        self.traits: Dict[str, CulturalTrait] = {}

        # Traditions
        self.traditions: Dict[str, Tradition] = {}

        # Values (abstract concepts)
        self.core_values: List[str] = []  # e.g., "cooperation", "innovation", "tradition"

        # Language/naming conventions
        self.language_style: Optional[str] = None  # "harsh", "melodic", "guttural", etc.

        # Identity markers
        self.settlement_identity: Dict[str, any] = {
            "founding_story": None,
            "rivals": [],
            "allies": [],
            "achievements": [],
        }

        # Cultural drift tracking
        self.cultural_events: List[Dict] = []

    def add_trait(self, trait: CulturalTrait):
        """Add a cultural trait."""
        self.traits[trait.id] = trait
        logger.info(f"Settlement '{self.settlement_name}' developed trait: {trait.name}")

    def add_tradition(self, tradition: Tradition):
        """Add a tradition."""
        self.traditions[tradition.id] = tradition
        logger.info(f"Settlement '{self.settlement_name}' established tradition: {tradition.name}")

    def practice_tradition(self, tradition_id: str):
        """Practice a tradition."""
        tradition = self.traditions.get(tradition_id)
        if tradition:
            tradition.times_practiced += 1
            tradition.last_practiced_at = datetime.now()

    def to_dict(self) -> Dict:
        """Convert to dictionary."""
        return {
            "settlement_id": self.settlement_id,
            "settlement_name": self.settlement_name,
            "traits": [
                {
                    "name": t.name,
                    "type": t.trait_type,
                    "strength": t.strength,
                    "adherents": len(t.adherents)
                }
                for t in self.traits.values()
            ],
            "traditions": [
                {
                    "name": t.name,
                    "description": t.description,
                    "times_practiced": t.times_practiced
                }
                for t in self.traditions.values()
            ],
            "core_values": self.core_values,
            "identity": self.settlement_identity
        }


class CultureSystem:
    """Manages cultural evolution across settlements."""

    def __init__(self):
        # Settlement cultures: settlement_id -> SettlementCulture
        self.settlement_cultures: Dict[str, SettlementCulture] = {}

        # Agent cultural affiliations: agent_id -> settlement_id
        self.agent_cultures: Dict[str, str] = {}

        # Predefined trait templates
        self.trait_templates = self._initialize_trait_templates()

        # Tradition templates
        self.tradition_templates = self._initialize_tradition_templates()

    def _initialize_trait_templates(self) -> Dict[str, Dict]:
        """Initialize cultural trait templates."""
        return {
            "cooperative_values": {
                "type": "values",
                "name": "Spirit of Cooperation",
                "description": "This settlement values working together and sharing resources.",
                "requirements": {"min_positive_interactions": 50}
            },
            "innovation_focus": {
                "type": "values",
                "name": "Drive for Innovation",
                "description": "This settlement celebrates discovering new technologies and methods.",
                "requirements": {"min_technologies": 5}
            },
            "warrior_culture": {
                "type": "values",
                "name": "Warrior Spirit",
                "description": "This settlement values strength and martial prowess.",
                "requirements": {"min_conflicts": 10}
            },
            "peaceful_nature": {
                "type": "values",
                "name": "Path of Peace",
                "description": "This settlement prefers diplomatic solutions and avoids conflict.",
                "requirements": {"max_conflicts": 2, "min_age_days": 20}
            },
            "knowledge_keepers": {
                "type": "practices",
                "name": "Keepers of Knowledge",
                "description": "This settlement preserves and shares knowledge actively.",
                "requirements": {"min_teaching_events": 20}
            },
            "resource_abundant": {
                "type": "practices",
                "name": "Culture of Plenty",
                "description": "This settlement has abundant resources and shares generously.",
                "requirements": {"total_resources": 200}
            },
            "storytelling_tradition": {
                "type": "practices",
                "name": "Oral Storytelling",
                "description": "This settlement passes down history through stories.",
                "requirements": {"min_age_days": 10}
            },
            "craftsmanship_pride": {
                "type": "aesthetics",
                "name": "Pride in Craftsmanship",
                "description": "This settlement takes pride in quality craftwork.",
                "requirements": {"crafters": 3}
            }
        }

    def _initialize_tradition_templates(self) -> Dict[str, Dict]:
        """Initialize tradition templates."""
        return {
            "harvest_celebration": {
                "name": "Harvest Celebration",
                "description": "A celebration when crops are harvested",
                "trigger": "successful_harvest",
                "effects": {"morale_boost": 5, "social_bonus": 2}
            },
            "welcoming_ritual": {
                "name": "Welcoming Ceremony",
                "description": "A ritual to welcome new members to the settlement",
                "trigger": "new_member",
                "effects": {"integration_speed": 1.5, "loyalty_boost": 3}
            },
            "knowledge_sharing": {
                "name": "Council of Elders",
                "description": "Regular gatherings to share knowledge and wisdom",
                "trigger": "periodic",
                "effects": {"learning_speed": 1.2, "cultural_cohesion": 2}
            },
            "remembrance": {
                "name": "Remembrance Ritual",
                "description": "Honoring those who have passed",
                "trigger": "agent_death",
                "effects": {"grief_processing": 5, "community_bonds": 3}
            }
        }

    def create_or_get_culture(self, settlement_id: str, settlement_name: str) -> SettlementCulture:
        """Create or get settlement culture."""
        if settlement_id not in self.settlement_cultures:
            culture = SettlementCulture(settlement_id, settlement_name)
            self.settlement_cultures[settlement_id] = culture
            logger.info(f"Created culture for settlement '{settlement_name}'")
        return self.settlement_cultures[settlement_id]

    def check_and_develop_traits(
        self,
        settlement_id: str,
        settlement_data: Dict,
        agent_data: List[Dict]
    ):
        """
        Check if settlement should develop new cultural traits.

        Args:
            settlement_id: Settlement ID
            settlement_data: Settlement statistics
            agent_data: List of agent data for settlement members
        """
        culture = self.settlement_cultures.get(settlement_id)
        if not culture:
            return

        # Calculate settlement statistics
        stats = self._calculate_settlement_stats(settlement_data, agent_data)

        # Check each trait template
        for trait_key, template in self.trait_templates.items():
            # Skip if already have this trait
            if trait_key in culture.traits:
                continue

            # Check requirements
            if self._check_trait_requirements(template["requirements"], stats):
                # Develop this trait!
                trait = CulturalTrait(
                    trait_id=trait_key,
                    trait_type=template["type"],
                    name=template["name"],
                    description=template["description"],
                    strength=1.0
                )

                culture.add_trait(trait)

                # Add cultural event
                culture.cultural_events.append({
                    "type": "trait_emerged",
                    "trait": template["name"],
                    "timestamp": datetime.now().isoformat()
                })

    def _calculate_settlement_stats(
        self,
        settlement_data: Dict,
        agent_data: List[Dict]
    ) -> Dict:
        """Calculate statistics about a settlement."""
        stats = {
            "population": settlement_data.get("population", 0),
            "age_days": (datetime.now() - datetime.fromisoformat(settlement_data.get("founded_at", datetime.now().isoformat()))).days,
            "total_resources": sum(settlement_data.get("resources_stockpile", {}).values()),
            "crafters": 0,
            "farmers": 0,
            "hunters": 0,
        }

        # Count specialized agents
        for agent in agent_data:
            role = agent.get("primary_role")
            if role in stats:
                stats[role] += 1

        return stats

    def _check_trait_requirements(self, requirements: Dict, stats: Dict) -> bool:
        """Check if trait requirements are met."""
        for req_key, req_value in requirements.items():
            if req_key.startswith("min_"):
                stat_key = req_key[4:]
                if stats.get(stat_key, 0) < req_value:
                    return False
            elif req_key.startswith("max_"):
                stat_key = req_key[4:]
                if stats.get(stat_key, 0) > req_value:
                    return False
            elif req_key in stats:
                if stats[req_key] < req_value:
                    return False

        return True

    def establish_tradition(
        self,
        settlement_id: str,
        tradition_key: str
    ) -> bool:
        """Establish a tradition for a settlement."""
        culture = self.settlement_cultures.get(settlement_id)
        if not culture:
            return False

        template = self.tradition_templates.get(tradition_key)
        if not template:
            return False

        # Check if already have this tradition
        if tradition_key in culture.traditions:
            return False

        tradition = Tradition(
            tradition_id=tradition_key,
            name=template["name"],
            description=template["description"],
            trigger=template["trigger"],
            effects=template["effects"]
        )

        culture.add_tradition(tradition)
        return True

    def trigger_tradition(
        self,
        settlement_id: str,
        trigger_type: str
    ) -> List[Dict]:
        """
        Trigger traditions based on an event.

        Returns:
            List of tradition effects applied
        """
        culture = self.settlement_cultures.get(settlement_id)
        if not culture:
            return []

        applied_effects = []

        for tradition in culture.traditions.values():
            if tradition.trigger == trigger_type:
                culture.practice_tradition(tradition.id)
                applied_effects.append({
                    "tradition": tradition.name,
                    "effects": tradition.effects
                })

                logger.info(
                    f"Settlement '{culture.settlement_name}' practiced tradition: {tradition.name}"
                )

        return applied_effects

    def cultural_exchange(
        self,
        settlement_a_id: str,
        settlement_b_id: str,
        interaction_type: str = "peaceful"
    ):
        """
        Handle cultural exchange between settlements.

        Args:
            settlement_a_id: First settlement
            settlement_b_id: Second settlement
            interaction_type: "peaceful", "trade", "conflict"
        """
        culture_a = self.settlement_cultures.get(settlement_a_id)
        culture_b = self.settlement_cultures.get(settlement_b_id)

        if not culture_a or not culture_b:
            return

        if interaction_type in ["peaceful", "trade"]:
            # Chance to adopt traits from each other
            if random.random() < 0.3:  # 30% chance
                # A adopts trait from B
                available_traits = [t for t in culture_b.traits.values() if t.id not in culture_a.traits]
                if available_traits:
                    trait_to_adopt = random.choice(available_traits)
                    new_trait = CulturalTrait(
                        trait_id=trait_to_adopt.id,
                        trait_type=trait_to_adopt.trait_type,
                        name=trait_to_adopt.name,
                        description=trait_to_adopt.description,
                        strength=trait_to_adopt.strength * 0.5  # Weaker when adopted
                    )
                    culture_a.add_trait(new_trait)
                    logger.info(
                        f"Cultural exchange: '{culture_a.settlement_name}' adopted "
                        f"'{trait_to_adopt.name}' from '{culture_b.settlement_name}'"
                    )

        elif interaction_type == "conflict":
            # Conflict strengthens distinct identity
            for trait in culture_a.traits.values():
                trait.strengthen(0.2)

            for trait in culture_b.traits.values():
                trait.strengthen(0.2)

            # Mark as rivals
            if settlement_b_id not in culture_a.settlement_identity["rivals"]:
                culture_a.settlement_identity["rivals"].append(settlement_b_id)

            if settlement_a_id not in culture_b.settlement_identity["rivals"]:
                culture_b.settlement_identity["rivals"].append(settlement_a_id)

    def assign_agent_to_culture(self, agent_id: str, settlement_id: str):
        """Assign an agent to a settlement's culture."""
        self.agent_cultures[agent_id] = settlement_id

        culture = self.settlement_cultures.get(settlement_id)
        if culture:
            # Agent adopts all traits
            for trait in culture.traits.values():
                trait.add_adherent(agent_id)

    def remove_agent_from_culture(self, agent_id: str):
        """Remove an agent from their culture."""
        settlement_id = self.agent_cultures.get(agent_id)
        if settlement_id:
            culture = self.settlement_cultures.get(settlement_id)
            if culture:
                # Remove from all traits
                for trait in culture.traits.values():
                    trait.remove_adherent(agent_id)

            del self.agent_cultures[agent_id]

    def get_settlement_culture(self, settlement_id: str) -> Optional[SettlementCulture]:
        """Get culture for a settlement."""
        return self.settlement_cultures.get(settlement_id)

    def get_cultural_similarity(self, settlement_a_id: str, settlement_b_id: str) -> float:
        """
        Calculate cultural similarity between two settlements.

        Returns:
            Similarity score 0.0 to 1.0
        """
        culture_a = self.settlement_cultures.get(settlement_a_id)
        culture_b = self.settlement_cultures.get(settlement_b_id)

        if not culture_a or not culture_b:
            return 0.0

        # Count shared traits
        traits_a = set(culture_a.traits.keys())
        traits_b = set(culture_b.traits.keys())

        if not traits_a and not traits_b:
            return 0.5  # Both new settlements

        shared_traits = traits_a & traits_b
        total_traits = traits_a | traits_b

        if not total_traits:
            return 0.5

        return len(shared_traits) / len(total_traits)


# Global instance
culture_system = CultureSystem()
