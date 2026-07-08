"""Internal parsed-document representation.

Kept as plain dataclasses (not Pydantic) because these are internal domain
objects, not API I/O — clean separation between transport and domain models.
"""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class ParsedDocument:
    raw_text: str
    hard_skills: list[str] = field(default_factory=list)
    soft_skills: list[str] = field(default_factory=list)
    technologies: list[str] = field(default_factory=list)
    keywords: list[str] = field(default_factory=list)
    roles: list[str] = field(default_factory=list)
    years_experience: int = 0
    seniority_label: str | None = None
    seniority_rank: int = 0

    @property
    def all_skills(self) -> list[str]:
        return self.hard_skills + self.soft_skills
