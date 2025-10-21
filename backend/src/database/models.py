"""
SQLAlchemy Models for AI Civilization Simulation

Complete database schema for persisting simulation state.
Includes agents, memories, technologies, settlements, relationships, and more.
"""
from datetime import datetime
from typing import List, Optional
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime,
    ForeignKey, Text, JSON, ARRAY, Enum as SQLEnum
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, VECTOR
import uuid
import enum


Base = declarative_base()


# Enums
class MemoryType(str, enum.Enum):
    """Memory types."""
    EPISODIC = "episodic"
    SEMANTIC = "semantic"
    PROCEDURAL = "procedural"
    COLLECTIVE = "collective"


class SettlementType(str, enum.Enum):
    """Settlement types."""
    CAMP = "camp"
    VILLAGE = "village"
    TOWN = "town"
    CITY = "city"


class GovernanceType(str, enum.Enum):
    """Governance types."""
    NONE = "none"
    ELDER = "elder"
    COUNCIL = "council"
    CHIEFDOM = "chiefdom"
    DEMOCRACY = "democracy"
    MONARCHY = "monarchy"


class RelationshipType(str, enum.Enum):
    """Relationship types."""
    NEUTRAL = "neutral"
    ACQUAINTANCE = "acquaintance"
    FRIEND = "friend"
    CLOSE_FRIEND = "close_friend"
    RIVAL = "rival"
    ENEMY = "enemy"


class DiplomaticStatus(str, enum.Enum):
    """Diplomatic statuses."""
    UNKNOWN = "unknown"
    NEUTRAL = "neutral"
    FRIENDLY = "friendly"
    ALLIED = "allied"
    TENSE = "tense"
    HOSTILE = "hostile"
    WAR = "war"


# Models
class Agent(Base):
    """Agent model - autonomous simulation entity."""
    __tablename__ = "agents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)

    # Position
    position_x = Column(Float, nullable=False)
    position_y = Column(Float, nullable=False)
    target_x = Column(Float, nullable=True)
    target_y = Column(Float, nullable=True)

    # State
    is_alive = Column(Boolean, default=True)
    birth_time = Column(DateTime, nullable=False, default=datetime.utcnow)
    death_time = Column(DateTime, nullable=True)

    # Needs
    hunger = Column(Float, default=100.0)
    energy = Column(Float, default=100.0)
    social = Column(Float, default=100.0)

    # Activity
    current_activity = Column(String(50), default="idle")

    # Inventory (JSON)
    inventory = Column(JSON, default={})

    # Skills (JSON: skill_name -> skill_level)
    skills = Column(JSON, default={})

    # Personality traits (JSON)
    personality_traits = Column(JSON, default={})

    # Current plan (JSON)
    current_plan = Column(JSON, default={})

    # Settlement membership
    settlement_id = Column(String(36), ForeignKey("settlements.id"), nullable=True)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    memories = relationship("Memory", back_populates="agent", cascade="all, delete-orphan")
    agent_technologies = relationship("AgentTechnology", back_populates="agent", cascade="all, delete-orphan")
    relationships_as_agent_a = relationship(
        "AgentRelationship",
        foreign_keys="AgentRelationship.agent_a_id",
        back_populates="agent_a",
        cascade="all, delete-orphan"
    )
    settlement = relationship("Settlement", back_populates="members")


class Memory(Base):
    """Memory model - agent memories."""
    __tablename__ = "memories"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    agent_id = Column(String(36), ForeignKey("agents.id"), nullable=False)

    # Memory content
    memory_type = Column(SQLEnum(MemoryType), nullable=False)
    content = Column(Text, nullable=False)

    # Vector embedding for semantic search (pgvector)
    # embedding = Column(VECTOR(1536), nullable=True)  # OpenAI ada-002 dimension

    # Scoring
    importance_score = Column(Float, default=5.0)  # 1.0-10.0
    access_count = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    last_accessed_at = Column(DateTime, default=datetime.utcnow)

    # Metadata (JSON: location, involved_agents, tags, etc.)
    metadata = Column(JSON, default={})

    # Parent memory (for reflection-generated memories)
    parent_memory_id = Column(String(36), ForeignKey("memories.id"), nullable=True)

    # Relationships
    agent = relationship("Agent", back_populates="memories")
    parent_memory = relationship("Memory", remote_side=[id])


