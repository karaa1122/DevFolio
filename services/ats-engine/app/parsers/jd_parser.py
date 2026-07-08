"""Job Description parser.

Same primitives as the resume parser, but additionally tries to separate
*required* skills from *nice-to-have* skills by looking at section cues, since
that distinction drives the skill-overlap score.
"""
from __future__ import annotations

import re

from app.parsers import extractors
from app.parsers.base import ParsedDocument
from app.utils.text import clean

_NICE_TO_HAVE_CUE = re.compile(
    r"(nice[\s-]?to[\s-]?have|preferred|bonus|plus|optional|good to have|a plus)",
    re.IGNORECASE,
)


def _split_required_optional(text: str) -> tuple[str, str]:
    """Split JD text at the first 'nice-to-have' style cue.

    Everything before the cue is treated as required context; everything after
    as preferred. If no cue exists, the whole text is required.
    """
    m = _NICE_TO_HAVE_CUE.search(text)
    if not m:
        return text, ""
    return text[: m.start()], text[m.start():]


def parse_job_description(text: str) -> tuple[ParsedDocument, list[str], list[str]]:
    """Parse a JD.

    Returns (document, required_skills, preferred_skills) where the skill lists
    are canonical hard+soft skills.
    """
    text = clean(text)
    required_text, preferred_text = _split_required_optional(text)

    req_hard, req_soft = extractors.extract_skills(required_text)
    required = req_hard + req_soft

    preferred: list[str] = []
    if preferred_text:
        pref_hard, pref_soft = extractors.extract_skills(preferred_text)
        # preferred = appears in the preferred section but not already required
        preferred = [s for s in (pref_hard + pref_soft) if s not in required]

    label, rank = extractors.extract_seniority(text)
    all_hard, all_soft = extractors.extract_skills(text)

    doc = ParsedDocument(
        raw_text=text,
        hard_skills=all_hard,
        soft_skills=all_soft,
        technologies=all_hard,
        keywords=extractors.extract_keywords(text),
        roles=extractors.extract_roles(text),
        years_experience=extractors.extract_experience_years(text),
        seniority_label=label,
        seniority_rank=rank,
    )
    return doc, required, preferred
