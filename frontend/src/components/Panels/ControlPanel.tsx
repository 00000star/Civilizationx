import { Play, Pause, Users } from 'lucide-react';
import { useSimulationStore } from '@/stores/simulationStore';
import { websocketService } from '@/services/websocketService';

function ControlPanel() {
  const { simulationState, isConnected, agents } = useSimulationStore();

  const handlePlayPause = () => {
    if (simulationState?.is_running) {
      websocketService.pauseSimulation();
    } else {
      websocketService.startSimulation();
    }
  };

  const handleSpawnAgents = () => {
    websocketService.spawnMultipleAgents(10);
  };

  const agentCount = Object.keys(agents).length;
  const aliveCount = simulationState?.alive_agent_count || 0;

  return (
    <div className="absolute top-0 left-0 right-0 bg-gray-900 bg-opacity-95 p-4 flex items-center gap-4 z-10">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-white text-sm">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Play/Pause */}
      <button
        onClick={handlePlayPause}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!isConnected}
      >
        {simulationState?.is_running ? (
          <>
            <Pause size={20} />
            Pause
          </>
        ) : (
          <>
            <Play size={20} />
            Play
          </>
        )}
      </button>

      {/* Speed Control */}
      <div className="flex items-center gap-2">
        <span className="text-white text-sm">Speed:</span>
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={simulationState?.simulation_speed || 1.0}
          onChange={(e) => websocketService.setSpeed(parseFloat(e.target.value))}
          className="w-32"
          disabled={!isConnected}
        />
        <span className="text-white text-sm w-12">
          {simulationState?.simulation_speed.toFixed(1)}x
        </span>
      </div>

      {/* Tick Count */}
      <div className="text-white text-sm">
        Tick: {simulationState?.tick_count || 0}
      </div>

      {/* Agent Count */}
      <div className="flex items-center gap-2 text-white">
        <Users size={20} />
        <span className="text-sm">
          {aliveCount} / {agentCount} agents
        </span>
      </div>

      {/* Spawn Agents */}
      <button
        onClick={handleSpawnAgents}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!isConnected}
      >
        Spawn 10 Agents
      </button>

      {/* World Info */}
      {simulationState?.world_summary && (
        <div className="text-white text-sm ml-auto">
          World: {simulationState.world_summary.dimensions.width}x
          {simulationState.world_summary.dimensions.height} |
          Resources: {simulationState.world_summary.total_resources}
        </div>
      )}
    </div>
  );
}

export default ControlPanel;
