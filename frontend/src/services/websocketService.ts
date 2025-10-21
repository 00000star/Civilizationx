import { io, Socket } from 'socket.io-client';
import { Agent, SimulationState, SimulationEvent } from '@/types/simulation.types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // Callbacks
  private onConnectCallbacks: (() => void)[] = [];
  private onDisconnectCallbacks: (() => void)[] = [];
  private onSimulationTickCallbacks: ((state: SimulationState) => void)[] = [];
  private onAgentUpdateCallbacks: ((agent: Agent) => void)[] = [];
  private onEventCallbacks: ((event: SimulationEvent) => void)[] = [];

  connect(): void {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    console.log(`Connecting to WebSocket: ${WS_URL}`);

    this.socket = io(WS_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.onConnectCallbacks.forEach(cb => cb());
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.onDisconnectCallbacks.forEach(cb => cb());
    });

    this.socket.on('connection_established', (data) => {
      console.log('Connection established:', data);
    });

    this.socket.on('simulation_tick', (data: SimulationState) => {
      this.onSimulationTickCallbacks.forEach(cb => cb(data));
    });

    this.socket.on('agent_update', (data: Agent) => {
      this.onAgentUpdateCallbacks.forEach(cb => cb(data));
    });

    this.socket.on('event', (data: SimulationEvent) => {
      this.onEventCallbacks.forEach(cb => cb(data));
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Simulation control methods
  startSimulation(): void {
    this.socket?.emit('start_simulation');
  }

  pauseSimulation(): void {
    this.socket?.emit('pause_simulation');
  }

  setSpeed(speed: number): void {
    this.socket?.emit('set_speed', { speed });
  }

  spawnAgent(position?: { x: number; y: number }): void {
    this.socket?.emit('spawn_agent', { position });
  }

  spawnMultipleAgents(count: number): void {
    this.socket?.emit('spawn_multiple_agents', { count });
  }

  getState(): void {
    this.socket?.emit('get_state');
  }

  // Event listeners
  onConnect(callback: () => void): void {
    this.onConnectCallbacks.push(callback);
  }

  onDisconnect(callback: () => void): void {
    this.onDisconnectCallbacks.push(callback);
  }

  onSimulationTick(callback: (state: SimulationState) => void): void {
    this.onSimulationTickCallbacks.push(callback);
  }

  onAgentUpdate(callback: (agent: Agent) => void): void {
    this.onAgentUpdateCallbacks.push(callback);
  }

  onEvent(callback: (event: SimulationEvent) => void): void {
    this.onEventCallbacks.push(callback);
  }

  // Cleanup
  removeAllListeners(): void {
    this.onConnectCallbacks = [];
    this.onDisconnectCallbacks = [];
    this.onSimulationTickCallbacks = [];
    this.onAgentUpdateCallbacks = [];
    this.onEventCallbacks = [];
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Singleton instance
export const websocketService = new WebSocketService();
