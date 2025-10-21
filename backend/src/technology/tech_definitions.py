"""Technology definitions for civilization progression."""
from typing import List, Dict


class TechnologyDefinitions:
    """
    Defines all available technologies across eras.

    For Phase 2-3, focusing on Primitive and Ancient eras.
    """

    @staticmethod
    def get_all_technologies() -> List[Dict]:
        """Get all technology definitions."""
        return [
            # ===== PRIMITIVE ERA =====
            {
                "tech_name": "fire",
                "display_name": "Fire Making",
                "tech_era": "primitive",
                "description": "Ability to create and control fire for warmth, light, cooking, and protection",
                "discovery_hint": "Creating heat through friction between dry materials",
                "prerequisites": [],
                "discovery_conditions": {
                    "activity_requirements": {
                        "any_of": ["seeking_warmth", "idle", "exploring"],
                        "min_attempts": 5
                    },
                    "resource_requirements": {
                        "must_interact_with": ["tree", "bush"]
                    },
                    "min_simulation_days": 2
                },
                "base_discovery_probability": 0.08,
                "enables_actions": ["make_fire", "cook_food", "light_area"],
                "enables_recipes": {
                    "fire": {
                        "inputs": [{"item": "wood", "quantity": 3}],
                        "output": {"item": "fire", "quantity": 1},
                        "duration": 120
                    }
                },
                "knowledge_complexity": 3,
                "category": "survival"
            },
            {
                "tech_name": "stone_tools",
                "display_name": "Stone Tool Crafting",
                "tech_era": "primitive",
                "description": "Ability to shape stones into cutting and scraping tools",
                "discovery_hint": "Breaking stones creates sharp edges useful for cutting",
                "prerequisites": [],
                "discovery_conditions": {
                    "activity_requirements": {
                        "any_of": ["gathering_resources", "idle"],
                        "min_attempts": 10
                    },
                    "resource_requirements": {
                        "must_interact_with": ["rock"]
                    },
                    "min_simulation_days": 1
                },
                "base_discovery_probability": 0.12,
                "enables_actions": ["craft_stone_axe", "craft_stone_knife"],
                "enables_recipes": {
                    "stone_axe": {
                        "inputs": [{"item": "stone", "quantity": 2}, {"item": "wood", "quantity": 1}],
                        "output": {"item": "stone_axe", "quantity": 1},
                        "duration": 180
                    }
                },
                "knowledge_complexity": 4,
                "category": "tool_making"
            },
            {
                "tech_name": "basic_shelter",
                "display_name": "Basic Shelter Construction",
                "tech_era": "primitive",
                "description": "Building simple lean-tos and windbreaks for protection from elements",
                "discovery_hint": "Arranging materials can provide protection from weather",
                "prerequisites": [],
                "discovery_conditions": {
                    "activity_requirements": {
                        "any_of": ["seeking_warmth", "resting"],
                        "min_attempts": 8
                    },
                    "resource_requirements": {
                        "must_interact_with": ["tree", "bush"]
                    },
                    "min_simulation_days": 3
                },
                "base_discovery_probability": 0.06,
                "enables_actions": ["build_shelter"],
                "enables_recipes": {},
                "knowledge_complexity": 4,
                "category": "construction"
            },
            {
                "tech_name": "hunting",
                "display_name": "Hunting Techniques",
                "tech_era": "primitive",
                "description": "Tracking and hunting animals for food",
                "discovery_hint": "Animals can be tracked and caught for food",
                "prerequisites": ["stone_tools"],
                "discovery_conditions": {
                    "activity_requirements": {
                        "any_of": ["seeking_food", "gathering_resources"],
                        "min_attempts": 15
                    },
                    "min_simulation_days": 5
                },
                "base_discovery_probability": 0.05,
                "enables_actions": ["hunt_animal", "track_animal"],
                "enables_recipes": {},
                "knowledge_complexity": 5,
                "category": "survival"
            },
            {
                "tech_name": "gathering_knowledge",
                "display_name": "Advanced Gathering",
                "tech_era": "primitive",
                "description": "Understanding which plants are edible and when they grow",
                "discovery_hint": "Observing plants reveals patterns in growth and edibility",
                "prerequisites": [],
                "discovery_conditions": {
                    "activity_requirements": {
                        "any_of": ["gathering_resources"],
                        "min_attempts": 30
                    },
                    "resource_requirements": {
                        "must_interact_with": ["bush"]
                    },
                    "min_simulation_days": 7
                },
                "base_discovery_probability": 0.04,
                "enables_actions": ["identify_plants", "find_food_efficiently"],
                "enables_recipes": {},
                "knowledge_complexity": 4,
                "category": "survival"
            },

            # ===== ANCIENT ERA =====
            {
                "tech_name": "agriculture",
                "display_name": "Crop Cultivation",
                "tech_era": "ancient",
                "description": "Deliberately planting and cultivating crops for food",
                "discovery_hint": "Seeds from gathered plants can be planted to grow more food",
                "prerequisites": ["gathering_knowledge"],
                "discovery_conditions": {
                    "activity_requirements": {
                        "any_of": ["gathering_resources"],
                        "min_attempts": 50
                    },
                    "resource_requirements": {
                        "must_interact_with": ["bush"]
                    },
                    "min_simulation_days": 15
                },
                "base_discovery_probability": 0.02,
                "enables_actions": ["till_soil", "plant_seeds", "harvest_crops"],
                "enables_recipes": {
                    "crop_field": {
                        "inputs": [{"item": "seeds", "quantity": 5}, {"item": "water", "quantity": 10}],
                        "output": {"item": "grown_crops", "quantity": 20},
                        "duration": 14400
                    }
                },
                "knowledge_complexity": 6,
                "category": "agriculture"
            },
            {
                "tech_name": "pottery",
                "display_name": "Pottery Making",
                "tech_era": "ancient",
                "description": "Creating clay vessels for storage and cooking",
                "discovery_hint": "Clay hardens when heated and can hold liquids",
                "prerequisites": ["fire"],
                "discovery_conditions": {
                    "activity_requirements": {
                        "any_of": ["crafting", "idle"],
                        "min_attempts": 20
                    },
                    "min_simulation_days": 10
                },
                "base_discovery_probability": 0.03,
                "enables_actions": ["craft_pottery"],
                "enables_recipes": {},
                "knowledge_complexity": 5,
                "category": "crafting"
            },
            {
                "tech_name": "basic_language",
                "display_name": "Structured Language",
                "tech_era": "ancient",
                "description": "Development of more complex communication beyond basic gestures",
                "discovery_hint": "Complex ideas can be shared through organized sounds and words",
                "prerequisites": [],
                "discovery_conditions": {
                    "activity_requirements": {
                        "any_of": ["socializing"],
                        "min_attempts": 30
                    },
                    "min_simulation_days": 10
                },
                "base_discovery_probability": 0.04,
                "enables_actions": ["teach_complex_concept", "negotiate"],
                "enables_recipes": {},
                "knowledge_complexity": 7,
                "category": "social"
            },
            {
                "tech_name": "animal_domestication",
                "display_name": "Animal Domestication",
                "tech_era": "ancient",
                "description": "Taming and breeding animals for food and labor",
                "discovery_hint": "Some animals can be tamed and bred for resources",
                "prerequisites": ["hunting", "gathering_knowledge"],
                "discovery_conditions": {
                    "activity_requirements": {
                        "any_of": ["hunting"],
                        "min_attempts": 40
                    },
                    "min_simulation_days": 20
                },
                "base_discovery_probability": 0.02,
                "enables_actions": ["tame_animal", "breed_animals"],
                "enables_recipes": {},
                "knowledge_complexity": 7,
                "category": "agriculture"
            },
            {
                "tech_name": "weaving",
                "display_name": "Textile Weaving",
                "tech_era": "ancient",
                "description": "Creating textiles from plant fibers",
                "discovery_hint": "Plant fibers can be interwoven to create cloth",
                "prerequisites": ["gathering_knowledge"],
                "discovery_conditions": {
                    "activity_requirements": {
                        "any_of": ["crafting", "gathering_resources"],
                        "min_attempts": 25
                    },
                    "min_simulation_days": 12
                },
                "base_discovery_probability": 0.03,
                "enables_actions": ["weave_cloth", "craft_clothing"],
                "enables_recipes": {},
                "knowledge_complexity": 6,
                "category": "crafting"
            },
        ]

    @staticmethod
    def get_technology_by_name(tech_name: str) -> Dict:
        """Get a specific technology by name."""
        techs = TechnologyDefinitions.get_all_technologies()
        for tech in techs:
            if tech["tech_name"] == tech_name:
                return tech
        return None

    @staticmethod
    def get_technologies_by_era(era: str) -> List[Dict]:
        """Get all technologies in a specific era."""
        techs = TechnologyDefinitions.get_all_technologies()
        return [t for t in techs if t["tech_era"] == era]

    @staticmethod
    def get_discoverable_technologies(known_tech_names: List[str]) -> List[Dict]:
        """
        Get technologies that can be discovered based on known technologies.

        A technology is discoverable if all its prerequisites are known.
        """
        all_techs = TechnologyDefinitions.get_all_technologies()
        discoverable = []

        for tech in all_techs:
            # Skip if already known
            if tech["tech_name"] in known_tech_names:
                continue

            # Check if all prerequisites are met
            prereqs = tech.get("prerequisites", [])
            if all(prereq in known_tech_names for prereq in prereqs):
                discoverable.append(tech)

        return discoverable
