-- World Schema
-- Contains all tables related to the world, terrain, resources, and environment

-- World tiles table
CREATE TABLE IF NOT EXISTS world_tiles (
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    biome TEXT NOT NULL CHECK (biome IN ('forest', 'plains', 'mountain', 'water', 'desert')),
    elevation FLOAT NOT NULL,
    moisture FLOAT NOT NULL CHECK (moisture >= 0.0 AND moisture <= 1.0),
    traversable BOOLEAN NOT NULL DEFAULT TRUE,
    movement_speed_modifier FLOAT NOT NULL DEFAULT 1.0,
    structure_id UUID,
    PRIMARY KEY (x, y)
);

-- World resources table
CREATE TABLE IF NOT EXISTS world_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_type TEXT NOT NULL CHECK (resource_type IN ('tree', 'bush', 'rock', 'ore_deposit', 'animal', 'crop', 'water_source')),
    position POINT NOT NULL,
    biome TEXT NOT NULL,
    current_quantity INTEGER NOT NULL DEFAULT 0,
    max_quantity INTEGER NOT NULL,
    regeneration_rate FLOAT NOT NULL DEFAULT 0.0,
    last_harvested_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    is_depleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Environment state table (singleton - only one row)
CREATE TABLE IF NOT EXISTS environment_state (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    current_simulation_time TIMESTAMP NOT NULL DEFAULT NOW(),
    current_season TEXT NOT NULL DEFAULT 'spring' CHECK (current_season IN ('spring', 'summer', 'fall', 'winter')),
    current_weather TEXT NOT NULL DEFAULT 'clear' CHECK (current_weather IN ('clear', 'rain', 'storm')),
    weather_duration_remaining INTEGER NOT NULL DEFAULT 0,
    days_since_rain INTEGER NOT NULL DEFAULT 0,
    temperature FLOAT NOT NULL DEFAULT 20.0,
    tick_count BIGINT NOT NULL DEFAULT 0
);

-- Insert initial environment state
INSERT INTO environment_state (id, current_simulation_time, current_season, current_weather)
VALUES (1, NOW(), 'spring', 'clear')
ON CONFLICT (id) DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_world_tiles_biome ON world_tiles(biome);
CREATE INDEX IF NOT EXISTS idx_world_tiles_structure ON world_tiles(structure_id);

CREATE INDEX IF NOT EXISTS idx_resources_position ON world_resources USING GIST (position);
CREATE INDEX IF NOT EXISTS idx_resources_type ON world_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_biome ON world_resources(biome);
CREATE INDEX IF NOT EXISTS idx_resources_depleted ON world_resources(is_depleted);
