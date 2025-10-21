# Testing Guide - AI Civilization Simulation

## Overview

This guide explains how to test the simulation at all levels: unit, integration, and end-to-end.

---

## Test Structure

```
backend/tests/
├── test_combat_system.py       # Combat mechanics tests
├── test_memory_system.py       # Memory and retrieval tests
├── test_goap_system.py         # Planning system tests
├── test_technology.py          # Technology discovery tests
├── test_integration.py         # Integration tests
└── fixtures.py                 # Shared test fixtures
```

---

## Running Tests

### Run All Tests
```bash
cd Civilizationx/backend
pytest tests/ -v
```

### Run Specific Test File
```bash
pytest tests/test_combat_system.py -v
```

### Run Specific Test Class
```bash
pytest tests/test_combat_system.py::TestDuelResolution -v
```

### Run with Coverage
```bash
pytest tests/ --cov=src --cov-report=html
```

### Run in Watch Mode
```bash
pytest-watch tests/
```

---

## Writing Tests

### Unit Test Template

```python
"""
Unit Tests for [System Name]

Brief description of what's being tested.
"""
import pytest
from src.module.system import system_instance


@pytest.fixture
def clean_system():
    """Reset system state between tests."""
    system_instance.reset()
    yield system_instance
    system_instance.reset()


class TestFeatureName:
    """Test specific feature."""

    def test_specific_behavior(self, clean_system):
        """Test that specific behavior works correctly."""
        # Arrange
        input_data = {...}

        # Act
        result = system_instance.do_something(input_data)

        # Assert
        assert result.is_valid()
        assert result.value == expected_value
```

### Integration Test Template

```python
"""
Integration Tests

Tests interactions between multiple systems.
"""
import pytest
from src.simulation.engine import SimulationEngine


@pytest.mark.asyncio
async def test_agent_discovery_flow():
    """Test complete flow from activity to discovery."""
    # Create minimal simulation
    engine = SimulationEngine(world_size=64)
    await engine.initialize()

    # Spawn agent
    agent = engine.spawn_agent()

    # Set up conditions for discovery
    agent.current_activity = "seeking_warmth"

    # Run simulation
    for _ in range(100):
        await engine._tick()

    # Verify discovery occurred
    technologies = discovery_engine.get_agent_technologies(agent.id)
    assert len(technologies) > 0
```

---

## Test Categories

### 1. Unit Tests

Test individual functions/methods in isolation.

**Example:**
```python
def test_combat_strength_calculation():
    participant = CombatParticipant(
        id="agent_1",
        name="Test",
        combat_strength=50.0,
        morale=100.0,
        technologies=["stone_tools"]
    )

    strength = combat_system.calculate_combat_strength(participant)
    assert strength > 50.0  # Should be boosted by tech
```

### 2. Integration Tests

Test interactions between systems.

**Example:**
```python
async def test_conversation_creates_memory():
    # Start conversation
    conv = conversation_engine.initiate_conversation(
        agent_a_id, agent_a_name,
        agent_b_id, agent_b_name
    )

    # Continue conversation
    await conversation_engine.continue_conversation(...)

    # Verify memories created
    memories = memory_manager.get_recent_memories(agent_a_id)
    assert any("conversation" in m["content"].lower() for m in memories)
```

### 3. End-to-End Tests

Test complete simulation scenarios.

**Example:**
```python
async def test_settlement_formation_scenario():
    engine = SimulationEngine()
    await engine.initialize()

    # Spawn agents close together
    for i in range(5):
        engine.spawn_agent(position=(100, 100))

    # Run for enough ticks to form settlement
    for _ in range(500):
        await engine._tick()

    # Verify settlement formed
    settlements = settlement_detector.get_all_settlements()
    assert len(settlements) > 0
    assert settlements[0].population >= 3
```

---

## Mocking and Fixtures

### Common Fixtures

```python
@pytest.fixture
def sample_agent():
    """Create a sample agent for testing."""
    from src.agents.agent import Agent
    return Agent(
        name="Test Agent",
        position=(100, 100),
        birth_time=datetime.now()
    )


@pytest.fixture
def sample_world():
    """Create a small test world."""
    from src.world.world_state import WorldState
    world = WorldState(width=64, height=64)
    world.generate_world()
    return world


@pytest.fixture
async def simulation_engine():
    """Create and initialize test simulation."""
    engine = SimulationEngine(world_size=64)
    await engine.initialize()
    yield engine
    # Cleanup
    if engine.is_running:
        await engine.stop()
```

