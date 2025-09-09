# Multi-stage Dockerfile for Grocery Management System Backend
FROM python:3.12-slim as base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    libpq-dev \
    libffi-dev \
    libssl-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Install Python dependencies
COPY pyproject.toml ./
RUN pip install --upgrade pip && \
    pip install uv && \
    uv pip install --system -e .

# Development stage
FROM base as development

# Install development dependencies
RUN uv pip install --system -e ".[dev]"

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /app/memgpt_data /app/chroma_db /app/logs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["python", "multi_agent_server.py"]

# Production stage
FROM base as production

# Install production dependencies only
RUN uv pip install --system -e .

# Copy application code
COPY . .

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# Create necessary directories
RUN mkdir -p /app/memgpt_data /app/chroma_db /app/logs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["python", "multi_agent_server.py"]
