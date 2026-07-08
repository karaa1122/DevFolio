"""Stateless matching endpoints — the whole public surface of this service."""
from __future__ import annotations

from fastapi import APIRouter

from app.matching.scorer import score_match
from app.parsers.jd_parser import parse_job_description
from app.parsers.resume_parser import parse_resume
from app.schemas import (
    MatchRequest,
    MatchResponse,
    RankedCandidate,
    RankRequest,
    RankResponse,
    default_recommendation,
)

router = APIRouter(prefix="/match", tags=["matching"])


@router.post("", response_model=MatchResponse)
async def match_one(payload: MatchRequest) -> MatchResponse:
    jd_doc, required, preferred = parse_job_description(payload.job_description)
    resume_doc = parse_resume(payload.resume)
    r = score_match(jd_doc, resume_doc, required, preferred)
    return MatchResponse(
        score=r.score,
        matched_skills=r.matched_skills,
        missing_skills=r.missing_skills,
        experience_gap=r.experience_gap,
        keyword_coverage=r.keyword_coverage,
        semantic_similarity=r.semantic_similarity,
        summary=r.summary,
        recommendation=r.recommendation,
    )


@router.post("/rank", response_model=RankResponse)
async def rank_many(payload: RankRequest) -> RankResponse:
    jd_doc, required, preferred = parse_job_description(payload.job_description)
    scored: list[tuple[int, object]] = []
    for idx, resume_text in enumerate(payload.resumes):
        resume_doc = parse_resume(resume_text)
        scored.append((idx, score_match(jd_doc, resume_doc, required, preferred)))

    scored.sort(key=lambda t: t[1].score, reverse=True)
    ranked = [
        RankedCandidate(
            index=idx,
            score=r.score,
            matched_skills=r.matched_skills,
            missing_skills=r.missing_skills,
            recommendation=default_recommendation(r.score).value,
        )
        for idx, r in scored
    ]
    return RankResponse(job_description_skills=required, ranked=ranked)
