"""FastAPI application entry point for Civilization Simulation."""
import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import asyncio

from config import settings
from src.simulation.engine import SimulationEngine

# Phase 2-3 imports
from src.agents.memory.memory_manager import memory_manager
from src.technology.discovery_engine import discovery_engine
from src.social.relationship_manager import relationship_manager
from src.settlements.settlement_detector import settlement_detector
from src.economy.trade_system import trade_system
from src.culture.culture_system import culture_system
from src.diplomacy.diplomacy_system import diplomacy_system
from src.governance.leadership_system import leadership_system

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Civilizationx API",
    description="AI Civilization Simulation Backend",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create Socket.IO server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    ping_interval=settings.websocket_ping_interval,
    ping_timeout=settings.websocket_ping_timeout
)

# Wrap with ASGI app
socket_app = socketio.ASGIApp(sio, app)

# Global simulation engine instance
simulation_engine: SimulationEngine = None

# Store simulation state
simulation_state = {
    "is_running": False,
    "simulation_speed": settings.simulation_speed,
    "tick_count": 0,
    "simulation_time": 0,
}


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    global simulation_engine
    
    logger.info("Starting Civilizationx backend...")

    # Import here to avoid circular imports
    from src.database.connection import init_db

    # Initialize database
    await init_db()
    logger.info("Database initialized")

    # Initialize simulation engine
    simulation_engine = SimulationEngine(
        world_size=settings.world_size,
        seed=None  # Use timestamp-based seed
    )
    await simulation_engine.initialize()
    logger.info("Simulation engine initialized")

    # Register callbacks for WebSocket broadcasting
    simulation_engine.register_tick_callback(broadcast_simulation_tick)
    simulation_engine.register_agent_update_callback(broadcast_agent_update)
    simulation_engine.register_event_callback(broadcast_event)

    logger.info("Civilizationx backend started successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    global simulation_engine
    
    logger.info("Shutting down Civilizationx backend...")

    # Stop simulation if running
    if simulation_engine:
        await simulation_engine.stop()

    logger.info("Civilizationx backend shut down successfully")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "Civilizationx API",
        "version": "0.1.0",
        "status": "running",
        "simulation_running": simulation_state["is_running"],
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/api/simulation/status")
async def get_simulation_status():
    """Get current simulation status."""
    if not simulation_engine:
        return {"error": "Simulation not initialized"}
    
    return simulation_engine.get_simulation_state()


@app.get("/api/simulation/agents")
async def get_agents():
    """Get all agents."""
    if not simulation_engine:
        return {"error": "Simulation not initialized"}
    
    return {
        "agents": simulation_engine.get_agents_state(),
        "count": len(simulation_engine.agents)
    }


@app.get("/api/simulation/world")
async def get_world_summary():
    """Get world summary."""
    if not simulation_engine:
        return {"error": "Simulation not initialized"}
    
    return simulation_engine.world.get_world_summary()


@app.get("/api/simulation/world/tiles")
async def get_world_tiles(x_min: int = 0, y_min: int = 0, 
                         x_max: int = None, y_max: int = None):
    """Get world tiles in range."""
    if not simulation_engine:
        return {"error": "Simulation not initialized"}
    
    tiles = simulation_engine.get_world_tiles(x_min, y_min, x_max, y_max)
    return {"tiles": tiles, "count": len(tiles)}


@app.get("/api/simulation/resources")
async def get_resources():
    """Get all resources."""
    if not simulation_engine:
        return {"error": "Simulation not initialized"}
    
    return {
        "resources": simulation_engine.get_resources(),
        "count": len(simulation_engine.world.resources)
    }


# Phase 2-3 API Endpoints

@app.get("/api/agents/{agent_id}")
async def get_agent_details(agent_id: str):
    """Get detailed information about a specific agent."""
    if not simulation_engine:
        return {"error": "Simulation not initialized"}
    
    # Find agent
    agent = next((a for a in simulation_engine.agents if a.id == agent_id), None)
    if not agent:
        return {"error": "Agent not found"}
    
    # Get memories
    memories = memory_manager.get_recent_memories(agent_id, hours=48, limit=20)
    
    # Get technologies
    technologies = discovery_engine.get_agent_technologies(agent_id)
    
    # Get relationships
    relationships = relationship_manager.get_agent_relationships(agent_id)
    
    # Get specialization
    specialization = trade_system.get_agent_specialization(agent_id)
    
    # Get settlement
    settlement = settlement_detector.get_agent_settlement(agent_id)
    
    return {
        "agent": agent.to_dict(),
        "memories": [
            {
                "content": m["content"],
                "type": m["memory_type"],
                "importance": m["importance_score"],
                "created_at": m["created_at"].isoformat()
            }
            for m in memories
        ],
        "technologies": technologies,
        "relationships": [
            {
                "other_agent_id": r.agent_b_id if r.agent_a_id == agent_id else r.agent_a_id,
                "score": r.relationship_score,
                "type": r.relationship_type,
                "trust": r.trust_level
            }
            for r in relationships
        ],
        "specialization": {
            "primary_role": specialization.primary_role if specialization else None,
            "skill_levels": dict(specialization.skill_levels) if specialization else {}
        },
        "settlement": {
            "id": settlement.id,
            "name": settlement.name,
            "population": settlement.population
        } if settlement else None
    }


@app.get("/api/settlements")
async def get_settlements():
    """Get all settlements."""
    if not simulation_engine:
        return {"error": "Simulation not initialized"}
    
    settlements = settlement_detector.get_all_settlements()
    
    return {
        "settlements": [
            {
                **settlement.to_dict(),
                "culture": culture_system.get_settlement_culture(settlement.id).to_dict()
                if culture_system.get_settlement_culture(settlement.id) else None,
                "leadership": leadership_system.get_leadership_info(settlement.id)
            }
            for settlement in settlements
        ],
        "count": len(settlements)
    }


@app.get("/api/settlements/{settlement_id}")
async def get_settlement_details(settlement_id: str):
    """Get detailed information about a specific settlement."""
    if not simulation_engine:
        return {"error": "Simulation not initialized"}
    
    settlement = settlement_detector.get_settlement_by_id(settlement_id)
    if not settlement:
        return {"error": "Settlement not found"}
    
    # Get culture
    culture = culture_system.get_settlement_culture(settlement_id)
    
    # Get leadership
    leadership = leadership_system.get_leadership_info(settlement_id)
    
    # Get diplomatic relationships
    all_settlements = settlement_detector.get_all_settlements()
    diplomatic_relations = []
    for other_settlement in all_settlements:
        if other_settlement.id != settlement_id:
            rel = diplomacy_system.get_relationship(settlement_id, other_settlement.id)
            if rel:
                diplomatic_relations.append({
                    "settlement_id": other_settlement.id,
                    "settlement_name": other_settlement.name,
                    "status": rel.status.value,
                    "trust_level": rel.trust_level
                })
    
    return {
        "settlement": settlement.to_dict(),
        "culture": culture.to_dict() if culture else None,
        "leadership": leadership,
        "diplomatic_relations": diplomatic_relations,
        "member_count": len(settlement.member_ids)
    }


@app.get("/api/technologies")
async def get_technologies():
    """Get all known technologies across all agents."""
    if not simulation_engine:
        return {"error": "Simulation not initialized"}
    
    # Collect all unique technologies
    all_techs = set()
    agent_tech_map = {}
    
    for agent in simulation_engine.agents:
        if agent.is_alive:
            techs = discovery_engine.get_agent_technologies(agent.id)
            all_techs.update(techs)
            if techs:
                agent_tech_map[agent.id] = {
                    "agent_name": agent.name,
                    "technologies": techs
                }
    
    return {
        "unique_technologies": list(all_techs),
        "total_unique": len(all_techs),
        "agent_technologies": agent_tech_map
    }


@app.get("/api/economy/trade")
async def get_trade_statistics():
    """Get trade system statistics."""
    if not simulation_engine:
        return {"error": "Simulation not initialized"}
    
    return trade_system.get_trade_statistics()


@app.get("/api/relationships")
async def get_all_relationships():
    """Get all relationships in the simulation."""
    if not simulation_engine:
        return {"error": "Simulation not initialized"}
    
    relationships = []
    for agent in simulation_engine.agents:
        if agent.is_alive:
            agent_rels = relationship_manager.get_agent_relationships(agent.id)
            for rel in agent_rels:
                relationships.append({
                    "agent_a_id": rel.agent_a_id,
                    "agent_b_id": rel.agent_b_id,
                    "score": rel.relationship_score,
                    "type": rel.relationship_type,
                    "trust": rel.trust_level,
                    "interactions": rel.interaction_count
                })
    
    return {
        "relationships": relationships,
        "count": len(relationships)
    }


@app.get("/api/events/recent")
async def get_recent_events():
    """Get recent simulation events."""
    # This would require event storage, which we can add
    # For now, return placeholder
    return {
        "events": [],
        "message": "Event history not yet implemented"
    }


# WebSocket broadcast functions
async def broadcast_simulation_tick(state: dict):
    """Broadcast simulation tick to all clients."""
    await sio.emit('simulation_tick', state)


async def broadcast_agent_update(agent_data: dict):
    """Broadcast agent update to all clients."""
    await sio.emit('agent_update', agent_data)


async def broadcast_event(event: dict):
    """Broadcast simulation event to all clients."""
    await sio.emit('event', event)


# WebSocket Events
@sio.event
async def connect(sid, environ):
    """Handle client connection."""
    logger.info(f"Client connected: {sid}")
    await sio.emit('connection_established', {'sid': sid}, room=sid)


@sio.event
async def disconnect(sid):
    """Handle client disconnection."""
    logger.info(f"Client disconnected: {sid}")


@sio.event
async def start_simulation(sid):
    """Start the simulation."""
    global simulation_engine
    
    if not simulation_engine:
        await sio.emit('error', {'message': 'Simulation not initialized'}, room=sid)
        return
    
    logger.info(f"Starting simulation (requested by {sid})")
    await simulation_engine.start()
    await sio.emit('simulation_started', {}, room=sid)


@sio.event
async def pause_simulation(sid):
    """Pause the simulation."""
    global simulation_engine
    
    if not simulation_engine:
        await sio.emit('error', {'message': 'Simulation not initialized'}, room=sid)
        return
    
    logger.info(f"Pausing simulation (requested by {sid})")
    await simulation_engine.stop()
    await sio.emit('simulation_paused', {}, room=sid)


@sio.event
async def set_speed(sid, data):
    """Set simulation speed."""
    global simulation_engine
    
    if not simulation_engine:
        await sio.emit('error', {'message': 'Simulation not initialized'}, room=sid)
        return
    
    speed = data.get('speed', 1.0)
    logger.info(f"Setting simulation speed to {speed} (requested by {sid})")
    simulation_engine.set_simulation_speed(speed)
    await sio.emit('speed_updated', {'speed': speed})


@sio.event
async def spawn_agent(sid, data):
    """Spawn a new agent."""
    global simulation_engine
    
    if not simulation_engine:
        await sio.emit('error', {'message': 'Simulation not initialized'}, room=sid)
        return
    
    position_data = data.get('position')
    position = None
    if position_data:
        position = (position_data.get('x', 512), position_data.get('y', 512))
    
    logger.info(f"Spawning agent at {position} (requested by {sid})")
    agent = simulation_engine.spawn_agent(position=position)
    await sio.emit('agent_spawned', {'agent': agent.to_dict()})


@sio.event
async def spawn_multiple_agents(sid, data):
    """Spawn multiple agents."""
    global simulation_engine
    
    if not simulation_engine:
        await sio.emit('error', {'message': 'Simulation not initialized'}, room=sid)
        return
    
    count = data.get('count', 10)
    logger.info(f"Spawning {count} agents (requested by {sid})")
    simulation_engine.spawn_multiple_agents(count=count)
    
    await sio.emit('agents_spawned', {
        'count': count,
        'total_agents': len(simulation_engine.agents)
    })


@sio.event
async def get_state(sid):
    """Get complete simulation state."""
    global simulation_engine
    
    if not simulation_engine:
        await sio.emit('error', {'message': 'Simulation not initialized'}, room=sid)
        return
    
    state = simulation_engine.get_simulation_state()
    agents = simulation_engine.get_agents_state()
    
    await sio.emit('state_update', {
        'simulation': state,
        'agents': agents
    }, room=sid)


# This is the ASGI app that uvicorn should run
# In docker-compose, we use: uvicorn main:socket_app
# But for compatibility, we'll export both
__all__ = ['app', 'socket_app']
