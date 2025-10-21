"""Configuration management for Civilization Simulation."""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str

    # Redis
    redis_url: str = "redis://redis:6379"

    # LLM APIs
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None

    # Simulation Configuration
    simulation_speed: float = 1.0
    max_agents: int = 100
    world_size: int = 1024
    discovery_rate_multiplier: float = 1.0

    # Memory System Configuration
    memory_recency_weight: float = 1.0
    memory_importance_weight: float = 1.0
    memory_relevance_weight: float = 1.0
    memory_decay_rate: float = 0.99

    # LLM Configuration
    llm_primary_provider: str = "anthropic"  # or "openai"
    llm_secondary_provider: str = "openai"
    llm_fallback_provider: str = "openai"
    llm_temperature_default: float = 0.7
    llm_max_tokens_default: int = 500

    # Performance
    max_memories_retrieved: int = 20
    reflection_trigger_count: int = 100
    reflection_trigger_hours: int = 24

    # WebSocket
    websocket_ping_interval: int = 25
    websocket_ping_timeout: int = 60

    # Logging
    log_level: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
