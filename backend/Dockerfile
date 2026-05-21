# Dockerfile do backend NestJS — produção
# Multi-stage: stage 1 compila o TypeScript, stage 2 roda só o dist

# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Instala o OpenSSL necessário para o Prisma no Alpine Linux
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npm run build

# ── Stage 2: produção ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

# Instala o OpenSSL também no ambiente de execução final
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Instala só as dependências de produção
RUN npm ci --omit=dev

# Gera o Prisma Client
RUN npx prisma generate

# Copia o código compilado do stage anterior
COPY --from=builder /app/dist ./dist

# Cloud Run / Railway injetam a variável PORT automaticamente
EXPOSE 8080

# Roda migrations e sobe o servidor de produção (com fallback de caminho)
CMD ["sh", "-c", "npx prisma migrate deploy && (node dist/main || node dist/src/main)"]