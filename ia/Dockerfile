# Dockerfile do serviço de IA em FastAPI (Python)
# Usado pelo docker-compose para montar a imagem do serviço ia

# Usa Python 3.11 slim (versão enxuta sem ferramentas desnecessárias)
FROM python:3.11-slim

# Define /app como diretório de trabalho dentro do container
WORKDIR /app

# Copia só o arquivo de dependências primeiro
# Isso aproveita o cache do Docker: se requirements.txt não mudar, não reinstala tudo
COPY requirements.txt ./

# Instala as dependências Python sem salvar cache local (reduz tamanho da imagem)
RUN pip install --no-cache-dir -r requirements.txt

# Copia o restante do código Python para dentro do container
COPY . .

# Informa ao Docker que o container usa a porta 8000
EXPOSE 8000

# Comando executado quando o container sobe
# --host 0.0.0.0: aceita conexões de fora do container (obrigatório no Docker)
# --port 8000: porta que o servidor escuta
# --reload: reinicia automaticamente ao salvar qualquer arquivo .py
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
