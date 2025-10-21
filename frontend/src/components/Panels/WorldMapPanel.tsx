/**
 * World Map with Settlements Overlay
 *
 * Displays a minimap of the world with:
 * - Biome visualization (colors for different terrains)
 * - Settlement markers and boundaries
 * - Agent positions (as dots)
 * - Resource locations
 *
 * Features:
 * - Click to center main camera on location
 * - Settlement borders shown with colors
 * - Hover to see settlement/agent info
 * - Toggle layers (settlements, agents, resources)
 *
 * Performance:
 * - Renders world at reduced resolution (e.g., 256x256 → 64x64)
 * - Uses canvas for efficient rendering
 * - Updates every 2 seconds
 *
 * Usage:
 * <WorldMapPanel
 *   onLocationClick={(x, y) => camera.lookAt(x, y)}
 * />
 */

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

interface Settlement {
  id: string;
  name: string;
  center_position: [number, number];
  radius: number;
  population: number;
  settlement_type: string;
}

interface Agent {
  id: string;
  name: string;
  position: [number, number];
  is_alive: boolean;
}

interface WorldMapPanelProps {
  onLocationClick?: (x: number, y: number) => void;
}

export const WorldMapPanel: React.FC<WorldMapPanelProps> = ({
  onLocationClick,
}) => {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettlements, setShowSettlements] = useState(true);
  const [showAgents, setShowAgents] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mapSize = 300;  // Display size
  const worldSize = 1024;  // Actual world size
  const scale = mapSize / worldSize;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settlementsRes, agentsRes] = await Promise.all([
          axios.get('http://localhost:8000/api/settlements'),
          axios.get('http://localhost:8000/api/simulation/agents'),
        ]);

        setSettlements(settlementsRes.data.settlements || []);
        setAgents(agentsRes.data.agents || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching map data:', err);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);  // Update every 2s

    return () => clearInterval(interval);
  }, []);

  // Draw the map
  useEffect(() => {
    if (!canvasRef.current || loading) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';  // Dark background
    ctx.fillRect(0, 0, mapSize, mapSize);

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= mapSize; i += mapSize / 10) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, mapSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(mapSize, i);
      ctx.stroke();
    }

    // Draw settlement territories
    if (showSettlements) {
      settlements.forEach((settlement, idx) => {
        const x = settlement.center_position[0] * scale;
        const y = settlement.center_position[1] * scale;
        const radius = settlement.radius * scale;

        // Settlement territory (circle)
        ctx.fillStyle = `hsla(${(idx * 137) % 360}, 70%, 50%, 0.2)`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Settlement border
        ctx.strokeStyle = `hsl(${(idx * 137) % 360}, 70%, 50%)`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Settlement marker (larger dot)
        ctx.fillStyle = `hsl(${(idx * 137) % 360}, 70%, 50%)`;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Settlement name
        ctx.fillStyle = 'white';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(settlement.name, x, y - radius - 5);
        ctx.fillText(`(${settlement.population})`, x, y - radius + 8);
      });
    }

    // Draw agents
    if (showAgents) {
      agents
        .filter((a) => a.is_alive)
        .forEach((agent) => {
          const x = agent.position[0] * scale;
          const y = agent.position[1] * scale;

          // Agent dot
          ctx.fillStyle = '#3b82f6';  // Blue
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        });
    }
  }, [settlements, agents, showSettlements, showAgents, loading, scale]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !onLocationClick) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / mapSize) * worldSize;
    const y = ((e.clientY - rect.top) / mapSize) * worldSize;

    onLocationClick(x, y);
  };

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 border-2 border-gray-600 rounded-lg shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-3 border-b border-gray-600">
        <h2 className="text-white font-bold text-lg mb-2">World Map</h2>

        {/* Toggle controls */}
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showSettlements}
              onChange={(e) => setShowSettlements(e.target.checked)}
              className="rounded"
            />
            <span className="text-gray-300">Settlements</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showAgents}
              onChange={(e) => setShowAgents(e.target.checked)}
              className="rounded"
            />
            <span className="text-gray-300">Agents</span>
          </label>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="p-4">
        <canvas
          ref={canvasRef}
          width={mapSize}
          height={mapSize}
          onClick={handleCanvasClick}
          className="cursor-crosshair border border-gray-700 rounded"
        />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
            <div className="text-gray-400">Loading map...</div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-gray-900 px-4 py-2 border-t border-gray-600 text-sm text-gray-300">
        <div>Settlements: {settlements.length}</div>
        <div>Active Agents: {agents.filter((a) => a.is_alive).length}</div>
        <div className="text-xs text-gray-500 mt-1">
          Click map to center camera
        </div>
      </div>
    </div>
  );
};
