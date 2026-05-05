# Dockerfile do backend NestJS
# Usado pelo docker-compose para montar a imagem do serviço backend

# Usa Node.js 20 com Alpine Linux (imagem leve, ~50MB vs ~900MB do ubuntu)
FROM node:20-alpine

# Define /app como diretório de trabalho dentro do container
WORKDIR /app

# Copia só os arquivos de dependências primeiro
# Isso aproveita o cache do Docker: se package.json não mudar, não reinstala tudo
COPY package*.json ./
COPY prisma ./prisma/

# Instala as dependências com versões exatas do package-lock.json (mais seguro que npm install)
RUN npm ci

# Gera o Prisma Client dentro do container (necessário antes de rodar o servidor)
RUN npx prisma generate

# Copia o restante do código para dentro do container
COPY . .

# Informa ao Docker que o container usa a porta 3000 (documentação, não abre a porta sozinho)
EXPOSE 3000

# Script de entrada:
# 1. Roda as migrations automaticamente (cria/atualiza as tabelas no banco)
# 2. Sobe o servidor NestJS em modo dev com hot reload
# O "&&" garante que o servidor só sobe se as migrations rodarem com sucesso
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:dev"]
