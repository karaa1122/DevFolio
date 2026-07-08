"""Lightweight text utilities for noisy, unstructured resume / JD text.

Deliberately dependency-free (pure regex) so the parsing layer has no heavy
runtime requirements.
"""
from __future__ import annotations

import re

# Minimal English stopword set — enough to keep keyword extraction meaningful
# without pulling in NLTK/spaCy.
STOPWORDS: frozenset[str] = frozenset(
    """
    a an the and or but if then else for to of in on at by with without from into
    over under again further is are was were be been being have has had do does did
    will would shall should can could may might must this that these those i you he
    she it we they them us our your their as so than too very just not no nor only own
    same up down out off about above below between through during before after here
    there when where why how all any both each few more most other some such me my
    we're you're they're who whom which what while per via etc eg ie also able across
    """.split()
)

_WORD_RE = re.compile(r"[A-Za-z][A-Za-z0-9+.#\-]*")
_YEARS_RE = re.compile(
    r"(\d{1,2})\s*\+?\s*(?:years?|yrs?)\b", re.IGNORECASE
)


def clean(text: str) -> str:
    """Collapse whitespace; keep punctuation that matters for tech terms."""
    return re.sub(r"[ \t]+", " ", text.replace("\r", "\n")).strip()


def tokenize(text: str) -> list[str]:
    """Split text into lower-cased word tokens (keeps +, #, ., - for tech)."""
    return [m.group(0).lower() for m in _WORD_RE.finditer(text)]


def content_tokens(text: str) -> list[str]:
    """Tokens with stopwords and trivially short tokens removed."""
    return [t for t in tokenize(text) if t not in STOPWORDS and len(t) > 2]


def extract_years_of_experience(text: str) -> int:
    """Largest 'N years' figure mentioned in the text (0 if none)."""
    matches = [int(m.group(1)) for m in _YEARS_RE.finditer(text)]
    return max(matches) if matches else 0
