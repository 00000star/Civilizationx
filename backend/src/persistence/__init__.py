"""
Database Persistence Module

Handles all database operations for saving and loading simulation state.

Key Features:
- Complete simulation state persistence
- Incremental saves (only changed data)
- Transaction safety (atomic saves)
- Checkpoint/restore functionality
- Data cleanup utilities

Usage:
------
```python
from src.persistence import persistence_service

# Auto-save every N ticks
if tick_count % 100 == 0:
    await persistence_service.save_simulation_state(engine)

# Load on startup
await persistence_service.load_simulation_state(engine)

# Create checkpoint
await persistence_service.create_checkpoint(engine, "before_major_war")
```

Current Status:
---------------
✅ Service interface defined
⚠️ Database models need to be created
⚠️ Actual persistence logic is stubbed

Next Steps:
-----------
1. Create SQLAlchemy models for all entities
2. Implement actual save/load logic
3. Add connection pooling configuration
4. Add data migration utilities
"""
from .persistence_service import persistence_service, PersistenceService

__all__ = ["persistence_service", "PersistenceService"]
