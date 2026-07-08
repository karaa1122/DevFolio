"""Semantic similarity backend with graceful degradation.

Primary path:   sentence-transformers (real semantic embeddings).
Fallback path:  TF-IDF + cosine similarity (scikit-learn), so the service is
                fully functional in environments without the transformer model
                or its (large) download.

The active backend is reported via `EmbeddingEngine.backend` for transparency.
"""
from __future__ import annotations

import logging

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity as sk_cosine

from app.config import get_settings

logger = logging.getLogger(__name__)


class EmbeddingEngine:
    """Lazily loads a transformer model; falls back to TF-IDF on failure."""

    def __init__(self) -> None:
        self._model = None
        self.backend = "tfidf"
        settings = get_settings()

        if settings.use_transformer_embeddings:
            try:
                from sentence_transformers import SentenceTransformer

                self._model = SentenceTransformer(settings.embedding_model)
                self.backend = f"sentence-transformers:{settings.embedding_model}"
                logger.info("Loaded transformer embeddings: %s", self.backend)
            except Exception as exc:  # noqa: BLE001 - any failure -> fallback
                logger.warning(
                    "Transformer embeddings unavailable (%s); using TF-IDF fallback.",
                    exc,
                )

    def similarity(self, text_a: str, text_b: str) -> float:
        """Cosine similarity in [0.0, 1.0] between two texts."""
        if not text_a.strip() or not text_b.strip():
            return 0.0

        if self._model is not None:
            emb = self._model.encode([text_a, text_b], normalize_embeddings=True)
            score = float(np.dot(emb[0], emb[1]))
        else:
            score = self._tfidf_similarity(text_a, text_b)

        # clamp – transformer dot products can dip slightly negative
        return round(max(0.0, min(1.0, score)), 4)

    @staticmethod
    def _tfidf_similarity(text_a: str, text_b: str) -> float:
        vec = TfidfVectorizer(stop_words="english")
        try:
            matrix = vec.fit_transform([text_a, text_b])
        except ValueError:
            # happens when both texts contain only stopwords
            return 0.0
        return float(sk_cosine(matrix[0:1], matrix[1:2])[0][0])


_engine: EmbeddingEngine | None = None


def get_embedding_engine() -> EmbeddingEngine:
    """Process-wide singleton (model load is expensive)."""
    global _engine
    if _engine is None:
        _engine = EmbeddingEngine()
    return _engine
