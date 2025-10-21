"""Memory management system for agents."""
import logging
from typing import List, Dict, Optional
from datetime import datetime
import hashlib
import json

logger = logging.getLogger(__name__)


class MemoryManager:
    """
    Manages agent memories with retrieval and scoring.

    Phase 1: In-memory storage (no database yet)
    Future: Will use PostgreSQL with pgvector
    """

    def __init__(self):
        # In-memory storage: agent_id -> list of memories
        self.memories: Dict[str, List[Dict]] = {}

    def create_memory(
        self,
        agent_id: str,
        memory_type: str,
        content: str,
        importance_score: float = 5.0,
        metadata: Optional[Dict] = None
    ) -> Dict:
        """
        Create a new memory for an agent.

        Args:
            agent_id: Agent's ID
            memory_type: 'episodic', 'semantic', 'procedural', or 'collective'
            content: Memory content in natural language
            importance_score: 1-10, how important this memory is
            metadata: Additional metadata (location, involved_agents, etc.)

        Returns:
            Created memory dictionary
        """
        if agent_id not in self.memories:
            self.memories[agent_id] = []

        # Generate simple ID
        memory_id = hashlib.md5(
            f"{agent_id}_{len(self.memories[agent_id])}_{datetime.now().isoformat()}".encode()
        ).hexdigest()[:16]

        memory = {
            "id": memory_id,
            "agent_id": agent_id,
            "memory_type": memory_type,
            "content": content,
            "importance_score": max(1.0, min(10.0, importance_score)),
            "created_at": datetime.now(),
            "last_accessed_at": datetime.now(),
            "access_count": 0,
            "metadata": metadata or {},
        }

        self.memories[agent_id].append(memory)
        logger.debug(f"Created {memory_type} memory for agent {agent_id}: {content[:50]}...")

        return memory

    def retrieve_memories(
        self,
        agent_id: str,
        query_context: Optional[str] = None,
        memory_type: Optional[str] = None,
        k: int = 20,
        recency_weight: float = 1.0,
        importance_weight: float = 1.0,
        relevance_weight: float = 1.0
    ) -> List[Dict]:
        """
        Retrieve memories using composite scoring.

        Args:
            agent_id: Agent's ID
            query_context: Context for relevance scoring
            memory_type: Filter by type (or None for all)
            k: Number of memories to retrieve
            recency_weight: Weight for recency score
            importance_weight: Weight for importance score
            relevance_weight: Weight for relevance score

        Returns:
            List of top k memories sorted by composite score
        """
        if agent_id not in self.memories:
            return []

        agent_memories = self.memories[agent_id]

        # Filter by type if specified
        if memory_type:
            agent_memories = [m for m in agent_memories if m["memory_type"] == memory_type]

        # Calculate composite scores
        now = datetime.now()
        scored_memories = []

        for memory in agent_memories:
            # Recency score (exponential decay)
            hours_since_access = (now - memory["last_accessed_at"]).total_seconds() / 3600.0
            decay_rate = 0.99
            recency_score = decay_rate ** hours_since_access

            # Importance score (normalized)
            importance_score = memory["importance_score"] / 10.0

            # Relevance score (simple keyword matching for now, TODO: use embeddings)
            relevance_score = 0.5  # Default neutral relevance
            if query_context:
                relevance_score = self._calculate_relevance(memory["content"], query_context)

            # Composite score
            composite_score = (
                recency_score * recency_weight +
                importance_score * importance_weight +
                relevance_score * relevance_weight
            )

            scored_memories.append((composite_score, memory))

        # Sort by score and take top k
        scored_memories.sort(key=lambda x: x[0], reverse=True)
        top_memories = [m for _, m in scored_memories[:k]]

        # Update access timestamps
        for memory in top_memories:
            memory["last_accessed_at"] = now
            memory["access_count"] += 1

        return top_memories

    def _calculate_relevance(self, memory_content: str, query_context: str) -> float:
        """
        Calculate relevance between memory and query using simple keyword matching.

        TODO: Replace with proper embedding-based similarity using pgvector
        """
        memory_words = set(memory_content.lower().split())
        query_words = set(query_context.lower().split())

        if not memory_words or not query_words:
            return 0.5

        # Jaccard similarity
        intersection = memory_words & query_words
        union = memory_words | query_words

        return len(intersection) / len(union) if union else 0.0

    def get_recent_memories(self, agent_id: str, hours: int = 24, limit: int = 50) -> List[Dict]:
        """Get recent memories within time window."""
        if agent_id not in self.memories:
            return []

        cutoff = datetime.now().timestamp() - (hours * 3600)
        recent = [
            m for m in self.memories[agent_id]
            if m["created_at"].timestamp() > cutoff
        ]

        # Sort by creation time, most recent first
        recent.sort(key=lambda m: m["created_at"], reverse=True)
        return recent[:limit]

    def get_important_memories(self, agent_id: str, min_importance: float = 7.0, limit: int = 20) -> List[Dict]:
        """Get highly important memories."""
        if agent_id not in self.memories:
            return []

        important = [
            m for m in self.memories[agent_id]
            if m["importance_score"] >= min_importance
        ]

        # Sort by importance
        important.sort(key=lambda m: m["importance_score"], reverse=True)
        return important[:limit]

    def count_memories_since(self, agent_id: str, since: datetime) -> int:
        """Count memories created since a timestamp."""
        if agent_id not in self.memories:
            return 0

        return sum(1 for m in self.memories[agent_id] if m["created_at"] > since)

    def get_all_memories(self, agent_id: str) -> List[Dict]:
        """Get all memories for an agent."""
        return self.memories.get(agent_id, [])

    def delete_memory(self, agent_id: str, memory_id: str) -> bool:
        """Delete a specific memory."""
        if agent_id not in self.memories:
            return False

        original_count = len(self.memories[agent_id])
        self.memories[agent_id] = [
            m for m in self.memories[agent_id] if m["id"] != memory_id
        ]

        return len(self.memories[agent_id]) < original_count


# Global instance
memory_manager = MemoryManager()
