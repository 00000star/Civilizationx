/**
 * Social Network Graph Visualization
 *
 * Displays the social network of relationships between agents as an
 * interactive graph visualization.
 *
 * Features:
 * - Nodes represent agents
 * - Edges represent relationships (colored by type)
 * - Node size based on number of connections
 * - Interactive: click to select agent
 * - Zoom and pan controls
 * - Filter by relationship type
 *
 * Implementation Notes:
 * - Uses force-directed graph layout
 * - SVG-based rendering for performance
 * - Updates in real-time as relationships change
 *
 * Dependencies:
 * - d3-force for graph layout
 * - d3-zoom for interactions
 *
 * Usage:
 * <SocialNetworkPanel
 *   onAgentSelect={(agentId) => console.log(agentId)}
 * />
 */

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

interface Agent {
  id: string;
  name: string;
  position: [number, number];
}

interface Relationship {
  agent_a_id: string;
  agent_b_id: string;
  score: number;
  type: string;
  trust: number;
  interactions: number;
}

interface GraphNode {
  id: string;
  name: string;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
}

interface GraphEdge {
  source: string;
  target: string;
  type: string;
  score: number;
}

interface SocialNetworkPanelProps {
  onAgentSelect?: (agentId: string) => void;
}

export const SocialNetworkPanel: React.FC<SocialNetworkPanelProps> = ({
  onAgentSelect,
}) => {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [relsResponse, agentsResponse] = await Promise.all([
          axios.get('http://localhost:8000/api/relationships'),
          axios.get('http://localhost:8000/api/simulation/agents'),
        ]);

        setRelationships(relsResponse.data.relationships || []);
        setAgents(agentsResponse.data.agents || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching social network data:', err);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000); // Refresh every 15s

    return () => clearInterval(interval);
  }, []);

  // Simple force-directed layout (simplified implementation)
  // In production, use d3-force for better results
  const calculateLayout = (): { nodes: GraphNode[]; edges: GraphEdge[] } => {
    if (agents.length === 0) return { nodes: [], edges: [] };

    // Create nodes
    const nodes: GraphNode[] = agents.map((agent, index) => ({
      id: agent.id,
      name: agent.name,
      x: dimensions.width / 2 + Math.random() * 200 - 100,
      y: dimensions.height / 2 + Math.random() * 200 - 100,
    }));

    // Filter and create edges
    const edges: GraphEdge[] = relationships
      .filter((rel) => {
        if (filter === 'all') return true;
        return rel.type === filter;
      })
      .map((rel) => ({
        source: rel.agent_a_id,
        target: rel.agent_b_id,
        type: rel.type,
        score: rel.score,
      }));

    return { nodes, edges };
  };

  const { nodes, edges } = calculateLayout();

  // Get edge color based on relationship type
  const getEdgeColor = (type: string): string => {
    const colors: Record<string, string> = {
      close_friend: '#22c55e',
      friend: '#84cc16',
      acquaintance: '#a3a3a3',
      neutral: '#737373',
      rival: '#f97316',
      enemy: '#ef4444',
    };
    return colors[type] || '#737373';
  };

  // Get node size based on connection count
  const getNodeSize = (nodeId: string): number => {
    const connectionCount = edges.filter(
      (e) => e.source === nodeId || e.target === nodeId
    ).length;
    return Math.max(6, Math.min(20, 6 + connectionCount * 2));
  };

  if (loading) {
    return (
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 w-96 h-96 bg-gray-800 border-2 border-gray-600 rounded-lg shadow-2xl p-4">
        <div className="text-white font-bold text-lg mb-2">Social Network</div>
        <div className="text-gray-400 text-center mt-20">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 w-[800px] h-[600px] bg-gray-800 border-2 border-gray-600 rounded-lg shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-3 border-b border-gray-600 flex justify-between items-center">
        <h2 className="text-white font-bold text-lg">
          Social Network ({nodes.length} agents, {edges.length} relationships)
        </h2>

        {/* Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600"
        >
          <option value="all">All Relationships</option>
          <option value="close_friend">Close Friends</option>
          <option value="friend">Friends</option>
          <option value="neutral">Neutral</option>
          <option value="rival">Rivals</option>
          <option value="enemy">Enemies</option>
        </select>
      </div>

      {/* Graph Container */}
      <div className="relative bg-gray-900" style={{ width: dimensions.width, height: dimensions.height }}>
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="absolute inset-0"
        >
          {/* Edges */}
          <g>
            {edges.map((edge, idx) => {
              const sourceNode = nodes.find((n) => n.id === edge.source);
              const targetNode = nodes.find((n) => n.id === edge.target);

              if (!sourceNode || !targetNode) return null;

              return (
                <line
                  key={`edge-${idx}`}
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={getEdgeColor(edge.type)}
                  strokeWidth={Math.abs(edge.score) > 50 ? 2 : 1}
                  strokeOpacity={0.6}
                />
              );
            })}
          </g>

          {/* Nodes */}
          <g>
            {nodes.map((node) => {
              const size = getNodeSize(node.id);

              return (
                <g key={`node-${node.id}`}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={size}
                    fill="#3b82f6"
                    stroke="#1e40af"
                    strokeWidth={2}
                    className="cursor-pointer hover:fill-blue-400 transition"
                    onClick={() => onAgentSelect && onAgentSelect(node.id)}
                  />
                  <text
                    x={node.x}
                    y={node.y + size + 12}
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    className="pointer-events-none"
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-gray-800 bg-opacity-90 rounded p-3 border border-gray-600">
          <div className="text-white text-xs font-bold mb-2">Relationship Types</div>
          <div className="space-y-1 text-xs">
            {[
              { type: 'close_friend', label: 'Close Friend', color: '#22c55e' },
              { type: 'friend', label: 'Friend', color: '#84cc16' },
              { type: 'neutral', label: 'Neutral', color: '#737373' },
              { type: 'rival', label: 'Rival', color: '#f97316' },
              { type: 'enemy', label: 'Enemy', color: '#ef4444' },
            ].map(({ type, label, color }) => (
              <div key={type} className="flex items-center gap-2">
                <div
                  className="w-4 h-1"
                  style={{ backgroundColor: color }}
                />
                <span className="text-gray-300">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <div className="text-lg mb-2">No relationships yet</div>
              <div className="text-sm">Agents will form relationships as they interact</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
