"""Configuration and tunable scoring weights.

Centralised here so the matching policy can be changed without touching the
engine code. Weights are validated to sum to 1.0 at startup.
"""
from __future__ import annotations

from functools import lru_cache

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class ScoringWeights(BaseSettings):
    """Relative contribution of each signal to the final 0-100 score."""

    model_config = SettingsConfigDict(env_prefix="ATS_WEIGHT_")

    skills: float = 0.40
    experience: float = 0.20
    keywords: float = 0.20
    semantic: float = 0.20

    @model_validator(mode="after")
    def _check_sum(self) -> "ScoringWeights":
        total = self.skills + self.experience + self.keywords + self.semantic
        if abs(total - 1.0) > 1e-6:
            raise ValueError(f"Scoring weights must sum to 1.0, got {total}")
        return self


class Settings(BaseSettings):
    """App settings, overridable via environment variables (ATS_*)."""

    model_config = SettingsConfigDict(env_prefix="ATS_", env_file=".env", extra="ignore")

    app_name: str = "ATS Matching Engine"
    version: str = "1.0.0"

    # Embedding backend. If sentence-transformers + the model are unavailable,
    # the engine transparently falls back to TF-IDF cosine similarity.
    embedding_model: str = "all-MiniLM-L6-v2"
    use_transformer_embeddings: bool = True

    # Simple in-memory cache for repeated job descriptions / resumes.
    cache_enabled: bool = True
    cache_max_size: int = 256

    weights: ScoringWeights = Field(default_factory=ScoringWeights)


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton (FastAPI dependency-friendly)."""
    return Settings()
