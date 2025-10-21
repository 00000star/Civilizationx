import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface AgentDetails {
  agent: {
    id: string;
    name: string;
    position: [number, number];
    needs: {
      hunger: number;
      energy: number;
      social: number;
    };
    current_activity: string;
    is_alive: boolean;
    inventory: Record<string, number>;
  };
  memories: Array<{
    content: string;
    type: string;
    importance: number;
    created_at: string;
  }>;
  technologies: string[];
  relationships: Array<{
    other_agent_id: string;
    score: number;
    type: string;
    trust: number;
  }>;
  specialization: {
    primary_role: string | null;
    skill_levels: Record<string, number>;
  };
  settlement: {
    id: string;
    name: string;
    population: number;
  } | null;
}

interface AgentInspectorPanelProps {
  selectedAgentId: string | null;
  onClose: () => void;
}

export const AgentInspectorPanel: React.FC<AgentInspectorPanelProps> = ({
  selectedAgentId,
  onClose,
}) => {
  const [agentDetails, setAgentDetails] = useState<AgentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedAgentId) {
      setAgentDetails(null);
      return;
    }

    const fetchAgentDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `http://localhost:8000/api/agents/${selectedAgentId}`
        );
        setAgentDetails(response.data);
      } catch (err) {
        setError('Failed to load agent details');
        console.error('Error fetching agent details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentDetails();
    // Refresh every 5 seconds while panel is open
    const interval = setInterval(fetchAgentDetails, 5000);

    return () => clearInterval(interval);
  }, [selectedAgentId]);

  if (!selectedAgentId) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 w-96 bg-gray-800 border-2 border-gray-600 rounded-lg shadow-2xl overflow-hidden z-50">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-3 flex justify-between items-center border-b border-gray-600">
        <h2 className="text-white font-bold text-lg">Agent Inspector</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="max-h-[80vh] overflow-y-auto p-4">
        {loading && !agentDetails && (
          <div className="text-gray-400 text-center py-8">Loading...</div>
        )}

        {error && (
          <div className="text-red-400 text-center py-4">{error}</div>
        )}

        {agentDetails && (
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="bg-gray-700 rounded p-3">
              <h3 className="text-white font-semibold mb-2">
                {agentDetails.agent.name}
              </h3>
              <div className="text-sm text-gray-300 space-y-1">
                <div>ID: {agentDetails.agent.id.slice(0, 8)}...</div>
                <div>
                  Position: ({agentDetails.agent.position[0].toFixed(1)},{' '}
                  {agentDetails.agent.position[1].toFixed(1)})
                </div>
                <div>Activity: {agentDetails.agent.current_activity}</div>
                <div>
                  Status:{' '}
                  <span
                    className={
                      agentDetails.agent.is_alive
                        ? 'text-green-400'
                        : 'text-red-400'
                    }
                  >
                    {agentDetails.agent.is_alive ? 'Alive' : 'Dead'}
                  </span>
                </div>
              </div>
            </div>

            {/* Needs */}
            <div className="bg-gray-700 rounded p-3">
              <h3 className="text-white font-semibold mb-2">Needs</h3>
              <div className="space-y-2">
                {Object.entries(agentDetails.agent.needs).map(([need, value]) => (
                  <div key={need}>
                    <div className="flex justify-between text-sm text-gray-300 mb-1">
                      <span className="capitalize">{need}</span>
                      <span>{value.toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          value > 70
                            ? 'bg-green-500'
                            : value > 40
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inventory */}
            {Object.keys(agentDetails.agent.inventory).length > 0 && (
              <div className="bg-gray-700 rounded p-3">
                <h3 className="text-white font-semibold mb-2">Inventory</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                  {Object.entries(agentDetails.agent.inventory).map(
                    ([item, count]) => (
                      <div key={item} className="flex justify-between">
                        <span className="capitalize">{item}</span>
                        <span className="text-white font-semibold">{count}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Technologies */}
            {agentDetails.technologies.length > 0 && (
              <div className="bg-gray-700 rounded p-3">
                <h3 className="text-white font-semibold mb-2">
                  Technologies ({agentDetails.technologies.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {agentDetails.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="bg-blue-600 text-white text-xs px-2 py-1 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Specialization */}
            {agentDetails.specialization.primary_role && (
              <div className="bg-gray-700 rounded p-3">
                <h3 className="text-white font-semibold mb-2">Specialization</h3>
                <div className="text-sm text-gray-300 space-y-2">
                  <div>
                    <span className="text-yellow-400 font-semibold">
                      {agentDetails.specialization.primary_role}
                    </span>
                  </div>
                  {Object.entries(agentDetails.specialization.skill_levels).map(
                    ([skill, level]) => (
                      <div key={skill} className="flex justify-between">
                        <span className="capitalize">{skill}</span>
                        <span>{level.toFixed(1)}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Settlement */}
            {agentDetails.settlement && (
              <div className="bg-gray-700 rounded p-3">
                <h3 className="text-white font-semibold mb-2">Settlement</h3>
                <div className="text-sm text-gray-300">
                  <div className="text-purple-400 font-semibold">
                    {agentDetails.settlement.name}
                  </div>
                  <div>Population: {agentDetails.settlement.population}</div>
                </div>
              </div>
            )}

            {/* Relationships */}
            {agentDetails.relationships.length > 0 && (
              <div className="bg-gray-700 rounded p-3">
                <h3 className="text-white font-semibold mb-2">
                  Relationships ({agentDetails.relationships.length})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {agentDetails.relationships.map((rel, idx) => (
                    <div
                      key={idx}
                      className="text-sm bg-gray-600 rounded p-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">
                          {rel.other_agent_id.slice(0, 8)}...
                        </span>
                        <span
                          className={`font-semibold ${
                            rel.score > 40
                              ? 'text-green-400'
                              : rel.score < -20
                              ? 'text-red-400'
                              : 'text-gray-300'
                          }`}
                        >
                          {rel.type}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Score: {rel.score.toFixed(1)} | Trust:{' '}
                        {(rel.trust * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Memories */}
            {agentDetails.memories.length > 0 && (
              <div className="bg-gray-700 rounded p-3">
                <h3 className="text-white font-semibold mb-2">
                  Recent Memories ({agentDetails.memories.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {agentDetails.memories.map((memory, idx) => (
                    <div
                      key={idx}
                      className="text-sm bg-gray-600 rounded p-2"
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={`text-xs px-1 rounded ${
                            memory.type === 'episodic'
                              ? 'bg-blue-500'
                              : memory.type === 'semantic'
                              ? 'bg-purple-500'
                              : 'bg-green-500'
                          }`}
                        >
                          {memory.type}
                        </span>
                        <span
                          className={`text-xs ${
                            memory.importance > 7
                              ? 'text-yellow-400'
                              : 'text-gray-400'
                          }`}
                        >
                          ★{memory.importance.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-gray-300 mt-1">{memory.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(memory.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
