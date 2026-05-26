# ─── Stage 1: Builder ───────────────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /app

# Instala dependências de build
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install --no-cache-dir --prefix=/install -r requirements.txt

# ─── Stage 2: Runtime ───────────────────────────────────────────────────────
FROM python:3.12-slim AS runtime

# Usuário não-root por segurança
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Copia dependências instaladas
COPY --from=builder /install /usr/local

# Copia apenas o código da aplicação
COPY app/ ./app/

# Garante que os arquivos pertencem ao usuário correto
RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 8080

# Cloud Run usa PORT env var; fallback para 8080
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080} --workers 2"]
