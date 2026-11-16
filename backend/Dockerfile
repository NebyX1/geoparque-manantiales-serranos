FROM python:3.12-slim AS models
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
WORKDIR /app
COPY backend/requirements-lock.txt backend/requirements-lock.txt
RUN pip install --no-cache-dir -r backend/requirements-lock.txt
COPY backend/app/__init__.py backend/app/model_policy.py backend/app/
COPY scripts/prepare_models.py scripts/
RUN python scripts/prepare_models.py

FROM models AS runtime
ENV FLASK_ENV=production HOST=0.0.0.0 PORT=5000
COPY backend backend
COPY scripts scripts
COPY data data
RUN python scripts/ingest.py \
    && groupadd --gid 10001 serrana \
    && useradd --uid 10001 --gid 10001 --create-home serrana \
    && mkdir -p storage logs reports \
    && chown -R serrana:serrana storage logs reports
USER 10001:10001
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=180s --retries=5 \
    CMD python -c "import os, urllib.request; urllib.request.urlopen('http://127.0.0.1:' + os.environ['PORT'] + '/api/ready', timeout=4)"
CMD ["python", "-m", "backend.app.main"]
