# Civilizationx - AI Civilization Simulation

A groundbreaking 2D sandbox simulation where AI agents autonomously evolve from primitive individuals into complex civilizations, developing technologies, social structures, and infrastructure through emergent behaviors.

## Overview

Civilizationx is an autonomous civilization simulator powered by Large Language Models (LLMs). Watch as AI agents:
- Discover technologies through genuine experimentation (fire, tools, agriculture, metallurgy, and beyond)
- Form natural relationships and social networks
- Develop settlements, economies, and governance structures
- Create distinct cultural identities and values
- Interact diplomatically across multiple civilizations

## Features

### Agent Cognition System
- **Multi-scale memory**: Episodic, semantic, procedural, and collective memory types
- **Reflection mechanisms**: Agents synthesize insights from experiences
- **Hierarchical planning**: Daily agendas, activity blocks, and immediate actions
- **Context-bounded reasoning**: Prevents anachronistic knowledge leakage

### World Simulation
- **Procedural terrain generation**: Multiple biomes (forests, plains, mountains, rivers, deserts)
- **Dynamic resources**: Depletion, regeneration, and seasonal variation
- **Environmental systems**: Day/night cycles, weather, seasons
- **Spatial optimization**: Efficient quadtree-based entity management

### Technology Progression
- **Experience-based discovery**: No predefined tech tree
- **Emergent pacing**: Technologies emerge through agent experimentation
- **Knowledge transmission**: Teaching, observational learning, and cultural spread
- **5 Eras**: Primitive → Ancient → Classical → Industrial → Modern

### Social & Civilization Systems
- **Natural language conversations**: LLM-powered agent dialogues
- **Relationship dynamics**: Trust, reputation, and social networks
- **Settlement formation**: Organic emergence from agent clustering
- **Economic specialization**: Roles, trade, and labor division
- **Governance**: Leadership emergence and decision-making systems
- **Cultural evolution**: Shared values and traditions

### Visualization
- **Three.js rendering**: Beautiful 2D sprite-based visualization with 3D capabilities
- **Real-time updates**: WebSocket-powered live simulation viewing
- **Deep inspection**: Examine agent memories, plans, relationships, and more
- **Metrics dashboard**: Track population, technologies, settlements, and civilizations

## Tech Stack

### Backend
- **Language**: Python 3.11+
- **Framework**: FastAPI
- **Database**: PostgreSQL 15+ with pgvector extension
- **Caching**: Redis
- **LLM Integration**: OpenAI GPT-4, Anthropic Claude (configurable)

### Frontend
- **Framework**: React 18+ with TypeScript
- **Rendering**: Three.js (React Three Fiber)
- **State Management**: Zustand
- **Styling**: TailwindCSS
- **Real-time**: Socket.IO-client

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Database Migrations**: Alembic
- **Testing**: Pytest (backend), Vitest (frontend)

## Quick Start

### Prerequisites
- Docker and Docker Compose
- OpenAI and/or Anthropic API keys

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Civilizationx
```

2. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

3. **Start all services**
```bash
docker-compose up -d
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### First Run

When you first start the simulation:
1. The database will be automatically initialized with schemas
2. A procedurally generated world will be created
3. You can spawn initial agents through the UI
4. Click "Play" to start the simulation

## Development

### Project Structure
```
Civilizationx/
├── backend/          # Python FastAPI backend
│   ├── src/
│   │   ├── agents/       # Agent cognition, memory, planning
│   │   ├── world/        # Terrain, resources, environment
│   │   ├── technology/   # Discovery, transmission
│   │   ├── social/       # Relationships, conversations
│   │   ├── civilization/ # Settlements, economy, governance
│   │   ├── simulation/   # Core simulation engine
│   │   ├── database/     # Database models and schemas
│   │   └── api/          # REST API endpoints
│   └── tests/
├── frontend/         # React TypeScript frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── stores/       # State management
│   │   ├── services/     # API and WebSocket services
│   │   └── types/        # TypeScript definitions
│   └── public/
│       └── sprites/      # Visual assets
└── docs/             # Documentation
```

### Running Tests

**Backend:**
```bash
cd backend
pytest tests/ -v --cov=src
```

**Frontend:**
```bash
cd frontend
npm run test
```

### Development Mode

For hot-reloading during development:
```bash
# Backend (already running with --reload in docker-compose)
docker-compose logs -f backend

# Frontend (already running with Vite HMR)
docker-compose logs -f frontend
```

## Configuration

Key configuration options in `.env`:

- `SIMULATION_SPEED`: Simulation time multiplier (1.0 = real-time)
- `MAX_AGENTS`: Maximum concurrent agents
- `WORLD_SIZE`: World dimensions (512, 1024, or 2048)
- `DISCOVERY_RATE_MULTIPLIER`: Technology discovery speed (0.5 = slow, 2.0 = fast)

## Performance

**Targets:**
- 50+ agents running concurrently
- 60 FPS frontend rendering
- <100ms memory retrieval per agent
- <2s planning generation
- <3s conversation turn generation

## Phased Development

**Phase 1 (Current)**: Foundation
- ✓ Basic agents with needs (hunger, energy, social)
- ✓ Simple world generation and resources
- ✓ Episodic memory system
- ✓ Basic movement and gathering

**Phase 2**: Cognition & Social
- Advanced memory (semantic, procedural, collective)
- Reflection mechanisms
- Natural language conversations
- Relationship tracking

**Phase 3**: Civilization Emergence
- Technology discovery system
- Settlement formation
- Economic specialization
- Governance emergence

**Phase 4+**: Advanced features (multi-civilization, infrastructure, polish)

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design and components
- [API Reference](docs/API.md) - REST API documentation
- [Development Guide](docs/DEVELOPMENT.md) - Contributing guidelines
- [User Guide](docs/USER_GUIDE.md) - How to use the simulation

## Known Challenges & Solutions

### LLM API Costs
- **Challenge**: High-frequency LLM calls can be expensive
- **Solution**: Aggressive caching, template-based responses, tiered model usage (Claude for complex, GPT-3.5 for simple)

### Knowledge Leakage Prevention
- **Challenge**: LLMs inherently know modern technologies
- **Solution**: Multi-layer validation, context filtering, output scanning, forbidden term detection

### Emergence Pacing
- **Challenge**: Civilizations progress too fast or too slow
- **Solution**: Configurable discovery rates, dynamic difficulty adjustment

## Contributing

Contributions are welcome! Please read [DEVELOPMENT.md](docs/DEVELOPMENT.md) for guidelines.

## License

[Add your license here]

## Acknowledgments

This project is inspired by:
- "Generative Agents: Interactive Simulacra of Human Behavior" (Stanford, 2023)
- Classic civilization games (Civilization series, Dwarf Fortress)
- Emergent complexity research and agent-based modeling

## Support

For questions, issues, or discussions:
- Open an issue on GitHub
- Check the documentation in `/docs`
- Review the planning document for detailed specifications

---

**Status**: Phase 1 Development (Foundation)

Built with passion for emergent complexity and AI-driven simulation. 🚀
