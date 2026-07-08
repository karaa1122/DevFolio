FROM python:3.12-slim

WORKDIR /srv

# Install deps first for layer caching
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Run as non-root
RUN useradd --system --uid 1001 ats
USER ats

ENV ATS_USE_TRANSFORMER_EMBEDDINGS=false
EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=5s --retries=5 \
  CMD python -c "import urllib.request;urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