class Technology(Base):
    """Technology model - discoverable technologies."""
    __tablename__ = "technologies"

    id = Column(String(50), primary_key=True)  # e.g., "fire", "stone_tools"
    display_name = Column(String(100), nullable=False)
    era = Column(String(20), nullable=False)  # primitive, ancient, classical, etc.
    complexity = Column(Integer, default=1)

    # Prerequisites (JSON list)
    prerequisites = Column(JSON, default=[])

    # Discovery conditions (JSON)
    discovery_conditions = Column(JSON, default={})

    # Effects (JSON)
    effects = Column(JSON, default={})

    # Discovery tracking
    first_discovered_at = Column(DateTime, nullable=True)
    first_discovered_by = Column(String(36), ForeignKey("agents.id"), nullable=True)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    agent_technologies = relationship("AgentTechnology", back_populates="technology")


class AgentTechnology(Base):
    """Many-to-many relationship: which agents know which technologies."""
    __tablename__ = "agent_technologies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    agent_id = Column(String(36), ForeignKey("agents.id"), nullable=False)
    technology_id = Column(String(50), ForeignKey("technologies.id"), nullable=False)

    # How did they learn it?
    learned_from = Column(String(20), default="discovery")  # discovery, teaching, observation
    learned_from_agent_id = Column(String(36), ForeignKey("agents.id"), nullable=True)
    learned_at = Column(DateTime, default=datetime.utcnow)

    # Skill level with this technology
    skill_level = Column(Float, default=1.0)

    # Relationships
    agent = relationship("Agent", back_populates="agent_technologies")
    technology = relationship("Technology", back_populates="agent_technologies")


class Settlement(Base):
    """Settlement model - agent communities."""
    __tablename__ = "settlements"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)

    # Type
    settlement_type = Column(SQLEnum(SettlementType), nullable=False)

    # Location
    center_x = Column(Float, nullable=False)
    center_y = Column(Float, nullable=False)
    radius = Column(Float, default=20.0)

    # Governance
    governance_type = Column(SQLEnum(GovernanceType), default=GovernanceType.NONE)
    leader_id = Column(String(36), ForeignKey("agents.id"), nullable=True)

    # Culture (JSON: trait -> strength)
    cultural_traits = Column(JSON, default={})
    traditions = Column(JSON, default=[])

    # Timestamps
    founded_at = Column(DateTime, default=datetime.utcnow)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    members = relationship("Agent", back_populates="settlement")
    diplomatic_relations_as_a = relationship(
        "DiplomaticRelation",
        foreign_keys="DiplomaticRelation.settlement_a_id",
        back_populates="settlement_a"
    )
    wars_as_aggressor = relationship(
        "War",
        foreign_keys="War.aggressor_id",
        back_populates="aggressor"
    )
    wars_as_defender = relationship(
        "War",
        foreign_keys="War.defender_id",
        back_populates="defender"
    )


class AgentRelationship(Base):
    """Relationship between two agents."""
    __tablename__ = "agent_relationships"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    agent_a_id = Column(String(36), ForeignKey("agents.id"), nullable=False)
    agent_b_id = Column(String(36), ForeignKey("agents.id"), nullable=False)

    # Relationship metrics
    relationship_score = Column(Float, default=0.0)  # -100 to +100
    trust = Column(Float, default=0.5)  # 0.0 to 1.0
    familiarity = Column(Float, default=0.0)  # 0 to 100

    # Relationship type
    relationship_type = Column(SQLEnum(RelationshipType), default=RelationshipType.NEUTRAL)

    # Interaction tracking
    total_interactions = Column(Integer, default=0)
    last_interaction_at = Column(DateTime, nullable=True)

    # History (JSON list of interactions)
    interaction_history = Column(JSON, default=[])

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    agent_a = relationship("Agent", foreign_keys=[agent_a_id], back_populates="relationships_as_agent_a")


class DiplomaticRelation(Base):
    """Diplomatic relationship between two settlements."""
    __tablename__ = "diplomatic_relations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    settlement_a_id = Column(String(36), ForeignKey("settlements.id"), nullable=False)
    settlement_b_id = Column(String(36), ForeignKey("settlements.id"), nullable=False)

    # Status
    status = Column(SQLEnum(DiplomaticStatus), default=DiplomaticStatus.UNKNOWN)

    # Trust
    trust = Column(Float, default=0.5)  # 0.0 to 1.0

    # Actions (JSON list)
    diplomatic_actions = Column(JSON, default=[])

    # Territorial claims (JSON)
    territorial_claims = Column(JSON, default=[])

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    settlement_a = relationship("Settlement", foreign_keys=[settlement_a_id], back_populates="diplomatic_relations_as_a")


