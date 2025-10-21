import { useEffect } from 'react';
import { websocketService } from './services/websocketService';
import { useSimulationStore } from './stores/simulationStore';
import WorldCanvas from './components/World/WorldCanvas';
import ControlPanel from './components/Panels/ControlPanel';

function App() {
  const {
    setConnected,
    updateSimulationState,
    updateAgent,
    addEvent,
  } = useSimulationStore();

  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect();

    // Setup event listeners
    websocketService.onConnect(() => {
      console.log('Connected to simulation');
      setConnected(true);
      // Request initial state
      websocketService.getState();
    });

    websocketService.onDisconnect(() => {
      console.log('Disconnected from simulation');
      setConnected(false);
    });

    websocketService.onSimulationTick((state) => {
      updateSimulationState(state);
    });

    websocketService.onAgentUpdate((agent) => {
      updateAgent(agent);
    });

    websocketService.onEvent((event) => {
      addEvent(event);
    });

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
      websocketService.removeAllListeners();
    };
  }, [setConnected, updateSimulationState, updateAgent, addEvent]);

  return (
    <div className="w-full h-full relative bg-black">
      <ControlPanel />
      <WorldCanvas />
    </div>
  );
}

export default App;
