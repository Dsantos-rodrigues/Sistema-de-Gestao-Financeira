#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# setup-gcp.sh — Configuração inicial da infraestrutura GCP
# Execute UMA VEZ para provisionar os serviços necessários.
# Bianca: rode este script após criar o projeto no GCP Console.
# ─────────────────────────────────────────────────────────────────────────────

set -e

# ── CONFIGURAÇÕES (edite aqui) ───────────────────────────────────────────────
PROJECT_ID="fintech-projeto"          # Substitua pelo ID real do projeto GCP
REGION="us-central1"
REPO_NAME="fintech-repo"
MEMORYSTORE_INSTANCE="fintech-redis"
GITHUB_SA_NAME="github-actions-sa"
# ────────────────────────────────────────────────────────────────────────────

echo "🔧 Configurando projeto: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# ── 1. HABILITAR APIs necessárias ───────────────────────────────────────────
echo "📡 Habilitando APIs do GCP..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  redis.googleapis.com \
  sqladmin.googleapis.com \
  iam.googleapis.com

# ── 2. ARTIFACT REGISTRY ─────────────────────────────────────────────────────
echo "📦 Criando Artifact Registry: $REPO_NAME..."
gcloud artifacts repositories create $REPO_NAME \
  --repository-format=docker \
  --location=$REGION \
  --description="Imagens Docker do projeto Fintech" \
  --quiet || echo "Repositório já existe, pulando."

# ── 3. MEMORYSTORE (Redis) ────────────────────────────────────────────────────
echo "🔴 Criando instância Redis no Memorystore..."
gcloud redis instances create $MEMORYSTORE_INSTANCE \
  --size=1 \
  --region=$REGION \
  --redis-version=redis_7_0 \
  --tier=basic \
  --quiet || echo "Instância Redis já existe, pulando."

REDIS_HOST=$(gcloud redis instances describe $MEMORYSTORE_INSTANCE \
  --region=$REGION \
  --format="value(host)")
echo "✅ Redis IP: $REDIS_HOST"

# ── 4. SECRET MANAGER — criar segredos ───────────────────────────────────────
echo "🔐 Configurando Secret Manager..."

create_secret() {
  local SECRET_NAME=$1
  local SECRET_VALUE=$2
  echo "$SECRET_VALUE" | gcloud secrets create $SECRET_NAME \
    --data-file=- \
    --replication-policy=automatic \
    --quiet 2>/dev/null \
    || echo "$SECRET_VALUE" | gcloud secrets versions add $SECRET_NAME --data-file=- --quiet
  echo "  ✓ Segredo '$SECRET_NAME' configurado."
}

# Substitua os valores pelos reais antes de rodar em produção
create_secret "core-api-key"      "SUBSTITUA_PELA_CHAVE_REAL"
create_secret "redis-password"    ""  # Memorystore sem senha por padrão em VPC interna
create_secret "database-url"      "postgresql://user:pass@CLOUD_SQL_IP:5432/fintech"

# ── 5. SERVICE ACCOUNT para GitHub Actions ───────────────────────────────────
echo "👤 Criando Service Account para GitHub Actions..."
gcloud iam service-accounts create $GITHUB_SA_NAME \
  --display-name="GitHub Actions — Deploy Motor IA" \
  --quiet || echo "SA já existe, pulando."

SA_EMAIL="$GITHUB_SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"

# Permissões mínimas necessárias
for ROLE in \
  "roles/run.admin" \
  "roles/artifactregistry.writer" \
  "roles/iam.serviceAccountUser" \
  "roles/secretmanager.secretAccessor"; do
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="$ROLE" \
    --quiet
done

echo ""
echo "✅ Infraestrutura configurada!"
echo ""
echo "📋 Próximos passos:"
echo "  1. Gere a chave JSON da SA e adicione como secret GCP_SA_KEY no GitHub:"
echo "     gcloud iam service-accounts keys create key.json --iam-account=$SA_EMAIL"
echo ""
echo "  2. Adicione os seguintes secrets no GitHub Actions:"
echo "     GCP_PROJECT_ID   = $PROJECT_ID"
echo "     GCP_SA_KEY       = (conteúdo do key.json)"
echo "     MEMORYSTORE_HOST = $REDIS_HOST"
echo "     CORE_API_URL     = https://core-api-HASH-uc.a.run.app"
echo ""
echo "  3. Faça push para a branch main para acionar o primeiro deploy!"