class Conversation(Base):
    """Conversation between agents."""
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    # Participants
    agent_ids = Column(ARRAY(String), nullable=False)  # List of agent IDs

    # Conversation details
    topic = Column(String(100), nullable=False)
    messages = Column(JSON, default=[])  # List of {agent_id, message, timestamp}

    # Outcome (JSON)
    outcome = Column(JSON, default={})

    # Timestamps
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)


class TradeOffer(Base):
    """Trade offer between agents."""
    __tablename__ = "trade_offers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    # Participants
    offerer_id = Column(String(36), ForeignKey("agents.id"), nullable=False)
    recipient_id = Column(String(36), ForeignKey("agents.id"), nullable=False)

    # Offer details
    offering = Column(JSON, nullable=False)  # {item: quantity}
    requesting = Column(JSON, nullable=False)  # {item: quantity}

    # Status
    status = Column(String(20), default="pending")  # pending, accepted, rejected, completed

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)


class War(Base):
    """War between settlements."""
    __tablename__ = "wars"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    # Participants
    aggressor_id = Column(String(36), ForeignKey("settlements.id"), nullable=False)
    defender_id = Column(String(36), ForeignKey("settlements.id"), nullable=False)

    # War details
    war_goal = Column(String(50), nullable=False)  # conquest, resources, etc.
    casus_belli = Column(Text, nullable=False)
    status = Column(String(20), default="active")  # declared, active, stalemate, ceasefire, concluded

    # War score (-100 to +100)
    war_score = Column(Float, default=0.0)

    # Statistics
    battles_fought = Column(Integer, default=0)
    aggressor_casualties = Column(Integer, default=0)
    defender_casualties = Column(Integer, default=0)

    # War weariness
    aggressor_weariness = Column(Float, default=0.0)
    defender_weariness = Column(Float, default=0.0)

    # Allies (JSON lists)
    aggressor_allies = Column(JSON, default=[])
    defender_allies = Column(JSON, default=[])

    # Timestamps
    declared_at = Column(DateTime, default=datetime.utcnow)
    concluded_at = Column(DateTime, nullable=True)

    # Peace treaty (JSON)
    peace_terms = Column(JSON, nullable=True)

    # Relationships
    aggressor = relationship("Settlement", foreign_keys=[aggressor_id], back_populates="wars_as_aggressor")
    defender = relationship("Settlement", foreign_keys=[defender_id], back_populates="wars_as_defender")


class CombatEvent(Base):
    """Combat event (duel, battle, etc.)."""
    __tablename__ = "combat_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    # Type
    conflict_type = Column(String(20), nullable=False)  # duel, skirmish, raid, battle

    # Participants (JSON lists of agent IDs)
    attackers = Column(JSON, nullable=False)
    defenders = Column(JSON, nullable=False)

    # Results
    victor_side = Column(String(20), nullable=True)  # attacker, defender, draw
    casualties = Column(JSON, default=[])  # List of agent IDs

    # War association
    war_id = Column(String(36), ForeignKey("wars.id"), nullable=True)

    # Location
    location_x = Column(Float, nullable=False)
    location_y = Column(Float, nullable=False)

    # Timestamp
    occurred_at = Column(DateTime, default=datetime.utcnow)


class SimulationState(Base):
    """Overall simulation state for checkpoints."""
    __tablename__ = "simulation_states"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    # Checkpoint name
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)

    # Simulation time
    simulation_time = Column(DateTime, nullable=False)
    tick_count = Column(Integer, nullable=False)

    # World state (JSON)
    world_state = Column(JSON, nullable=False)

    # Statistics (JSON)
    statistics = Column(JSON, default={})

    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow)


# Helper function to create all tables
def create_tables(engine):
    """Create all tables in the database."""
    Base.metadata.create_all(engine)


# Helper function to drop all tables
def drop_tables(engine):
    """Drop all tables from the database."""
    Base.metadata.drop_all(engine)
