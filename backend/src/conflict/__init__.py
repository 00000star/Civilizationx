"""
Conflict System Module

This module handles all combat and warfare in the simulation.

Components:
-----------
1. combat_system.py - Individual and group combat resolution
2. war_system.py - Settlement-level wars and peace treaties

Usage Example:
--------------
```python
from src.conflict import combat_system, war_system, CombatParticipant

# Create combatants
agent_a = CombatParticipant(
    id="agent_1",
    name="Warrior A",
    combat_strength=50.0,
    health=100.0,
    morale=80.0,
    technologies=["stone_tools", "hunting"],
    is_defender=False
)

agent_b = CombatParticipant(
    id="agent_2",
    name="Warrior B",
    combat_strength=45.0,
    health=100.0,
    morale=75.0,
    technologies=["stone_tools"],
    is_defender=True
)

# Resolve duel
result = combat_system.resolve_duel(agent_a, agent_b)

# Declare war between settlements
war = war_system.declare_war(
    aggressor_id="settlement_1",
    aggressor_name="Northburg",
    defender_id="settlement_2",
    defender_name="Southdale",
    war_goal=WarGoal.CONQUEST,
    casus_belli="Territorial dispute over the eastern forest"
)
```

Key Concepts:
-------------
- Combat is probabilistic based on strength ratios
- Technology provides significant advantages
- Numbers matter (5v1 is very advantageous)
- Morale affects combat effectiveness
- Wars play out over many game ticks
- Peace can be negotiated at any time
"""
from .combat_system import (
    combat_system,
    CombatSystem,
    CombatParticipant,
    CombatResult,
    ConflictType,
    CombatOutcome
)

from .war_system import (
    war_system,
    WarSystem,
    War,
    WarStatus,
    WarGoal,
    PeaceTreaty
)

__all__ = [
    # Combat System
    "combat_system",
    "CombatSystem",
    "CombatParticipant",
    "CombatResult",
    "ConflictType",
    "CombatOutcome",

    # War System
    "war_system",
    "WarSystem",
    "War",
    "WarStatus",
    "WarGoal",
    "PeaceTreaty",
]
