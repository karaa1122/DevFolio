# ATS Matching Engine (trimmed)

The pure resume ↔ job-description matching engine that powers DevFolio's
**ATS Match** feature. Extracted from the standalone ATS-Engine project with
the multi-tenant SaaS layer (DB, auth, Celery, email) removed — what remains
is stateless: parse → normalize → score.

## API

- `POST /api/v1/match` — `{ resume, job_description }` → score 0-100,
  matched/missing skills, keyword coverage, experience gap, semantic
  similarity, recommendation (`shortlist | review | reject`)
- `POST /api/v1/match/rank` — one JD against many resumes
- `GET /health`

## Run

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
pytest              # smoke tests
```

Semantic scoring uses TF-IDF cosine by default. For transformer embeddings,
uncomment `sentence-transformers` in requirements.txt (adds ~2 GB) and set
`ATS_USE_TRANSFORMER_EMBEDDINGS=true`.

This service holds no data and does no auth — only the DevFolio API should be
able to reach it (compose keeps it on the internal network).
