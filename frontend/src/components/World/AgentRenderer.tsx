import { useRef } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import { Agent } from '@/types/simulation.types';
import { useSimulationStore } from '@/stores/simulationStore';

interface AgentRendererProps {
  agent: Agent;
}

function AgentRenderer({ agent }: AgentRendererProps) {
  const meshRef = useRef<Mesh>(null);
  const { selectedAgentId, selectAgent } = useSimulationStore();

  const isSelected = selectedAgentId === agent.id;

  // Get color based on agent state
  const getAgentColor = () => {
    if (!agent.is_alive) return '#666666'; // Gray for dead
    if (agent.needs.hunger < 30) return '#ff6600'; // Orange for hungry
    if (agent.needs.energy < 30) return '#6666ff'; // Blue for tired
    return '#00ff00'; // Green for healthy
  };

  // Simple bob animation when moving
  useFrame((state) => {
    if (meshRef.current && agent.is_alive && agent.target_position) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 5) * 0.2;
    }
  });

  const handleClick = () => {
    selectAgent(isSelected ? null : agent.id);
  };

  return (
    <group position={[agent.position.x, agent.position.y, 0]}>
      {/* Agent body */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'default')}
      >
        <circleGeometry args={[0.5, 16]} />
        <meshStandardMaterial
          color={getAgentColor()}
          opacity={agent.is_alive ? 1.0 : 0.3}
          transparent
        />
      </mesh>

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, 0, -0.1]}>
          <ringGeometry args={[0.6, 0.7, 32]} />
          <meshBasicMaterial color="#ffff00" />
        </mesh>
      )}

      {/* Direction indicator (if moving) */}
      {agent.target_position && agent.is_alive && (
        <arrowHelper
          args={[
            {
              x: agent.target_position.x - agent.position.x,
              y: agent.target_position.y - agent.position.y,
              z: 0,
            },
            { x: 0, y: 0, z: 0 },
            1,
            0xffffff,
            0.3,
            0.2,
          ]}
        />
      )}
    </group>
  );
}

export default AgentRenderer;
