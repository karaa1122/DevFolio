"""Pydantic request / response models and the score→recommendation banding."""
from __future__ import annotations

import enum

from pydantic import BaseModel, Field


class Recommendation(str, enum.Enum):
    SHORTLIST = "shortlist"
    REVIEW = "review"
    REJECT = "reject"


def default_recommendation(score: float) -> Recommendation:
    """Default score banding: >=80 shortlist, <50 reject, otherwise review."""
    if score >= 80:
        return Recommendation.SHORTLIST
    if score < 50:
        return Recommendation.REJECT
    return Recommendation.REVIEW


class MatchRequest(BaseModel):
    resume: str = Field(..., min_length=1, description="Resume as plain text")
    job_description: str = Field(..., min_length=1, description="Job description as plain text")

    model_config = {
        "json_schema_extra": {
            "example": {
                "resume": "Senior Python engineer with 6 years building FastAPI microservices...",
                "job_description": "We need a senior backend engineer skilled in FastAPI, PostgreSQL, Docker...",
            }
        }
    }


class MatchResponse(BaseModel):
    """Strict output contract."""

    score: float = Field(..., ge=0, le=100, description="Final match score 0-100")
    matched_skills: list[str] = []
    missing_skills: list[str] = []
    experience_gap: str = ""
    keyword_coverage: list[str] = []
    semantic_similarity: float = Field(0.0, ge=0.0, le=1.0)
    summary: str = ""
    recommendation: str = ""


class RankRequest(BaseModel):
    job_description: str = Field(..., min_length=1)
    resumes: list[str] = Field(..., min_length=1, description="List of resume texts")


class RankedCandidate(BaseModel):
    index: int
    score: float
    matched_skills: list[str] = []
    missing_skills: list[str] = []
    recommendation: str = ""


class RankResponse(BaseModel):
    job_description_skills: list[str] = []
    ranked: list[RankedCandidate] = []