### Mocking LLM Calls

```python
@pytest.fixture
def mock_llm_service(monkeypatch):
    """Mock LLM service for testing without API calls."""
    async def mock_generate(*args, **kwargs):
        return "Test response from mock LLM"

    monkeypatch.setattr(
        "src.llm.llm_service.LLMService._generate_anthropic",
        mock_generate
    )
```

---

## Performance Testing

### Test Simulation Performance

```python
import time

def test_simulation_performance():
    """Test that simulation can maintain target tick rate."""
    engine = SimulationEngine()
    engine.initialize()

    # Spawn many agents
    for _ in range(50):
        engine.spawn_agent()

    # Measure tick time
    start = time.time()
    num_ticks = 100

    for _ in range(num_ticks):
        engine._tick()

    duration = time.time() - start
    avg_tick_time = duration / num_ticks

    # Should complete tick in < 0.1s
    assert avg_tick_time < 0.1
```

---

## Testing Best Practices

### 1. Test Independence
- Each test should be independent
- Use fixtures to reset state
- Don't rely on test execution order

### 2. Clear Test Names
```python
# Good
def test_agent_with_stone_tools_has_higher_combat_strength():
    ...

# Bad
def test_agent_1():
    ...
```

### 3. Arrange-Act-Assert
```python
def test_feature():
    # Arrange - Set up test data
    input = create_test_data()

    # Act - Perform the action
    result = system.do_something(input)

    # Assert - Verify the result
    assert result == expected
```

### 4. Test Edge Cases
```python
def test_empty_agent_list():
    result = combat_system.resolve_group_combat([], [])
    # Should handle gracefully

def test_very_large_values():
    participant = CombatParticipant(
        combat_strength=1000000.0,  # Extreme value
        ...
    )
    # Should not crash
```

### 5. Use Parametrize for Similar Tests
```python
@pytest.mark.parametrize("morale,expected_multiplier", [
    (0, 0.5),
    (50, 1.0),
    (100, 1.5),
])
def test_morale_multipliers(morale, expected_multiplier):
    participant = CombatParticipant(..., morale=morale)
    strength = combat_system.calculate_combat_strength(participant)
    # Verify multiplier is correct
```

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.11'

    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install pytest pytest-asyncio pytest-cov

    - name: Run tests
      run: |
        pytest tests/ -v --cov=src --cov-report=xml

    - name: Upload coverage
      uses: codecov/codecov-action@v2
```

---

## Test Coverage Goals

- **Overall**: > 70%
- **Core Systems** (combat, memory, planning): > 85%
- **Utilities**: > 80%
- **UI Components**: > 50% (focus on logic, not rendering)

### Check Coverage
```bash
pytest --cov=src --cov-report=term-missing
```

---

## Debugging Tests

### Run in Debug Mode
```bash
pytest tests/ -v -s  # -s shows print statements
```

### Use PDB Debugger
```python
def test_something():
    import pdb; pdb.set_trace()  # Breakpoint
    result = system.do_something()
    assert result.is_valid()
```

### Verbose Logging
```python
import logging
logging.basicConfig(level=logging.DEBUG)

def test_with_logging():
    # All logger calls will now print
    ...
```

---

## Common Issues

### 1. Async Tests Failing
```python
# Must use pytest-asyncio and mark
@pytest.mark.asyncio
async def test_async_function():
    result = await async_function()
    assert result
```

### 2. Fixtures Not Working
```python
# Make sure to pass fixture as parameter
def test_something(my_fixture):  # ← Pass as param
    my_fixture.do_something()
```

### 3. Random Test Failures
```python
# Set random seed for reproducibility
import random
random.seed(42)

def test_random_behavior():
    # Now deterministic
    ...
```

---

## Next Steps

1. **Run existing tests**: `pytest tests/ -v`
2. **Add tests for your feature**: Copy template above
3. **Achieve coverage goal**: Aim for >70%
4. **Setup CI**: Use GitHub Actions example
5. **Write integration tests**: Test system interactions

---

**Remember**: Tests are documentation too! Write clear, readable tests that explain how the system should behave.
