"""The matching/scoring engine.

Combines four weighted signals into a final 0-100 score:

    40%  Skill overlap   (required JD skills present in resume)
    20%  Experience      (years gap + role seniority alignment)
    20%  Keyword coverage(JD keywords found in resume)
    20%  Semantic        (embedding cosine similarity of full texts)

All sub-scores are normalised to [0, 1] then combined with the configured
weights. The engine returns a rich result object the service layer maps to the
strict API schema.
"""
from __future__ import annotations

from dataclasses import dataclass, field

from app.config import ScoringWeights, get_settings
from app.matching.embeddings import get_embedding_engine
from app.parsers.base import ParsedDocument
from app.utils.text import content_tokens


@dataclass
class MatchResult:
    score: float
    matched_skills: list[str] = field(default_factory=list)
    missing_skills: list[str] = field(default_factory=list)
    extra_skills: list[str] = field(default_factory=list)
    experience_gap: str = ""
    keyword_coverage: list[str] = field(default_factory=list)
    missing_keywords: list[str] = field(default_factory=list)
    semantic_similarity: float = 0.0
    sub_scores: dict[str, float] = field(default_factory=dict)
    summary: str = ""
    recommendation: str = ""


def _skill_overlap(required: list[str], resume_skills: list[str]) -> tuple[float, list[str], list[str]]:
    """Fraction of required skills present in the resume."""
    resume_set = set(resume_skills)
    matched = [s for s in required if s in resume_set]
    missing = [s for s in required if s not in resume_set]
    if not required:
        return 1.0, matched, missing  # no explicit requirements -> no penalty
    return len(matched) / len(required), matched, missing


def _experience_score(jd: ParsedDocument, resume: ParsedDocument) -> tuple[float, str]:
    """Blend a years component and a seniority component."""
    required_years = jd.years_experience
    candidate_years = resume.years_experience

    if required_years <= 0:
        years_score = 1.0
        years_msg = "No explicit experience requirement."
    elif candidate_years >= required_years:
        years_score = 1.0
        years_msg = f"Meets the {required_years}+ year requirement ({candidate_years} yrs)."
    else:
        years_score = candidate_years / required_years
        gap = required_years - candidate_years
        years_msg = (
            f"{candidate_years} yrs vs {required_years} required "
            f"— short by ~{gap} year(s)."
        )

    # Seniority alignment: candidate at or above JD level -> full credit.
    if jd.seniority_rank <= 0:
        seniority_score = 1.0
    elif resume.seniority_rank >= jd.seniority_rank:
        seniority_score = 1.0
    else:
        seniority_score = max(0.0, resume.seniority_rank / jd.seniority_rank)

    if jd.seniority_label and resume.seniority_label:
        sen_msg = f" Role level: candidate '{resume.seniority_label}' vs JD '{jd.seniority_label}'."
    elif jd.seniority_label:
        sen_msg = f" JD targets '{jd.seniority_label}' level; resume level unclear."
    else:
        sen_msg = ""

    score = 0.6 * years_score + 0.4 * seniority_score
    return score, (years_msg + sen_msg).strip()


def _keyword_coverage(jd: ParsedDocument, resume: ParsedDocument) -> tuple[float, list[str], list[str]]:
    """Fraction of the JD's salient keywords present anywhere in the resume.

    Compares against the resume's FULL vocabulary, not its own top-N keyword
    list — otherwise a term that appears in the resume body but isn't among its
    most-frequent tokens is wrongly counted as missing, deflating coverage
    (badly so for long, detailed resumes).
    """
    resume_vocab = set(content_tokens(resume.raw_text))
    jd_kw = jd.keywords
    if not jd_kw:
        return 1.0, [], []
    covered = [k for k in jd_kw if k in resume_vocab]
    missing = [k for k in jd_kw if k not in resume_vocab]
    return len(covered) / len(jd_kw), covered, missing


def score_match(
    jd_doc: ParsedDocument,
    resume_doc: ParsedDocument,
    required_skills: list[str],
    preferred_skills: list[str],
    weights: ScoringWeights | None = None,
) -> MatchResult:
    # Per-tenant weights override the global default when supplied. They are
    # validated (must sum to 1.0) at construction time, so the engine can trust
    # them unconditionally here.
    w = weights or get_settings().weights

    # --- 1. Skills (required first; fall back to all JD skills if none flagged)
    effective_required = required_skills or jd_doc.all_skills
    skill_score, matched, missing = _skill_overlap(effective_required, resume_doc.all_skills)
    extra = [s for s in resume_doc.all_skills if s not in set(effective_required)]

    # --- 2. Experience
    exp_score, exp_gap = _experience_score(jd_doc, resume_doc)

    # --- 3. Keywords
    kw_score, covered, missing_kw = _keyword_coverage(jd_doc, resume_doc)

    # --- 4. Semantic similarity
    semantic = get_embedding_engine().similarity(jd_doc.raw_text, resume_doc.raw_text)

    final = (
        w.skills * skill_score
        + w.experience * exp_score
        + w.keywords * kw_score
        + w.semantic * semantic
    )
    final_100 = round(final * 100, 1)

    result = MatchResult(
        score=final_100,
        matched_skills=matched,
        missing_skills=missing,
        extra_skills=extra,
        experience_gap=exp_gap,
        keyword_coverage=covered,
        missing_keywords=missing_kw,
        semantic_similarity=semantic,
        sub_scores={
            "skills": round(skill_score, 4),
            "experience": round(exp_score, 4),
            "keywords": round(kw_score, 4),
            "semantic": round(semantic, 4),
        },
    )
    result.summary = _build_summary(result, preferred_skills)
    result.recommendation = _build_recommendation(final_100, result)
    return result


def _build_summary(r: MatchResult, preferred_skills: list[str]) -> str:
    parts = [
        f"Overall match {r.score}/100.",
        f"Skills {int(r.sub_scores['skills'] * 100)}%,",
        f"experience {int(r.sub_scores['experience'] * 100)}%,",
        f"keyword coverage {int(r.sub_scores['keywords'] * 100)}%,",
        f"semantic similarity {int(r.sub_scores['semantic'] * 100)}%.",
    ]
    if r.matched_skills:
        parts.append("Strong on: " + ", ".join(r.matched_skills[:6]) + ".")
    if r.missing_skills:
        parts.append("Gaps: " + ", ".join(r.missing_skills[:6]) + ".")
    nice = [s for s in preferred_skills if s in set(r.matched_skills)]
    if nice:
        parts.append("Has nice-to-haves: " + ", ".join(nice) + ".")
    return " ".join(parts)


def _build_recommendation(score: float, r: MatchResult) -> str:
    if score >= 80:
        verdict = "Strong match — advance to interview."
    elif score >= 65:
        verdict = "Good match — recommend phone screen."
    elif score >= 50:
        verdict = "Partial match — consider if pipeline is thin."
    else:
        verdict = "Weak match — likely not a fit for this role."

    if r.missing_skills:
        verdict += f" Probe these gaps: {', '.join(r.missing_skills[:4])}."
    return verdict
