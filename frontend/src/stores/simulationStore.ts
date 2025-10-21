import { create } from 'zustand';
import { Agent, SimulationState, WorldTile, Resource, SimulationEvent } from '@/types/simulation.types';

interface SimulationStore {
  // Connection state
  isConnected: boolean;
  setConnected: (connected: boolean) => void;

  // Simulation state
  simulationState: SimulationState | null;
  updateSimulationState: (state: SimulationState) => void;

  // Agents
  agents: Record<string, Agent>;
  addAgent: (agent: Agent) => void;
  updateAgent: (agent: Agent) => void;
  setAgents: (agents: Agent[]) => void;

  // World (Phase 1: we'll load a subset of tiles on demand)
  tiles: WorldTile[];
  setTiles: (tiles: WorldTile[]) => void;

  // Resources
  resources: Resource[];
  setResources: (resources: Resource[]) => void;

  // Events
  recentEvents: SimulationEvent[];
  addEvent: (event: SimulationEvent) => void;

  // Selected agent
  selectedAgentId: string | null;
  selectAgent: (agentId: string | null) => void;

  // Clear all
  clear: () => void;
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  // Connection state
  isConnected: false,
  setConnected: (connected) => set({ isConnected: connected }),

  // Simulation state
  simulationState: null,
  updateSimulationState: (state) => set({ simulationState: state }),

  // Agents
  agents: {},
  addAgent: (agent) =>
    set((state) => ({
      agents: { ...state.agents, [agent.id]: agent },
    })),
  updateAgent: (agent) =>
    set((state) => ({
      agents: { ...state.agents, [agent.id]: agent },
    })),
  setAgents: (agents) =>
    set({
      agents: agents.reduce((acc, agent) => {
        acc[agent.id] = agent;
        return acc;
      }, {} as Record<string, Agent>),
    }),

  // World
  tiles: [],
  setTiles: (tiles) => set({ tiles }),

  // Resources
  resources: [],
  setResources: (resources) => set({ resources }),

  // Events
  recentEvents: [],
  addEvent: (event) =>
    set((state) => ({
      recentEvents: [event, ...state.recentEvents].slice(0, 50), // Keep last 50 events
    })),

  // Selected agent
  selectedAgentId: null,
  selectAgent: (agentId) => set({ selectedAgentId: agentId }),

  // Clear all
  clear: () =>
    set({
      simulationState: null,
      agents: {},
      tiles: [],
      resources: [],
      recentEvents: [],
      selectedAgentId: null,
    }),
}));
