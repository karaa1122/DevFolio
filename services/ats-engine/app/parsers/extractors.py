"""Shared extraction primitives used by both resume and JD parsers.

These operate on raw text and return *normalized* structured data so the
matching engine never has to worry about surface variation.
"""
from __future__ import annotations

import re
from collections import Counter

from app.normalization.normalizer import all_known_surface_forms, is_soft_skill
from app.normalization.taxonomy import SENIORITY_LEVELS
from app.utils.text import content_tokens, extract_years_of_experience


def extract_skills(text: str) -> tuple[list[str], list[str]]:
    """Find known skills in free text.

    Returns (hard_skills, soft_skills) as canonical, de-duplicated lists.
    Multi-word variants (e.g. "natural language processing") are matched first
    so they aren't missed by single-token scanning.
    """
    lowered = text.lower()
    index = all_known_surface_forms()

    found: dict[str, None] = {}
    for surface, canonical in index.items():
        # whole-token / phrase boundary match; escape regex-special chars (c++, c#)
        pattern = r"(?<![A-Za-z0-9])" + re.escape(surface) + r"(?![A-Za-z0-9])"
        if re.search(pattern, lowered):
            found.setdefault(canonical, None)

    hard = [s for s in found if not is_soft_skill(s)]
    soft = [s for s in found if is_soft_skill(s)]
    return hard, soft


def extract_seniority(text: str) -> tuple[str | None, int]:
    """Detect the highest seniority level mentioned. Returns (label, rank)."""
    lowered = text.lower()
    best_label: str | None = None
    best_rank = -1
    for label, rank in SENIORITY_LEVELS.items():
        if re.search(rf"(?<![A-Za-z]){re.escape(label)}(?![A-Za-z])", lowered):
            if rank > best_rank:
                best_rank, best_label = rank, label
    return best_label, max(best_rank, 0)


def extract_roles(text: str) -> list[str]:
    """Heuristically pull job-title-like phrases (engineer/developer/etc.)."""
    role_kw = r"(engineer|developer|scientist|analyst|manager|architect|designer|administrator|lead|consultant)"
    roles: dict[str, None] = {}
    for m in re.finditer(rf"([A-Z][A-Za-z.+#]*\s+){{0,3}}{role_kw}", text, re.IGNORECASE):
        roles.setdefault(" ".join(m.group(0).split()).title(), None)
    return list(roles.keys())


def extract_keywords(text: str, top_n: int = 30) -> list[str]:
    """Top content keywords by frequency (after stopword removal)."""
    counts = Counter(content_tokens(text))
    return [word for word, _ in counts.most_common(top_n)]


def extract_experience_years(text: str) -> int:
    return extract_years_of_experience(text)
