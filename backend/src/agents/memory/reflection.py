"""Reflection engine for synthesizing insights from memories."""
import logging
import asyncio
from typing import List, Dict
from datetime import datetime, timedelta
from .memory_manager import memory_manager
from src.llm.llm_service import llm_service

logger = logging.getLogger(__name__)


class ReflectionEngine:
    """
    Manages agent reflection - synthesizing higher-level insights from episodic memories.
    """

    def __init__(self):
        # Track last reflection time per agent
        self.last_reflection: Dict[str, datetime] = {}

    def should_reflect(self, agent_id: str, agent_data: Dict) -> bool:
        """
        Check if agent should reflect based on triggers.

        Triggers:
        1. 100+ new memories since last reflection
        2. 24 simulation hours passed
        3. High-importance event (importance >= 8)
        """
        last_reflection_time = self.last_reflection.get(agent_id)

        # First reflection
        if not last_reflection_time:
            memories = memory_manager.get_all_memories(agent_id)
            if len(memories) >= 10:  # Need some memories to reflect on
                return True
            return False

        # Check memory count trigger
        new_memory_count = memory_manager.count_memories_since(agent_id, last_reflection_time)
        if new_memory_count >= 100:
            logger.info(f"Agent {agent_id} reflection triggered: {new_memory_count} new memories")
            return True

        # Check time trigger (24 hours)
        hours_since_reflection = (datetime.now() - last_reflection_time).total_seconds() / 3600.0
        if hours_since_reflection >= 24:
            logger.info(f"Agent {agent_id} reflection triggered: {hours_since_reflection:.1f} hours passed")
            return True

        # Check for high-importance recent events
        recent_important = memory_manager.get_recent_memories(agent_id, hours=1, limit=10)
        for memory in recent_important:
            if memory["importance_score"] >= 8.0:
                logger.info(f"Agent {agent_id} reflection triggered: high-importance event")
                return True

        return False

    async def perform_reflection(self, agent_id: str, agent_name: str) -> List[Dict]:
        """
        Perform reflection for an agent, creating semantic memories from patterns.

        Args:
            agent_id: Agent's ID
            agent_name: Agent's name

        Returns:
            List of generated semantic memories (insights)
        """
        logger.info(f"💭 Agent {agent_name} is reflecting...")

        last_reflection_time = self.last_reflection.get(agent_id, datetime.now() - timedelta(hours=24))

        # Gather recent significant memories
        recent_memories = memory_manager.get_recent_memories(agent_id, hours=24, limit=50)

        # Filter to episodic memories with importance >= 5
        significant_memories = [
            m for m in recent_memories
            if m["memory_type"] == "episodic" and m["importance_score"] >= 5.0
        ]

        if not significant_memories:
            logger.info(f"Agent {agent_name} has no significant memories to reflect on")
            return []

        # Extract insights using LLM or pattern recognition
        insights = await self._extract_insights(agent_id, agent_name, significant_memories)

        # Create semantic memories from insights
        semantic_memories = []
        for insight in insights:
            memory = memory_manager.create_memory(
                agent_id=agent_id,
                memory_type="semantic",
                content=insight["content"],
                importance_score=insight["importance"],
                metadata={"reflection": True, "evidence_count": insight.get("evidence_count", 0)}
            )
            semantic_memories.append(memory)

        # Update last reflection time
        self.last_reflection[agent_id] = datetime.now()

        logger.info(f"✓ Agent {agent_name} reflected and generated {len(semantic_memories)} insights")
        return semantic_memories

    async def _extract_insights(self, agent_id: str, agent_name: str, memories: List[Dict]) -> List[Dict]:
        """
        Extract insights from memories using LLM or pattern recognition.

        Uses LLM (Claude/GPT) when available for complex reasoning.
        Falls back to heuristics otherwise.
        """
        # Try LLM-based insight generation first
        if llm_service.is_available():
            try:
                agent_context = {
                    "name": agent_name,
                    "memories": memories
                }

                insight_texts = await llm_service.generate_reflection_insights(
                    agent_name=agent_name,
                    agent_context=agent_context,
                    significant_memories=memories,
                    max_insights=3
                )

                # Convert to insight format
                insights = []
                for i, insight_text in enumerate(insight_texts):
                    insights.append({
                        "content": insight_text,
                        "importance": 7.0 - (i * 0.5),  # Decreasing importance
                        "evidence_count": len(memories)
                    })

                if insights:
                    logger.info(f"Generated {len(insights)} LLM-based insights for {agent_name}")
                    return insights

            except Exception as e:
                logger.error(f"LLM reflection failed for {agent_name}: {e}")
                # Fall through to pattern-based fallback

        # Fallback: Pattern-based insight generation
        return self._pattern_based_insights(memories)

    def _pattern_based_insights(self, memories: List[Dict]) -> List[Dict]:
        """
        Generate insights using simple pattern recognition (fallback method).
        """
        insights = []

        # Pattern 1: Repeated activities
        activity_counts = {}
        for mem in memories:
            content = mem["content"].lower()
            if "gathered" in content or "collecting" in content:
                activity_counts["gathering"] = activity_counts.get("gathering", 0) + 1
            if "hungry" in content or "starving" in content:
                activity_counts["hunger"] = activity_counts.get("hunger", 0) + 1
            if "tired" in content or "exhausted" in content:
                activity_counts["exhaustion"] = activity_counts.get("exhaustion", 0) + 1

        # Generate insights from patterns
        for activity, count in activity_counts.items():
            if count >= 3:
                if activity == "gathering":
                    insights.append({
                        "content": f"I spend much of my time gathering resources to survive. Finding food is a constant priority.",
                        "importance": 6.0,
                        "evidence_count": count
                    })
                elif activity == "hunger":
                    insights.append({
                        "content": f"Hunger is my greatest challenge. I must be more efficient at finding and storing food.",
                        "importance": 7.0,
                        "evidence_count": count
                    })
                elif activity == "exhaustion":
                    insights.append({
                        "content": f"I often become exhausted. I need to balance my activities better and rest more.",
                        "importance": 6.0,
                        "evidence_count": count
                    })

        # Pattern 2: Resource locations
        location_mentions = {}
        for mem in memories:
            if "location" in mem.get("metadata", {}):
                loc = mem["metadata"]["location"]
                loc_key = f"{int(loc[0]//10)}_{int(loc[1]//10)}"  # Group by 10x10 areas
                location_mentions[loc_key] = location_mentions.get(loc_key, 0) + 1

        # If certain area is visited frequently
        if location_mentions:
            most_visited = max(location_mentions.items(), key=lambda x: x[1])
            if most_visited[1] >= 5:
                insights.append({
                    "content": f"There is a productive area I return to frequently. It seems to have good resources.",
                    "importance": 5.5,
                    "evidence_count": most_visited[1]
                })

        # Pattern 3: Social interactions (if any)
        social_count = sum(1 for m in memories if "talked" in m["content"].lower() or "met" in m["content"].lower())
        if social_count >= 3:
            insights.append({
                "content": f"I encounter other agents regularly. Social interaction could be valuable.",
                "importance": 6.5,
                "evidence_count": social_count
            })

        # Ensure at least one generic insight if no patterns found
        if not insights:
            insights.append({
                "content": f"Each day brings new challenges. Survival requires constant attention to my needs.",
                "importance": 5.0,
                "evidence_count": len(memories)
            })

        return insights


# Global instance
reflection_engine = ReflectionEngine()
