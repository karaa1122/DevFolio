"""Smoke tests for the stateless /match endpoint (no DB, no queues)."""
from __future__ import annotations

import os

os.environ["ATS_USE_TRANSFORMER_EMBEDDINGS"] = "false"

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402

client = TestClient(app)

JD = """Senior Backend Engineer

We need 5+ years of experience with Python, FastAPI, PostgreSQL and Docker.
Nice to have: Kubernetes, AWS.
"""

GOOD_RESUME = """Alex Doe — Senior Backend Engineer
7 years of experience designing Python microservices with FastAPI and
PostgreSQL, deployed on Docker and Kubernetes in AWS.
"""

BAD_RESUME = """Jamie Doe — Graphic Designer
3 years of experience in Photoshop, Illustrator and brand identity design.
"""


def test_match_good_resume_scores_higher_than_bad() -> None:
    good = client.post("/api/v1/match", json={"resume": GOOD_RESUME, "job_description": JD})
    bad = client.post("/api/v1/match", json={"resume": BAD_RESUME, "job_description": JD})
    assert good.status_code == bad.status_code == 200
    assert good.json()["score"] > bad.json()["score"]
    assert "python" in [s.lower() for s in good.json()["matched_skills"]]


def test_match_validates_empty_input() -> None:
    r = client.post("/api/v1/match", json={"resume": "", "job_description": JD})
    assert r.status_code == 422


def test_health() -> None:
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"
