-- Agent Schema
-- Contains all tables related to agents, their state, memories, and knowledge

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    birth_time TIMESTAMP NOT NULL DEFAULT NOW(),
    current_location POINT NOT NULL,
    current_state JSONB NOT NULL DEFAULT '{}',
    known_technologies TEXT[] DEFAULT ARRAY[]::TEXT[],
    skills JSONB DEFAULT '{}',
    personality_traits JSONB DEFAULT '{}',
    current_plan JSONB DEFAULT '{}',
    relationships JSONB DEFAULT '{}',
    role TEXT,
    settlement_id UUID,
    civilization_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Agent memories table
CREATE TABLE IF NOT EXISTS agent_memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    memory_type TEXT NOT NULL CHECK (memory_type IN ('episodic', 'semantic', 'procedural', 'collective')),
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    importance_score FLOAT NOT NULL CHECK (importance_score >= 1.0 AND importance_score <= 10.0),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_accessed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    access_count INTEGER NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    parent_memory_id UUID REFERENCES agent_memories(id) ON DELETE SET NULL
);

-- Agent technology knowledge table
CREATE TABLE IF NOT EXISTS agent_technology_knowledge (
    agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    technology_id UUID NOT NULL,
    learned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    learned_from UUID REFERENCES agents(id) ON DELETE SET NULL,
    proficiency_level FLOAT NOT NULL DEFAULT 0.0 CHECK (proficiency_level >= 0.0 AND proficiency_level <= 1.0),
    teaching_count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (agent_id, technology_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_location ON agents USING GIST (current_location);
CREATE INDEX IF NOT EXISTS idx_agents_settlement ON agents(settlement_id);
CREATE INDEX IF NOT EXISTS idx_agents_civilization ON agents(civilization_id);

CREATE INDEX IF NOT EXISTS idx_memories_agent ON agent_memories(agent_id);
CREATE INDEX IF NOT EXISTS idx_memories_type ON agent_memories(memory_type);
CREATE INDEX IF NOT EXISTS idx_memories_created ON agent_memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_importance ON agent_memories(importance_score DESC);
CREATE INDEX IF NOT EXISTS idx_memories_embedding ON agent_memories USING ivfflat (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_agent_tech_agent ON agent_technology_knowledge(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tech_technology ON agent_technology_knowledge(technology_id);
