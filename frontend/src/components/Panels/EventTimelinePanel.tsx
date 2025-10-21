/**
 * Event Timeline Panel
 *
 * Displays a chronological timeline of significant simulation events:
 * - Technology discoveries
 * - Settlement formations
 * - Wars and battles
 * - Agent births/deaths
 * - Cultural developments
 * - Leadership changes
 *
 * Features:
 * - Real-time updates as events occur
 * - Filter by event type
 * - Click to see event details
 * - Search events
 * - Auto-scroll to latest
 *
 * Event Types:
 * - discovery (technology)
 * - settlement (formation, growth)
 * - conflict (battles, wars)
 * - social (relationships, conversations)
 * - culture (traits, traditions)
 * - governance (leadership changes)
 *
 * Usage:
 * <EventTimelinePanel maxEvents={100} />
 */

import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface SimulationEvent {
  id: string;
  type: string;
  timestamp: string;
  description: string;
  participants?: string[];
  metadata?: Record<string, any>;
}

interface EventTimelinePanelProps {
  maxEvents?: number;
}

export const EventTimelinePanel: React.FC<EventTimelinePanelProps> = ({
  maxEvents = 100,
}) => {
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState(true);
  const timelineRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to WebSocket to receive real-time events
    const socket = io('http://localhost:8000');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Event timeline connected to WebSocket');
    });

    socket.on('event', (event: any) => {
      // Create event object
      const simEvent: SimulationEvent = {
        id: `${Date.now()}_${Math.random()}`,
        type: event.type,
        timestamp: event.timestamp || new Date().toISOString(),
        description: formatEventDescription(event),
        participants: event.participants,
        metadata: event,
      };

      setEvents((prev) => {
        const updated = [simEvent, ...prev];
        // Keep only maxEvents
        return updated.slice(0, maxEvents);
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [maxEvents]);

  // Auto-scroll to top when new events arrive
  useEffect(() => {
    if (autoScroll && timelineRef.current) {
      timelineRef.current.scrollTop = 0;
    }
  }, [events, autoScroll]);

  const formatEventDescription = (event: any): string => {
    switch (event.type) {
      case 'technology_discovered':
        return `${event.agent_name} discovered ${event.technology}`;

      case 'conversation':
        return `${event.participants?.join(' and ')} had a conversation`;

      case 'settlement_formed':
        return `New settlement "${event.settlement_name}" formed with ${event.population} founders`;

      case 'agent_spawned':
        return `${event.agent?.name || 'New agent'} entered the world`;

      case 'agent_died':
        return `${event.agent_name} has died`;

      case 'battle':
        return `Battle between ${event.attacker} and ${event.defender}`;

      case 'war_declared':
        return `War declared: ${event.aggressor} vs ${event.defender}`;

      case 'trade_completed':
        return `Trade between ${event.agents?.join(' and ')}`;

      case 'leadership_emerged':
        return `${event.leader_name} became leader of ${event.settlement_name}`;

      case 'cultural_trait':
        return `${event.settlement_name} developed trait: ${event.trait_name}`;

      default:
        return event.description || `Event: ${event.type}`;
    }
  };

  const getEventIcon = (type: string): string => {
    const icons: Record<string, string> = {
      technology_discovered: '🔬',
      conversation: '💬',
      settlement_formed: '🏘️',
      agent_spawned: '👤',
      agent_died: '💀',
      battle: '⚔️',
      war_declared: '⚔️',
      trade_completed: '💰',
      leadership_emerged: '👑',
      cultural_trait: '🎭',
    };
    return icons[type] || '📌';
  };

  const getEventColor = (type: string): string => {
    const colors: Record<string, string> = {
      technology_discovered: 'bg-blue-600',
      conversation: 'bg-green-600',
      settlement_formed: 'bg-purple-600',
      agent_spawned: 'bg-gray-600',
      agent_died: 'bg-red-900',
      battle: 'bg-red-600',
      war_declared: 'bg-red-700',
      trade_completed: 'bg-yellow-600',
      leadership_emerged: 'bg-yellow-500',
      cultural_trait: 'bg-indigo-600',
    };
    return colors[type] || 'bg-gray-700';
  };

  const filteredEvents = events.filter((event) => {
    if (filter !== 'all' && event.type !== filter) return false;
    if (search && !event.description.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const eventTypes = [
    { value: 'all', label: 'All Events' },
    { value: 'technology_discovered', label: 'Technologies' },
    { value: 'settlement_formed', label: 'Settlements' },
    { value: 'battle', label: 'Battles' },
    { value: 'conversation', label: 'Social' },
    { value: 'trade_completed', label: 'Trade' },
  ];

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-gray-800 border-2 border-gray-600 rounded-lg shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-3 border-b border-gray-600">
        <h2 className="text-white font-bold text-lg mb-2">Event Timeline</h2>

        {/* Controls */}
        <div className="space-y-2">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600"
          >
            {eventTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          {/* Search */}
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600 placeholder-gray-400"
          />

          {/* Auto-scroll toggle */}
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded"
            />
            Auto-scroll to latest
          </label>
        </div>
      </div>

      {/* Timeline */}
      <div
        ref={timelineRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {filteredEvents.length === 0 && (
          <div className="text-gray-400 text-center mt-20">
            {events.length === 0
              ? 'No events yet. Simulation events will appear here.'
              : 'No events match your filter.'}
          </div>
        )}

        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="bg-gray-700 rounded p-3 hover:bg-gray-600 transition"
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div
                className={`${getEventColor(
                  event.type
                )} rounded-full w-8 h-8 flex items-center justify-center text-white flex-shrink-0`}
              >
                {getEventIcon(event.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm">{event.description}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-gray-900 px-4 py-2 border-t border-gray-600 text-xs text-gray-400">
        Showing {filteredEvents.length} of {events.length} events
      </div>
    </div>
  );
};
