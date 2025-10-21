"""FastAPI application entry point for Civilization Simulation."""
import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from config import settings

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
    logger.info("Starting Civilizationx backend...")

    # Import here to avoid circular imports
    from src.database.connection import init_db

    # Initialize database
    await init_db()
    logger.info("Database initialized")

    logger.info("Civilizationx backend started successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down Civilizationx backend...")

    # Stop simulation if running
    simulation_state["is_running"] = False

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
    return {
        "is_running": simulation_state["is_running"],
        "simulation_speed": simulation_state["simulation_speed"],
        "tick_count": simulation_state["tick_count"],
        "simulation_time": simulation_state["simulation_time"],
    }


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
    logger.info(f"Starting simulation (requested by {sid})")
    simulation_state["is_running"] = True
    await sio.emit('simulation_started', {}, room=sid)


@sio.event
async def pause_simulation(sid):
    """Pause the simulation."""
    logger.info(f"Pausing simulation (requested by {sid})")
    simulation_state["is_running"] = False
    await sio.emit('simulation_paused', {}, room=sid)


@sio.event
async def set_speed(sid, data):
    """Set simulation speed."""
    speed = data.get('speed', 1.0)
    logger.info(f"Setting simulation speed to {speed} (requested by {sid})")
    simulation_state["simulation_speed"] = speed
    await sio.emit('speed_updated', {'speed': speed})


@sio.event
async def spawn_agent(sid, data):
    """Spawn a new agent."""
    position = data.get('position', {'x': 512, 'y': 512})
    logger.info(f"Spawning agent at {position} (requested by {sid})")
    # TODO: Implement agent spawning
    await sio.emit('agent_spawned', {'position': position}, room=sid)


# This is the ASGI app that uvicorn should run
# In docker-compose, we use: uvicorn main:socket_app
# But for compatibility, we'll export both
__all__ = ['app', 'socket_app']
