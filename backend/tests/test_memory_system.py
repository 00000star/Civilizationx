"""
Unit Tests for Memory System

Tests memory creation, retrieval, and composite scoring.

Run with: pytest tests/test_memory_system.py -v
"""
import pytest
from datetime import datetime, timedelta
from src.agents.memory.memory_manager import memory_manager


@pytest.fixture
def clean_memory_manager():
    """Reset memory manager between tests."""
    memory_manager.memories = {}
    memory_manager.memory_access_log = {}
    yield memory_manager
    memory_manager.memories = {}
    memory_manager.memory_access_log = {}


class TestMemoryCreation:
    """Test memory creation."""

    def test_create_episodic_memory(self, clean_memory_manager):
        """Test creating an episodic memory."""
        memory = memory_manager.create_memory(
            agent_id="agent_1",
            memory_type="episodic",
            content="I gathered berries from the forest",
            importance_score=5.0,
            metadata={"location": (10, 20), "activity": "gathering"}
        )

        assert memory["memory_type"] == "episodic"
        assert memory["content"] == "I gathered berries from the forest"
        assert memory["importance_score"] == 5.0
        assert memory["agent_id"] == "agent_1"

    def test_importance_score_clamping(self, clean_memory_manager):
        """Test that importance scores are clamped to 1-10 range."""
        # Too high
        memory_high = memory_manager.create_memory(
            agent_id="agent_1",
            memory_type="episodic",
            content="Test",
            importance_score=100.0
        )
        assert memory_high["importance_score"] == 10.0

        # Too low
        memory_low = memory_manager.create_memory(
            agent_id="agent_1",
            memory_type="episodic",
            content="Test",
            importance_score=-5.0
        )
        assert memory_low["importance_score"] == 1.0


class TestMemoryRetrieval:
    """Test memory retrieval with composite scoring."""

    def test_retrieve_recent_memories(self, clean_memory_manager):
        """Test retrieving recent memories."""
        # Create memories over time
        for i in range(10):
            memory_manager.create_memory(
                agent_id="agent_1",
                memory_type="episodic",
                content=f"Memory {i}",
                importance_score=5.0
            )

        recent = memory_manager.get_recent_memories("agent_1", hours=24, limit=5)

        assert len(recent) <= 5
        # Most recent should be first
        assert "Memory 9" in recent[0]["content"]

    def test_importance_affects_retrieval(self, clean_memory_manager):
        """Test that high-importance memories are prioritized."""
        # Create one very important memory
        memory_manager.create_memory(
            agent_id="agent_1",
            memory_type="episodic",
            content="CRITICAL EVENT",
            importance_score=10.0
        )

        # Create many low-importance memories
        for i in range(20):
            memory_manager.create_memory(
                agent_id="agent_1",
                memory_type="episodic",
                content=f"Minor event {i}",
                importance_score=2.0
            )

        # Retrieve with importance weighting
        memories = memory_manager.retrieve_memories(
            agent_id="agent_1",
            k=5,
            importance_weight=3.0,  # Heavy importance weighting
            recency_weight=1.0
        )

        # Critical event should be in top results
        contents = [m["content"] for m in memories]
        assert "CRITICAL EVENT" in contents

    def test_agent_isolation(self, clean_memory_manager):
        """Test that agents only retrieve their own memories."""
        memory_manager.create_memory(
            agent_id="agent_1",
            memory_type="episodic",
            content="Agent 1 memory",
            importance_score=5.0
        )

        memory_manager.create_memory(
            agent_id="agent_2",
            memory_type="episodic",
            content="Agent 2 memory",
            importance_score=5.0
        )

        agent_1_memories = memory_manager.get_all_memories("agent_1")
        agent_2_memories = memory_manager.get_all_memories("agent_2")

        assert len(agent_1_memories) == 1
        assert len(agent_2_memories) == 1
        assert agent_1_memories[0]["content"] == "Agent 1 memory"
        assert agent_2_memories[0]["content"] == "Agent 2 memory"


class TestMemoryTypes:
    """Test different memory types."""

    def test_all_memory_types(self, clean_memory_manager):
        """Test creating all memory types."""
        types = ["episodic", "semantic", "procedural", "collective"]

        for memory_type in types:
            memory = memory_manager.create_memory(
                agent_id="agent_1",
                memory_type=memory_type,
                content=f"Test {memory_type} memory",
                importance_score=5.0
            )

            assert memory["memory_type"] == memory_type

    def test_filter_by_memory_type(self, clean_memory_manager):
        """Test filtering memories by type."""
        # Create different types
        memory_manager.create_memory(
            agent_id="agent_1",
            memory_type="episodic",
            content="Episodic",
            importance_score=5.0
        )

        memory_manager.create_memory(
            agent_id="agent_1",
            memory_type="semantic",
            content="Semantic",
            importance_score=5.0
        )

        all_memories = memory_manager.get_all_memories("agent_1")
        episodic = [m for m in all_memories if m["memory_type"] == "episodic"]
        semantic = [m for m in all_memories if m["memory_type"] == "semantic"]

        assert len(episodic) == 1
        assert len(semantic) == 1
