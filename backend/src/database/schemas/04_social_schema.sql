-- Social Schema
-- Contains all tables related to social systems, relationships, conversations, settlements, and civilizations

-- Agent relationships table
CREATE TABLE IF NOT EXISTS agent_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_a_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    agent_b_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    relationship_score FLOAT NOT NULL DEFAULT 0.0 CHECK (relationship_score >= -100.0 AND relationship_score <= 100.0),
    trust_level FLOAT NOT NULL DEFAULT 0.3 CHECK (trust_level >= 0.0 AND trust_level <= 1.0),
    familiarity INTEGER NOT NULL DEFAULT 0 CHECK (familiarity >= 0 AND familiarity <= 100),
    relationship_type TEXT,
    first_met_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_interaction_at TIMESTAMP NOT NULL DEFAULT NOW(),
    interaction_count INTEGER NOT NULL DEFAULT 0,
    shared_experiences JSONB DEFAULT '[]',
    conflicts JSONB DEFAULT '[]',
    favors_owed JSONB DEFAULT '{"by_a": [], "by_b": []}',
    UNIQUE (agent_a_id, agent_b_id),
    CHECK (agent_a_id < agent_b_id)
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participants UUID[] NOT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMP,
    location POINT NOT NULL,
    topic TEXT,
    turns JSONB DEFAULT '[]',
    outcome JSONB DEFAULT '{}',
    importance FLOAT NOT NULL DEFAULT 5.0 CHECK (importance >= 1.0 AND importance <= 10.0)
);

-- Agent reputation table
CREATE TABLE IF NOT EXISTS agent_reputation (
    agent_id UUID PRIMARY KEY REFERENCES agents(id) ON DELETE CASCADE,
    civilization_id UUID NOT NULL,
    reputation_scores JSONB DEFAULT '{}',
    known_by_count INTEGER NOT NULL DEFAULT 0,
    notable_deeds JSONB DEFAULT '[]',
    last_updated TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Settlements table
CREATE TABLE IF NOT EXISTS settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    civilization_id UUID NOT NULL,
    location POINT NOT NULL,
    founded_at TIMESTAMP NOT NULL DEFAULT NOW(),
    population INTEGER NOT NULL DEFAULT 0,
    shared_resources JSONB DEFAULT '{}',
    infrastructure JSONB DEFAULT '{"buildings": [], "roads": [], "defenses": []}',
    specialization TEXT,
    cultural_norms JSONB DEFAULT '[]',
    leader_id UUID REFERENCES agents(id) ON DELETE SET NULL
);

-- Civilizations table
CREATE TABLE IF NOT EXISTS civilizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    founded_at TIMESTAMP NOT NULL DEFAULT NOW(),
    primary_settlement_id UUID REFERENCES settlements(id) ON DELETE SET NULL,
    population INTEGER NOT NULL DEFAULT 0,
    territory_bounds POLYGON,
    known_technologies TEXT[] DEFAULT ARRAY[]::TEXT[],
    cultural_identity JSONB DEFAULT '{}',
    government_type TEXT DEFAULT 'egalitarian' CHECK (government_type IN ('egalitarian', 'chiefdom', 'monarchy', 'republic'))
);

-- Civilization relations table
CREATE TABLE IF NOT EXISTS civilization_relations (
    civilization_a_id UUID NOT NULL REFERENCES civilizations(id) ON DELETE CASCADE,
    civilization_b_id UUID NOT NULL REFERENCES civilizations(id) ON DELETE CASCADE,
    relationship_status TEXT NOT NULL DEFAULT 'unknown' CHECK (relationship_status IN ('unknown', 'peaceful', 'trading', 'allied', 'tense', 'hostile', 'war')),
    relationship_score FLOAT NOT NULL DEFAULT 0.0 CHECK (relationship_score >= -100.0 AND relationship_score <= 100.0),
    first_contact_at TIMESTAMP NOT NULL DEFAULT NOW(),
    trade_volume INTEGER NOT NULL DEFAULT 0,
    conflicts JSONB DEFAULT '[]',
    treaties JSONB DEFAULT '[]',
    PRIMARY KEY (civilization_a_id, civilization_b_id),
    CHECK (civilization_a_id < civilization_b_id)
);

-- Add foreign key for settlements -> civilizations
ALTER TABLE settlements ADD CONSTRAINT fk_settlement_civilization
    FOREIGN KEY (civilization_id) REFERENCES civilizations(id) ON DELETE CASCADE;

-- Add foreign key for agents -> settlements
ALTER TABLE agents ADD CONSTRAINT fk_agent_settlement
    FOREIGN KEY (settlement_id) REFERENCES settlements(id) ON DELETE SET NULL;

-- Add foreign key for agents -> civilizations
ALTER TABLE agents ADD CONSTRAINT fk_agent_civilization
    FOREIGN KEY (civilization_id) REFERENCES civilizations(id) ON DELETE SET NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_relationships_agent_a ON agent_relationships(agent_a_id);
CREATE INDEX IF NOT EXISTS idx_relationships_agent_b ON agent_relationships(agent_b_id);
CREATE INDEX IF NOT EXISTS idx_relationships_score ON agent_relationships(relationship_score);

CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN (participants);
CREATE INDEX IF NOT EXISTS idx_conversations_started ON conversations(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_ended ON conversations(ended_at DESC);

CREATE INDEX IF NOT EXISTS idx_reputation_civ ON agent_reputation(civilization_id);

CREATE INDEX IF NOT EXISTS idx_settlements_civ ON settlements(civilization_id);
CREATE INDEX IF NOT EXISTS idx_settlements_location ON settlements USING GIST (location);

CREATE INDEX IF NOT EXISTS idx_civilizations_founded ON civilizations(founded_at);

CREATE INDEX IF NOT EXISTS idx_civ_relations_a ON civilization_relations(civilization_a_id);
CREATE INDEX IF NOT EXISTS idx_civ_relations_b ON civilization_relations(civilization_b_id);
CREATE INDEX IF NOT EXISTS idx_civ_relations_status ON civilization_relations(relationship_status);
