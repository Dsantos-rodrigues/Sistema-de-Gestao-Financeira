# Dockerfile do frontend Next.js
# Usado pelo docker-compose para montar a imagem do serviço frontend

# Usa Node.js 20 com Alpine Linux (imagem leve, ~50MB vs ~900MB do ubuntu)
FROM node:20-alpine

# Define /app como diretório de trabalho dentro do container
WORKDIR /app

# Copia só os arquivos de dependências primeiro
# Isso aproveita o cache do Docker: se package.json não mudar, não reinstala tudo
COPY package*.json ./

# Instala as dependências com versões exatas do package-lock.json (mais seguro que npm install)
RUN npm ci

# Copia o restante do código para dentro do container
COPY . .

# Informa ao Docker que o container usa a porta 3000 internamente
# No docker-compose essa porta é mapeada para 3001 no host
EXPOSE 3000

# Comando executado quando o container sobe — modo dev com hot reload
CMD ["npm", "run", "dev"]
