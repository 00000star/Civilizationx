"""Technology discovery engine."""
import logging
import random
import asyncio
from typing import List, Dict, Optional
from .tech_definitions import TechnologyDefinitions
from src.agents.memory.memory_manager import memory_manager
from src.llm.llm_service import llm_service

logger = logging.getLogger(__name__)


class DiscoveryEngine:
    """Manages technology discovery for agents."""

    def __init__(self):
        # Track agent knowledge: agent_id -> list of known tech names
        self.agent_knowledge: Dict[str, List[str]] = {}

        # Track discovery attempts: agent_id -> tech_name -> attempt_count
        self.discovery_attempts: Dict[str, Dict[str, int]] = {}

    async def check_for_discovery(
        self,
        agent_id: str,
        agent_name: str,
        current_activity: str,
        simulation_days: int,
        agent_context: Optional[Dict] = None
    ) -> Optional[Dict]:
        """
        Check if agent discovers a new technology.

        Args:
            agent_id: Agent's ID
            agent_name: Agent's name
            current_activity: What agent is currently doing
            simulation_days: Days since agent was born
            agent_context: Optional agent context for LLM generation

        Returns:
            Discovered technology dict or None
        """
        # Get agent's known technologies
        known_techs = self.agent_knowledge.get(agent_id, [])

        # Get discoverable technologies (prerequisites met)
        discoverable = TechnologyDefinitions.get_discoverable_technologies(known_techs)

        if not discoverable:
            return None

        # Check each technology for discovery
        for tech in discoverable:
            if await self._attempt_discovery(agent_id, agent_name, tech, current_activity, simulation_days, agent_context):
                return tech

        return None

    async def _attempt_discovery(
        self,
        agent_id: str,
        agent_name: str,
        tech: Dict,
        current_activity: str,
        simulation_days: int,
        agent_context: Optional[Dict] = None
    ) -> bool:
        """Attempt to discover a specific technology."""
        conditions = tech.get("discovery_conditions", {})

        # Check minimum simulation days
        min_days = conditions.get("min_simulation_days", 0)
        if simulation_days < min_days:
            return False

        # Check activity requirements
        activity_reqs = conditions.get("activity_requirements", {})
        if activity_reqs:
            required_activities = activity_reqs.get("any_of", [])
            if current_activity not in required_activities:
                return False

            # Track attempts
            min_attempts = activity_reqs.get("min_attempts", 1)
            if agent_id not in self.discovery_attempts:
                self.discovery_attempts[agent_id] = {}
            if tech["tech_name"] not in self.discovery_attempts[agent_id]:
                self.discovery_attempts[agent_id][tech["tech_name"]] = 0

            self.discovery_attempts[agent_id][tech["tech_name"]] += 1

            if self.discovery_attempts[agent_id][tech["tech_name"]] < min_attempts:
                return False

        # Calculate discovery probability
        base_prob = tech["base_discovery_probability"]

        # Era difficulty scaling
        era_difficulty = {
            "primitive": 1.0,
            "ancient": 0.7,
            "classical": 0.5,
            "industrial": 0.3,
            "modern": 0.1
        }
        era_mult = era_difficulty.get(tech["tech_era"], 1.0)

        final_prob = base_prob * era_mult

        # Roll for discovery
        if random.random() < final_prob:
            logger.info(f"🎉 Agent {agent_name} discovered {tech['display_name']}!")
            await self._register_discovery(agent_id, agent_name, tech, agent_context)
            return True

        return False

    async def _register_discovery(self, agent_id: str, agent_name: str, tech: Dict, agent_context: Optional[Dict] = None):
        """Register a successful discovery."""
        tech_name = tech["tech_name"]

        # Add to agent's knowledge
        if agent_id not in self.agent_knowledge:
            self.agent_knowledge[agent_id] = []
        self.agent_knowledge[agent_id].append(tech_name)

        # Generate discovery narrative (LLM or fallback)
        discovery_narrative = await self._generate_discovery_narrative(agent_name, tech, agent_context)
        
        # Create high-importance memory
        memory_manager.create_memory(
            agent_id=agent_id,
            memory_type="episodic",
            content=f"DISCOVERY: {discovery_narrative}",
            importance_score=9.0,
            metadata={
                "technology": tech_name,
                "discovery": True,
                "category": tech["category"]
            }
        )

        logger.info(f"Agent {agent_name} now knows: {', '.join(self.agent_knowledge[agent_id])}")

    async def _generate_discovery_narrative(self, agent_name: str, tech: Dict, agent_context: Optional[Dict] = None) -> str:
        """Generate a narrative for the discovery moment."""
        # Try LLM generation first
        if llm_service.is_available() and agent_context:
            try:
                narrative = await llm_service.generate_discovery_narrative(
                    agent_name=agent_name,
                    technology_name=tech["display_name"],
                    technology_description=tech["description"],
                    agent_context=agent_context
                )
                if narrative:
                    return narrative
            except Exception as e:
                logger.error(f"LLM discovery narrative failed: {e}")
                # Fall through to hardcoded fallback

        # Fallback: Hardcoded narratives
        narratives = {
            "fire": f"Through repeated attempts, I finally created fire by rubbing sticks together! The warmth and light will change everything.",
            "stone_tools": f"By striking stones together, I discovered I can create sharp edges. These tools will make gathering much easier!",
            "basic_shelter": f"I've learned to arrange branches and leaves to create shelter from the wind and rain.",
            "hunting": f"With practice and my new tools, I've become skilled at tracking and hunting animals.",
            "gathering_knowledge": f"I now understand which plants are safe to eat and when they grow best.",
            "agriculture": f"I realized that if I plant seeds, I can grow my own food instead of just gathering! This changes everything.",
            "pottery": f"I discovered that clay, when heated by fire, hardens into useful containers for storing food and water.",
            "basic_language": f"Through interactions with others, I've developed more complex ways to communicate ideas.",
            "animal_domestication": f"I've learned that some animals can be tamed and raised, providing steady food and companionship.",
            "weaving": f"By intertwining plant fibers, I can create cloth for clothing and other uses.",
        }

        return narratives.get(tech["tech_name"], f"I discovered {tech['display_name']}!")

    def teach_technology(
        self,
        teacher_id: str,
        teacher_name: str,
        student_id: str,
        student_name: str,
        tech_name: str
    ) -> bool:
        """
        Teach a technology from one agent to another.

        Returns:
            True if teaching successful, False otherwise
        """
        # Check teacher knows the technology
        teacher_knowledge = self.agent_knowledge.get(teacher_id, [])
        if tech_name not in teacher_knowledge:
            return False

        # Check student doesn't already know it
        student_knowledge = self.agent_knowledge.get(student_id, [])
        if tech_name in student_knowledge:
            return False

        # Check prerequisites
        tech = TechnologyDefinitions.get_technology_by_name(tech_name)
        if not tech:
            return False

        prereqs = tech.get("prerequisites", [])
        if not all(prereq in student_knowledge for prereq in prereqs):
            logger.info(f"Student {student_name} missing prerequisites for {tech_name}")
            return False

        # Teaching success based on complexity
        complexity = tech["knowledge_complexity"]
        success_prob = max(0.5, 1.0 - (complexity / 15))

        if random.random() < success_prob:
            # Successful teaching!
            if student_id not in self.agent_knowledge:
                self.agent_knowledge[student_id] = []
            self.agent_knowledge[student_id].append(tech_name)

            # Create memories
            memory_manager.create_memory(
                agent_id=teacher_id,
                memory_type="episodic",
                content=f"I taught {student_name} about {tech['display_name']}.",
                importance_score=6.0,
                metadata={"teaching": True, "technology": tech_name, "student": student_id}
            )

            memory_manager.create_memory(
                agent_id=student_id,
                memory_type="procedural",
                content=f"{teacher_name} taught me {tech['display_name']}. {tech['description']}",
                importance_score=7.0,
                metadata={"learning": True, "technology": tech_name, "teacher": teacher_id}
            )

            logger.info(f"✓ {teacher_name} successfully taught {tech['display_name']} to {student_name}")
            return True
        else:
            logger.info(f"✗ {student_name} did not fully grasp {tech['display_name']}")
            return False

    def get_agent_technologies(self, agent_id: str) -> List[str]:
        """Get list of technologies known by agent."""
        return self.agent_knowledge.get(agent_id, [])

    def agent_knows_technology(self, agent_id: str, tech_name: str) -> bool:
        """Check if agent knows a specific technology."""
        return tech_name in self.agent_knowledge.get(agent_id, [])


# Global instance
discovery_engine = DiscoveryEngine()
