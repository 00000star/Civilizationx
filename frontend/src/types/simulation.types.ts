// Type definitions for simulation

export interface Position {
  x: number;
  y: number;
}

export interface AgentNeeds {
  hunger: number;
  energy: number;
  social: number;
}

export interface Agent {
  id: string;
  name: string;
  position: Position;
  birth_time: string;
  needs: AgentNeeds;
  current_activity: string;
  is_alive: boolean;
  inventory: Record<string, number>;
  target_position: Position | null;
}

export interface WorldTile {
  x: number;
  y: number;
  biome: 'forest' | 'plains' | 'mountain' | 'water' | 'desert';
  elevation: number;
  moisture: number;
  traversable: boolean;
  movement_speed_modifier: number;
}

export interface Resource {
  id?: string;
  resource_type: 'tree' | 'bush' | 'rock' | 'ore_deposit' | 'animal' | 'crop' | 'water_source';
  position: Position;
  biome: string;
  current_quantity: number;
  max_quantity: number;
  regeneration_rate: number;
  metadata: Record<string, any>;
  is_depleted?: boolean;
}

export interface SimulationState {
  is_running: boolean;
  simulation_speed: number;
  tick_count: number;
  simulation_time: string;
  agent_count: number;
  alive_agent_count: number;
  world_summary: WorldSummary;
  tick_duration: number;
}

export interface WorldSummary {
  dimensions: {
    width: number;
    height: number;
  };
  seed: number;
  biomes: Record<string, number>;
  resources: Record<string, number>;
  total_tiles: number;
  total_resources: number;
}

export interface SimulationEvent {
  type: string;
  timestamp: string;
  [key: string]: any;
}
