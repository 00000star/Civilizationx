import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Settlement {
  id: string;
  name: string;
  center_position: [number, number];
  population: number;
  settlement_type: string;
  founded_at: string;
  culture: {
    traits: Array<{
      name: string;
      type: string;
      strength: number;
      adherents: number;
    }>;
    traditions: Array<{
      name: string;
      description: string;
      times_practiced: number;
    }>;
    core_values: string[];
  } | null;
  leadership: {
    governance_type: string;
    has_leadership: boolean;
    leader?: {
      agent_name: string;
      role: string;
      approval_rating: number;
      qualities: string[];
    };
    council?: Array<{
      agent_name: string;
      approval_rating: number;
      qualities: string[];
    }>;
  };
}

export const SettlementsPanel: React.FC = () => {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [selectedSettlement, setSelectedSettlement] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettlements = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/settlements');
        setSettlements(response.data.settlements);
        setError(null);
      } catch (err) {
        setError('Failed to load settlements');
        console.error('Error fetching settlements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettlements();
    const interval = setInterval(fetchSettlements, 10000);

    return () => clearInterval(interval);
  }, []);

  const selectedSettlementData = settlements.find(
    (s) => s.id === selectedSettlement
  );

  return (
    <div className="fixed left-4 bottom-4 w-96 max-h-[70vh] bg-gray-800 border-2 border-gray-600 rounded-lg shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-3 border-b border-gray-600">
        <h2 className="text-white font-bold text-lg">
          Settlements ({settlements.length})
        </h2>
      </div>

      {/* Content */}
      <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
        {loading && (
          <div className="text-gray-400 text-center py-8">Loading...</div>
        )}

        {error && <div className="text-red-400 text-center py-4">{error}</div>}

        {!loading && settlements.length === 0 && (
          <div className="text-gray-400 text-center py-8">
            No settlements yet. Agents will form settlements over time.
          </div>
        )}

        {!selectedSettlement && settlements.length > 0 && (
          <div className="p-4 space-y-3">
            {settlements.map((settlement) => (
              <div
                key={settlement.id}
                onClick={() => setSelectedSettlement(settlement.id)}
                className="bg-gray-700 rounded p-3 cursor-pointer hover:bg-gray-600 transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-semibold text-lg">
                    {settlement.name}
                  </h3>
                  <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                    {settlement.settlement_type}
                  </span>
                </div>
                <div className="text-sm text-gray-300 space-y-1">
                  <div>Population: {settlement.population}</div>
                  <div>
                    Position: ({settlement.center_position[0].toFixed(0)},{' '}
                    {settlement.center_position[1].toFixed(0)})
                  </div>
                  {settlement.leadership.has_leadership && (
                    <div className="text-yellow-400">
                      {settlement.leadership.governance_type === 'council'
                        ? `Council (${settlement.leadership.council?.length} members)`
                        : `Leader: ${settlement.leadership.leader?.agent_name}`}
                    </div>
                  )}
                </div>
                {settlement.culture && settlement.culture.traits.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {settlement.culture.traits.slice(0, 3).map((trait) => (
                      <span
                        key={trait.name}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                      >
                        {trait.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {selectedSettlement && selectedSettlementData && (
          <div className="p-4">
            {/* Back button */}
            <button
              onClick={() => setSelectedSettlement(null)}
              className="text-blue-400 hover:text-blue-300 mb-4 text-sm"
            >
              ← Back to list
            </button>

            <div className="space-y-4">
              {/* Header */}
              <div className="bg-gray-700 rounded p-3">
                <h3 className="text-white font-bold text-xl mb-2">
                  {selectedSettlementData.name}
                </h3>
                <div className="text-sm text-gray-300 space-y-1">
                  <div>Type: {selectedSettlementData.settlement_type}</div>
                  <div>Population: {selectedSettlementData.population}</div>
                  <div>
                    Founded:{' '}
                    {new Date(selectedSettlementData.founded_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Leadership */}
              {selectedSettlementData.leadership.has_leadership && (
                <div className="bg-gray-700 rounded p-3">
                  <h4 className="text-white font-semibold mb-2">Leadership</h4>
                  <div className="text-sm text-gray-300">
                    <div className="mb-2">
                      Governance:{' '}
                      <span className="text-yellow-400 capitalize">
                        {selectedSettlementData.leadership.governance_type}
                      </span>
                    </div>

                    {selectedSettlementData.leadership.leader && (
                      <div className="bg-gray-600 rounded p-2">
                        <div className="text-white font-semibold">
                          {selectedSettlementData.leadership.leader.agent_name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {selectedSettlementData.leadership.leader.role}
                        </div>
                        <div className="mt-1">
                          Approval:{' '}
                          <span
                            className={
                              selectedSettlementData.leadership.leader
                                .approval_rating > 70
                                ? 'text-green-400'
                                : selectedSettlementData.leadership.leader
                                    .approval_rating > 40
                                ? 'text-yellow-400'
                                : 'text-red-400'
                            }
                          >
                            {selectedSettlementData.leadership.leader.approval_rating.toFixed(
                              0
                            )}
                            %
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedSettlementData.leadership.leader.qualities.map(
                            (q) => (
                              <span
                                key={q}
                                className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded"
                              >
                                {q}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {selectedSettlementData.leadership.council && (
                      <div className="space-y-2">
                        {selectedSettlementData.leadership.council.map(
                          (member, idx) => (
                            <div key={idx} className="bg-gray-600 rounded p-2">
                              <div className="text-white">{member.agent_name}</div>
                              <div className="text-xs text-gray-400">
                                Approval: {member.approval_rating.toFixed(0)}%
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Culture */}
              {selectedSettlementData.culture && (
                <>
                  {selectedSettlementData.culture.traits.length > 0 && (
                    <div className="bg-gray-700 rounded p-3">
                      <h4 className="text-white font-semibold mb-2">
                        Cultural Traits
                      </h4>
                      <div className="space-y-2">
                        {selectedSettlementData.culture.traits.map((trait) => (
                          <div key={trait.name} className="bg-gray-600 rounded p-2">
                            <div className="flex justify-between items-start">
                              <div className="text-white text-sm">{trait.name}</div>
                              <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                                {trait.type}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Strength: {trait.strength.toFixed(1)} | Adherents:{' '}
                              {trait.adherents}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedSettlementData.culture.traditions.length > 0 && (
                    <div className="bg-gray-700 rounded p-3">
                      <h4 className="text-white font-semibold mb-2">Traditions</h4>
                      <div className="space-y-2">
                        {selectedSettlementData.culture.traditions.map(
                          (tradition) => (
                            <div
                              key={tradition.name}
                              className="bg-gray-600 rounded p-2"
                            >
                              <div className="text-white text-sm">
                                {tradition.name}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {tradition.description}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Practiced {tradition.times_practiced} times
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {selectedSettlementData.culture.core_values.length > 0 && (
                    <div className="bg-gray-700 rounded p-3">
                      <h4 className="text-white font-semibold mb-2">Core Values</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSettlementData.culture.core_values.map((value) => (
                          <span
                            key={value}
                            className="bg-purple-600 text-white text-sm px-2 py-1 rounded"
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
