"""Skill / technology normalization.

Builds a reverse index (variant -> canonical) from the taxonomy once, then
exposes helpers to canonicalise individual terms or whole collections.
"""
from __future__ import annotations

from functools import lru_cache

from app.normalization.taxonomy import CANONICAL_SKILLS, SOFT_SKILLS


@lru_cache
def _variant_index() -> dict[str, str]:
    """Map every lower-cased surface form (canonical + variants) -> canonical."""
    index: dict[str, str] = {}
    for canonical, variants in CANONICAL_SKILLS.items():
        index[canonical.lower()] = canonical
        for variant in variants:
            index[variant.lower()] = canonical
    return index


def normalize_term(term: str) -> str | None:
    """Return the canonical form of a single term, or None if unknown."""
    if not term:
        return None
    return _variant_index().get(term.strip().lower())


def normalize_skills(terms: list[str]) -> list[str]:
    """Canonicalise a list of terms, dropping unknowns and de-duplicating.

    Order is preserved by first appearance for stable, readable output.
    """
    seen: dict[str, None] = {}
    for term in terms:
        canonical = normalize_term(term)
        if canonical is not None and canonical not in seen:
            seen[canonical] = None
    return list(seen.keys())


def is_soft_skill(canonical: str) -> bool:
    return canonical in SOFT_SKILLS


def all_known_surface_forms() -> dict[str, str]:
    """Expose the full variant->canonical index (used by the parser)."""
    return dict(_variant_index())
