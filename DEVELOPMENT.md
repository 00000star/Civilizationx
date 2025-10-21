# 🛠️ Development Guide

Welcome to the AI Civilization Simulation development guide! This document will help you understand the codebase, contribute features, fix bugs, and extend the simulation.

---

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Core Systems](#core-systems)
- [Adding New Features](#adding-new-features)
- [Testing](#testing)
- [Code Style](#code-style)
- [Contributing](#contributing)
- [Roadmap](#roadmap)

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **PostgreSQL 15+**
- **Redis**
- **Git**

### Development Setup

```bash
# Clone repository
git clone <repo-url>
cd Civilizationx

# Run setup script
./setup.sh  # Linux/macOS
# or
.\setup.ps1  # Windows

# Choose option 2 (Manual Setup) for development
```

### Running in Development Mode

**Backend (Terminal 1):**
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn src.main:app --reload --port 8000
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm start
```

**Watch Logs:**
```bash
# Backend logs show in Terminal 1
# Frontend logs show in Terminal 2

# For Docker:
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 📁 Project Structure

```
Civilizationx/
├── backend/                    # Python FastAPI backend
│   ├── src/
│   │   ├── agents/            # Agent cognition & behavior
│   │   │   ├── agent.py       # Agent class definition
│   │   │   ├── memory/        # Memory system
│   │   │   │   ├── memory_manager.py
│   │   │   │   └── reflection.py
│   │   │   └── needs.py       # Agent needs (hunger, energy, social)
│   │   │
│   │   ├── world/             # World simulation
│   │   │   ├── terrain_generator.py
│   │   │   ├── resource_spawner.py
│   │   │   └── world_state.py
│   │   │
│   │   ├── simulation/        # Core simulation engine
│   │   │   └── engine.py      # Main simulation loop
│   │   │
│   │   ├── technology/        # Technology system
│   │   │   ├── discovery_engine.py
│   │   │   └── tech_definitions.py
│   │   │
│   │   ├── social/            # Social systems
│   │   │   ├── relationship_manager.py
│   │   │   └── conversation_engine.py
│   │   │
│   │   ├── settlements/       # Settlement formation
│   │   │   └── settlement_detector.py
│   │   │
│   │   ├── economy/           # Economic systems
│   │   │   └── trade_system.py
│   │   │
│   │   ├── culture/           # Cultural evolution
│   │   │   └── culture_system.py
│   │   │
│   │   ├── diplomacy/         # Inter-settlement relations
│   │   │   └── diplomacy_system.py
│   │   │
│   │   ├── governance/        # Leadership & governance
│   │   │   └── leadership_system.py
│   │   │
│   │   ├── planning/          # GOAP planning
│   │   │   └── goap_system.py
│   │   │
│   │   ├── conflict/          # Combat & warfare
│   │   │   ├── combat_system.py
│   │   │   └── war_system.py
│   │   │
│   │   ├── llm/               # LLM integration
│   │   │   └── llm_service.py
│   │   │
│   │   ├── persistence/       # Database persistence
│   │   │   └── persistence_service.py
│   │   │
│   │   ├── api/               # REST API endpoints
│   │   ├── websocket/         # WebSocket handlers
│   │   ├── database/          # Database schemas
│   │   └── utils/             # Utility functions
│   │
│   ├── tests/                 # Test suite
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile            # Backend Docker config
│   └── config.py             # Configuration management
│
├── frontend/                  # React TypeScript frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Panels/       # UI panels
│   │   │   │   ├── StatisticsPanel.tsx
│   │   │   │   ├── AgentListPanel.tsx
│   │   │   │   ├── SettlementListPanel.tsx
│   │   │   │   ├── TechnologyTreePanel.tsx
│   │   │   │   ├── EventTimelinePanel.tsx
│   │   │   │   ├── WorldMapPanel.tsx
│   │   │   │   └── SocialNetworkPanel.tsx
│   │   │   └── World/        # 3D world rendering
│   │   │
│   │   ├── services/         # API clients
│   │   ├── types/            # TypeScript definitions
│   │   └── App.tsx           # Main application
│   │
│   ├── package.json          # Node dependencies
│   ├── Dockerfile            # Frontend Docker config
│   └── vite.config.ts        # Vite configuration
│
├── docs/                      # Documentation
│   ├── COMPLETE_IMPLEMENTATION_SUMMARY.md
│   ├── TESTING_GUIDE.md
│   ├── planning.md
│   └── research.md
│
├── docker-compose.yml         # Docker orchestration
├── .env.example               # Example environment variables
├── README.md                  # Main documentation
├── QUICKSTART.md              # Quick start guide
├── DEVELOPMENT.md             # This file
├── setup.sh                   # Linux/macOS setup script
└── setup.ps1                  # Windows setup script
```

---

## 🏗️ Architecture Overview

### System Architecture

The simulation follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│           React + Three.js + Socket.IO Client                │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP + WebSocket
┌─────────────────────────┴───────────────────────────────────┐
│                       API Layer (FastAPI)                    │
│                  REST Endpoints + WebSocket                  │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                     Business Logic Layer                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Simulation Engine (Async Loop)              │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Agent    World    Memory   Social    Conflict       │  │
│  │  System   State    System   Systems   Mechanics      │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Technology   Settlements   Economy   Governance     │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  GOAP Planning   LLM Service   Persistence           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                      Data Layer                              │
│       PostgreSQL (State)    +    Redis (Cache)              │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Patterns

1. **Global Singleton Pattern**: Systems use global instances for easy cross-module access
2. **Async-First**: All I/O operations are async to prevent blocking
3. **Event-Driven**: WebSocket broadcasts for real-time updates
4. **Composite Scoring**: Multi-factor scoring for memory retrieval
5. **A* Planning**: Goal-Oriented Action Planning for agent behavior

---

## 🔧 Core Systems

### 1. Simulation Engine (`backend/src/simulation/engine.py`)

The heart of the simulation. Runs async loop at configurable speed.

**Key Methods:**
- `async def _tick()`: Single simulation step
- `async def _agent_behavior(agent)`: Agent decision-making
- `async def _check_for_conflicts()`: Combat resolution
- `def spawn_agent()`: Create new agent

**Flow:**
```python
while is_running:
    await _tick()
      → update agents (behavior, movement, needs)
      → update world (resources, regeneration)
      → check social interactions
      → check conflicts
      → update settlements
      → broadcast state via WebSocket
```

### 2. GOAP Planning System (`backend/src/planning/goap_system.py`)

Intelligent goal-driven behavior using A* search.

**Key Classes:**
- `WorldState`: Agent's understanding of world
- `Goal`: Desired state with priority
- `Action`: Preconditions and effects
- `GOAPPlanner`: A* search for action sequences
- `GOAPSystem`: Manages agent plans

**Usage:**
```python
from src.planning.goap_system import goap_system

# Agent makes plan
next_action = goap_system.update_agent_plan(agent.id, agent_data)

# Execute action
if next_action:
    await execute_goap_action(agent, next_action)
```

### 3. Memory System (`backend/src/agents/memory/`)

Four memory types with composite scoring retrieval.

**Key Functions:**
```python
from src.agents.memory.memory_manager import memory_manager

# Create memory
memory_manager.create_memory(
    agent_id="agent_1",
    memory_type="episodic",
    content="I discovered fire!",
    importance_score=9.0
)

# Retrieve memories
memories = memory_manager.retrieve_memories(
    agent_id="agent_1",
    k=10,
    recency_weight=1.0,
    importance_weight=1.5,
    relevance_weight=1.0
)
```

### 4. Technology System (`backend/src/technology/`)

Experience-based discovery with teaching.

**Key Functions:**
```python
from src.technology.discovery_engine import discovery_engine

# Check for discovery
discovered = await discovery_engine.check_for_discovery(
    agent_id="agent_1",
    agent_name="Alice",
    current_activity="crafting",
    simulation_days=10,
    agent_context={}
)

# Teach technology
success = discovery_engine.teach_technology(
    teacher_id="agent_1",
    learner_id="agent_2",
    tech_id="fire"
)
```

### 5. Conflict System (`backend/src/conflict/`)

Combat and warfare mechanics.

**Combat:**
```python
from src.conflict.combat_system import combat_system, CombatParticipant

# Resolve duel
result = combat_system.resolve_duel(participant_a, participant_b)

# Resolve battle
result = combat_system.resolve_group_combat(attackers, defenders, ConflictType.BATTLE)
```

**Wars:**
```python
from src.conflict.war_system import war_system

# Declare war
war = war_system.declare_war(
    aggressor_id, aggressor_name,
    defender_id, defender_name,
    WarGoal.CONQUEST,
    "Resource dispute"
)

# Process battle
war_system.process_battle_result(war_id, victor_id, defeated_id, casualties)
```

---

## 🆕 Adding New Features

### Adding a New Agent Behavior

**Step 1**: Define behavior logic
```python
# backend/src/agents/behaviors/meditation.py
class MeditationBehavior:
    def should_trigger(self, agent_data: Dict) -> bool:
        """Check if agent should meditate."""
        return agent_data["needs"]["social"] > 80 and agent_data["needs"]["energy"] > 70

    def execute(self, agent, world_state):
        """Perform meditation."""
        agent.current_activity = "meditating"
        agent.needs.social += 10
        # Create memory
        memory_manager.create_memory(
            agent_id=agent.id,
            memory_type="episodic",
            content="I meditated and found inner peace.",
            importance_score=5.0
        )
```

**Step 2**: Integrate in simulation engine
```python
# backend/src/simulation/engine.py
from src.agents.behaviors.meditation import MeditationBehavior

meditation = MeditationBehavior()

async def _agent_behavior(self, agent):
    # ... existing behavior code ...

    if meditation.should_trigger(agent.to_dict()):
        meditation.execute(agent, self.world)
```

### Adding a New Technology

**Step 1**: Define in tech_definitions.py
```python
# backend/src/technology/tech_definitions.py
TECHNOLOGIES = {
    "meditation": {
        "display_name": "Meditation",
        "era": "ancient",
        "prerequisites": [],
        "discovery_conditions": {
            "required_activity": "idle",
            "experience_threshold": 50,
            "base_chance": 0.05
        },
        "effects": {
            "social_boost": 1.2
        },
        "complexity": 3
    }
}
```

**Step 2**: Technology is automatically discoverable! No other changes needed.

### Adding a New UI Panel

**Step 1**: Create React component
```typescript
// frontend/src/components/Panels/YourPanel.tsx
import React, { useState, useEffect } from 'react';

export const YourPanel: React.FC = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch data from API
    fetch('http://localhost:8000/api/your-endpoint')
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <div className="panel">
      <h2>Your Panel Title</h2>
      {/* Your UI */}
    </div>
  );
};
```

**Step 2**: Add to main App
```typescript
// frontend/src/App.tsx
import { YourPanel } from './components/Panels/YourPanel';

// In JSX:
<YourPanel />
```

### Adding a New API Endpoint

```python
# backend/src/api/routes.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/your-endpoint")
async def your_endpoint():
    """Your endpoint documentation."""
    # Your logic
    return {"data": "your_data"}
```

---

## 🧪 Testing

### Running Tests

```bash
# All tests
pytest backend/tests/ -v

# Specific test file
pytest backend/tests/test_combat_system.py -v

# With coverage
pytest backend/tests/ --cov=src --cov-report=html

# Integration tests only
pytest backend/tests/test_integration.py -v
```

### Writing Tests

**Unit Test Example:**
```python
# backend/tests/test_your_feature.py
import pytest
from src.your_module import YourClass

@pytest.fixture
def clean_state():
    """Reset state before each test."""
    YourClass.state = {}
    yield
    YourClass.state = {}

def test_your_feature(clean_state):
    """Test description."""
    # Arrange
    obj = YourClass()

    # Act
    result = obj.method(param=123)

    # Assert
    assert result == expected_value
```

**Integration Test Example:**
```python
@pytest.mark.asyncio
async def test_system_integration():
    """Test multiple systems working together."""
    # Setup
    engine = SimulationEngine()
    await engine.initialize()

    # Test interaction
    agent = engine.spawn_agent()
    await engine._tick()

    # Verify
    assert agent.is_alive
```

See [TESTING_GUIDE.md](../TESTING_GUIDE.md) for comprehensive testing documentation.

---

## 📝 Code Style

### Python

- **Style**: PEP 8
- **Type Hints**: Encouraged
- **Docstrings**: Required for public functions
- **Line Length**: 100 characters

**Example:**
```python
def calculate_score(
    recency: float,
    importance: float,
    relevance: float,
    weights: tuple[float, float, float] = (1.0, 1.0, 1.0)
) -> float:
    """
    Calculate composite score from multiple factors.

    Args:
        recency: Recency score (0.0-1.0)
        importance: Importance score (0.0-1.0)
        relevance: Relevance score (0.0-1.0)
        weights: Tuple of (recency_weight, importance_weight, relevance_weight)

    Returns:
        Final composite score
    """
    r_weight, i_weight, rel_weight = weights
    return (recency * r_weight) + (importance * i_weight) + (relevance * rel_weight)
```

### TypeScript

- **Style**: ESLint + Prettier
- **Types**: Explicit types preferred
- **Components**: Functional components with hooks

**Example:**
```typescript
interface AgentData {
  id: string;
  name: string;
  health: number;
}

export const AgentCard: React.FC<{ agent: AgentData }> = ({ agent }) => {
  const [selected, setSelected] = useState(false);

  return (
    <div onClick={() => setSelected(!selected)}>
      <h3>{agent.name}</h3>
      <p>Health: {agent.health}%</p>
    </div>
  );
};
```

---

## 🤝 Contributing

### Contribution Workflow

1. **Fork** the repository
2. **Create branch**: `git checkout -b feature/amazing-feature`
3. **Make changes**: Implement your feature
4. **Add tests**: Ensure coverage
5. **Run tests**: `pytest backend/tests/`
6. **Commit**: `git commit -m 'Add amazing feature'`
7. **Push**: `git push origin feature/amazing-feature`
8. **Pull Request**: Open PR with description

### Pull Request Guidelines

- **Title**: Clear and descriptive
- **Description**: What, why, and how
- **Tests**: Include test coverage
- **Documentation**: Update docs if needed
- **Code Style**: Follow style guidelines
- **Review**: Address reviewer feedback

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Example:**
```
feat: Add meditation behavior for agents

- Agents can now meditate when social needs are high
- Creates episodic memories of meditation
- Increases social satisfaction by 10 points

Closes #42
```

---

## 🗺️ Roadmap

### Current: 75-80% Complete

**✅ Completed:**
- Phase 1: Foundation
- Phase 2-3: Advanced systems
- LLM Integration
- GOAP Planning
- Conflict Mechanics
- 6 UI Panels
- Testing Framework (30%)

**🚧 In Progress:**
- Database Persistence (framework ready)
- Complete Test Coverage
- Performance Optimization

**📋 Planned:**

**Short-term (1-2 months):**
- Complete SQLAlchemy models
- Vector embeddings for semantic search
- Full test coverage (>80%)
- Performance profiling and optimization
- Agent inspection UI
- Historical timeline UI

**Mid-term (3-6 months):**
- Migration system
- Monument construction
- Advanced diplomacy (spies, embassies)
- Religion system
- Disease and health
- Save/load functionality
- Multiplayer observation

**Long-term (6-12 months):**
- Climate change system
- Cross-generational learning improvements
- Meta-cognition enhancements
- AI-generated art and culture
- Procedural quest generation
- Historical narrative generation

---

## 🆘 Getting Help

**Documentation:**
- [README.md](README.md) - Main documentation
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [COMPLETE_IMPLEMENTATION_SUMMARY.md](../COMPLETE_IMPLEMENTATION_SUMMARY.md) - Technical deep dive
- [TESTING_GUIDE.md](../TESTING_GUIDE.md) - Testing guide
- [planning.md](../planning.md) - Original design

**Support:**
- **Issues**: GitHub Issues for bugs/features
- **Discussions**: GitHub Discussions for questions
- **API Docs**: http://localhost:8000/docs
- **Code Comments**: Extensive inline documentation

---

## 📚 Additional Resources

**Learning Resources:**
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Three.js Documentation](https://threejs.org/docs/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Pytest Documentation](https://docs.pytest.org/)

**Inspiration:**
- ["Generative Agents" Paper (Stanford, 2023)](https://arxiv.org/abs/2304.03442)
- [Agent-Based Modeling](https://en.wikipedia.org/wiki/Agent-based_model)
- [Emergent Complexity](https://en.wikipedia.org/wiki/Emergence)

---

**Happy coding! 🚀 Let's build amazing emergent civilizations together!**
