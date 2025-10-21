-- Technology Schema
-- Contains all tables related to technologies, discoveries, and knowledge

-- Technologies table
CREATE TABLE IF NOT EXISTS technologies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tech_name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    tech_era TEXT NOT NULL CHECK (tech_era IN ('primitive', 'ancient', 'classical', 'industrial', 'modern')),
    description TEXT NOT NULL,
    discovery_hint TEXT,
    prerequisites TEXT[] DEFAULT ARRAY[]::TEXT[],
    discovery_conditions JSONB DEFAULT '{}',
    base_discovery_probability FLOAT NOT NULL DEFAULT 0.01 CHECK (base_discovery_probability >= 0.0 AND base_discovery_probability <= 1.0),
    enables_actions TEXT[] DEFAULT ARRAY[]::TEXT[],
    enables_recipes JSONB DEFAULT '{}',
    knowledge_complexity INTEGER NOT NULL DEFAULT 5 CHECK (knowledge_complexity >= 1 AND knowledge_complexity <= 10),
    category TEXT NOT NULL
);

-- Discovered technologies table
CREATE TABLE IF NOT EXISTS discovered_technologies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    technology_id UUID NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
    civilization_id UUID,
    discovered_by_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    discovered_at TIMESTAMP NOT NULL DEFAULT NOW(),
    discovery_narrative TEXT,
    spread_count INTEGER NOT NULL DEFAULT 1
);

-- Collective knowledge table
CREATE TABLE IF NOT EXISTS collective_knowledge (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    civilization_id UUID NOT NULL,
    knowledge_type TEXT NOT NULL,
    content TEXT NOT NULL,
    discovered_by_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    discovered_at TIMESTAMP NOT NULL DEFAULT NOW(),
    spread_count INTEGER NOT NULL DEFAULT 1
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_technologies_era ON technologies(tech_era);
CREATE INDEX IF NOT EXISTS idx_technologies_category ON technologies(category);
CREATE INDEX IF NOT EXISTS idx_technologies_name ON technologies(tech_name);

CREATE INDEX IF NOT EXISTS idx_discovered_tech_civ ON discovered_technologies(civilization_id);
CREATE INDEX IF NOT EXISTS idx_discovered_tech_agent ON discovered_technologies(discovered_by_agent_id);
CREATE INDEX IF NOT EXISTS idx_discovered_tech_time ON discovered_technologies(discovered_at DESC);

CREATE INDEX IF NOT EXISTS idx_collective_knowledge_civ ON collective_knowledge(civilization_id);
