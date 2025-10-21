import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { useSimulationStore } from '@/stores/simulationStore';
import AgentRenderer from './AgentRenderer';
import CameraController from './CameraController';

function WorldCanvas() {
  const { agents } = useSimulationStore();

  const agentList = Object.values(agents);

  return (
    <div className="w-full h-full">
      <Canvas>
        {/* Orthographic camera for 2D top-down view */}
        <OrthographicCamera
          makeDefault
          zoom={2}
          position={[0, 0, 100]}
          near={0.1}
          far={1000}
        />

        {/* Lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />

        {/* Grid floor for reference */}
        <gridHelper args={[1000, 100, 0x444444, 0x222222]} rotation={[Math.PI / 2, 0, 0]} />

        {/* Render all agents */}
        {agentList.map((agent) => (
          <AgentRenderer key={agent.id} agent={agent} />
        ))}

        {/* Camera controls */}
        <CameraController />
      </Canvas>
    </div>
  );
}

export default WorldCanvas;
