"""
Utilitário para acessar segredos no GCP Secret Manager.
Garante que nenhuma chave sensível fique hardcoded no código (requisito de segurança).
"""
import os
import logging

logger = logging.getLogger(__name__)


def get_secret(secret_id: str, version: str = "latest") -> str:
    """
    Busca um segredo no GCP Secret Manager.
    Em ambiente local (DEV), lê da variável de ambiente diretamente.
    """
    env = os.getenv("APP_ENV", "development")

    if env == "development":
        # Fallback para variáveis de ambiente locais durante desenvolvimento
        value = os.getenv(secret_id.upper().replace("-", "_"))
        if not value:
            logger.warning(f"Segredo '{secret_id}' não encontrado nas env vars locais.")
        return value or ""

    # Produção: usa o Secret Manager do GCP
    try:
        from google.cloud import secretmanager

        project_id = os.getenv("GCP_PROJECT_ID")
        if not project_id:
            raise ValueError("GCP_PROJECT_ID não configurado.")

        client = secretmanager.SecretManagerServiceClient()
        name = f"projects/{project_id}/secrets/{secret_id}/versions/{version}"
        response = client.access_secret_version(request={"name": name})
        payload = response.payload.data.decode("UTF-8")
        logger.info(f"Segredo '{secret_id}' carregado do Secret Manager.")
        return payload

    except ImportError:
        logger.error("google-cloud-secret-manager não instalado. Rode: pip install google-cloud-secret-manager")
        return ""
    except Exception as e:
        logger.error(f"Erro ao buscar segredo '{secret_id}': {e}")
        return ""


# Segredos usados pela aplicação
DATABASE_URL = get_secret("database-url")
CORE_API_KEY = get_secret("core-api-key")
REDIS_PASSWORD = get_secret("redis-password")
