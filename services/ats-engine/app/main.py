"""FastAPI entrypoint — the trimmed, stateless matching engine.

Run locally:
    uvicorn app.main:app --reload --port 8000

This service is intentionally tiny: no database, no auth, no queues. It parses
a job description and a resume, scores the match, and returns the breakdown.
DevFolio's API is the only intended caller; keep it off the public internet.
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import get_settings
from app.matching.embeddings import get_embedding_engine
from app.router import router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ats")

API_PREFIX = "/api/v1"


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    logger.info("Starting %s v%s", settings.app_name, settings.version)
    # Warm the embedding backend so the first request isn't slow.
    get_embedding_engine()
    yield
    logger.info("Shutting down")


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        version=settings.version,
        description="Stateless resume ↔ job-description matching engine.",
        lifespan=lifespan,
    )
    app.include_router(router, prefix=API_PREFIX)

    @app.get("/health", tags=["meta"])
    async def health() -> dict:
        return {"status": "ok", "embedding_backend": get_embedding_engine().backend}

    return app


app = create_app()
