"""Resume parser — turns noisy resume text into a ParsedDocument."""
from __future__ import annotations

from app.parsers import extractors
from app.parsers.base import ParsedDocument
from app.utils.text import clean


def parse_resume(text: str) -> ParsedDocument:
    text = clean(text)
    hard, soft = extractors.extract_skills(text)
    label, rank = extractors.extract_seniority(text)
    return ParsedDocument(
        raw_text=text,
        hard_skills=hard,
        soft_skills=soft,
        technologies=hard,  # technologies are the hard-skill subset for resumes
        keywords=extractors.extract_keywords(text),
        roles=extractors.extract_roles(text),
        years_experience=extractors.extract_experience_years(text),
        seniority_label=label,
        seniority_rank=rank,
    )
