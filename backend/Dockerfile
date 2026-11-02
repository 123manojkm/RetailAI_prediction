# Multi-stage build for FastAPI backend
FROM python:3.11-slim as base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/backend

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libpq-dev \
    openjdk-17-jre-headless \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy source code
COPY backend /app/backend
COPY ml /app/ml
COPY spark /app/spark
COPY data /app/data
COPY models /app/models

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
