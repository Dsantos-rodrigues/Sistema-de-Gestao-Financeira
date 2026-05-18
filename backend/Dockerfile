# Dockerfile do backend NestJS
FROM node:20-alpine

# Define /app como diretório de trabalho dentro do container
WORKDIR /app

# Instala as dependências nativas necessárias pelo Prisma no Alpine
# libc6-compat ajuda com compatibilidade de binários, e openssl é o que falta
RUN apk add --no-cache libc6-compat openssl

# Copia só os arquivos de dependências primeiro
COPY package*.json ./
COPY prisma ./prisma/

# Instala as dependências com versões exatas
RUN npm ci

# Gera o Prisma Client dentro do container
RUN npx prisma generate

# Copia o restante do código para dentro do container
COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:dev"]