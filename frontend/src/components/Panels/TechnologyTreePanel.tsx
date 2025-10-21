import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface TechnologyData {
  unique_technologies: string[];
  total_unique: number;
  agent_technologies: Record<
    string,
    {
      agent_name: string;
      technologies: string[];
    }
  >;
}

export const TechnologyTreePanel: React.FC = () => {
  const [techData, setTechData] = useState<TechnologyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchTechnologies = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/technologies');
        setTechData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load technologies');
        console.error('Error fetching technologies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTechnologies();
    const interval = setInterval(fetchTechnologies, 10000);

    return () => clearInterval(interval);
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition"
      >
        📚 Technologies ({techData?.total_unique || 0})
      </button>
    );
  }

  return (
    <div className="fixed right-4 bottom-4 w-96 max-h-[70vh] bg-gray-800 border-2 border-gray-600 rounded-lg shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-3 flex justify-between items-center border-b border-gray-600">
        <h2 className="text-white font-bold text-lg">
          Technologies ({techData?.total_unique || 0})
        </h2>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white transition"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="overflow-y-auto max-h-[calc(70vh-60px)] p-4">
        {loading && (
          <div className="text-gray-400 text-center py-8">Loading...</div>
        )}

        {error && <div className="text-red-400 text-center py-4">{error}</div>}

        {!loading && techData && techData.total_unique === 0 && (
          <div className="text-gray-400 text-center py-8">
            No technologies discovered yet. Agents will discover technologies as
            they explore and learn.
          </div>
        )}

        {techData && techData.total_unique > 0 && (
          <div className="space-y-4">
            {/* Overall Progress */}
            <div className="bg-gray-700 rounded p-3">
              <h3 className="text-white font-semibold mb-2">
                Discovered Technologies
              </h3>
              <div className="text-3xl text-green-400 font-bold text-center py-2">
                {techData.total_unique}
              </div>
              <div className="text-sm text-gray-400 text-center">
                unique technologies known across all agents
              </div>
            </div>

            {/* Technology List */}
            <div className="bg-gray-700 rounded p-3">
              <h3 className="text-white font-semibold mb-2">All Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {techData.unique_technologies.sort().map((tech) => {
                  // Count how many agents know this tech
                  const knowerCount = Object.values(
                    techData.agent_technologies
                  ).filter((agent) => agent.technologies.includes(tech)).length;

                  return (
                    <div
                      key={tech}
                      className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded relative group"
                    >
                      <span className="capitalize">{tech.replace(/_/g, ' ')}</span>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        Known by {knowerCount} agent{knowerCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Agent Technology Distribution */}
            <div className="bg-gray-700 rounded p-3">
              <h3 className="text-white font-semibold mb-2">
                Knowledge Distribution
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Object.entries(techData.agent_technologies)
                  .sort((a, b) => b[1].technologies.length - a[1].technologies.length)
                  .map(([agentId, agentData]) => (
                    <div key={agentId} className="bg-gray-600 rounded p-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white text-sm">
                          {agentData.agent_name}
                        </span>
                        <span className="text-yellow-400 font-semibold text-sm">
                          {agentData.technologies.length} tech
                          {agentData.technologies.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {agentData.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Technology Era Breakdown */}
            <div className="bg-gray-700 rounded p-3">
              <h3 className="text-white font-semibold mb-2">Era Progress</h3>
              <div className="space-y-2">
                {['primitive', 'ancient', 'classical', 'industrial', 'modern'].map(
                  (era) => {
                    const eraT echs = techData.unique_technologies.filter((tech) => {
                      // This is a simplified check - in reality you'd check against tech_definitions
                      const primitiveTechs = [
                        'fire',
                        'stone_tools',
                        'basic_shelter',
                        'hunting',
                        'gathering_knowledge',
                      ];
                      const ancientTechs = [
                        'agriculture',
                        'pottery',
                        'basic_language',
                        'animal_domestication',
                        'weaving',
                      ];

                      if (era === 'primitive') return primitiveTechs.includes(tech);
                      if (era === 'ancient') return ancientTechs.includes(tech);
                      return false;
                    });

                    const total =
                      era === 'primitive'
                        ? 5
                        : era === 'ancient'
                        ? 5
                        : era === 'classical'
                        ? 0
                        : 0;

                    if (total === 0) return null;

                    return (
                      <div key={era}>
                        <div className="flex justify-between text-sm text-gray-300 mb-1">
                          <span className="capitalize">{era}</span>
                          <span>
                            {eraTechs.length}/{total}
                          </span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${(eraTechs.length / total) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
