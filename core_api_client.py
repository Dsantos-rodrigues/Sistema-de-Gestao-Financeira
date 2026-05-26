"""
Cliente de integração com a Core API (NestJS).
Responsável por buscar dados de usuários e transações da API principal.
"""
import httpx
import os
import json
import logging
from app.core.redis_client import cache_get, cache_set

logger = logging.getLogger(__name__)

CORE_API_URL = os.getenv("CORE_API_URL", "http://core-api:3000")
CORE_API_KEY = os.getenv("CORE_API_KEY", "")

HEADERS = {
    "x-api-key": CORE_API_KEY,
    "Content-Type": "application/json",
}

TIMEOUT = httpx.Timeout(10.0, connect=5.0)


async def buscar_historico_usuario(usuario_id: str) -> dict | None:
    """
    Busca o histórico de transações de um usuário na Core API.
    Usa Redis como cache com TTL de 10 minutos para reduzir chamadas.
    """
    cache_key = f"historico:{usuario_id}"

    # Tenta cache primeiro
    cached = await cache_get(cache_key)
    if cached:
        logger.info(f"Cache hit para histórico do usuário {usuario_id}")
        return json.loads(cached)

    # Busca na Core API
    try:
        async with httpx.AsyncClient(headers=HEADERS, timeout=TIMEOUT) as client:
            response = await client.get(f"{CORE_API_URL}/api/users/{usuario_id}/transactions")
            response.raise_for_status()
            data = response.json()

            # Salva no cache por 10 minutos
            await cache_set(cache_key, json.dumps(data), ttl=600)
            logger.info(f"Histórico do usuário {usuario_id} cacheado com sucesso.")
            return data

    except httpx.HTTPStatusError as e:
        logger.error(f"Erro HTTP ao buscar histórico: {e.response.status_code} - {e.response.text}")
        return None
    except httpx.RequestError as e:
        logger.error(f"Erro de conexão com Core API: {e}")
        return None


async def buscar_perfil_usuario(usuario_id: str) -> dict | None:
    """
    Busca o perfil financeiro do usuário (renda, patrimônio, perfil de risco).
    """
    cache_key = f"perfil:{usuario_id}"

    cached = await cache_get(cache_key)
    if cached:
        return json.loads(cached)

    try:
        async with httpx.AsyncClient(headers=HEADERS, timeout=TIMEOUT) as client:
            response = await client.get(f"{CORE_API_URL}/api/users/{usuario_id}/profile")
            response.raise_for_status()
            data = response.json()
            await cache_set(cache_key, json.dumps(data), ttl=300)
            return data

    except Exception as e:
        logger.error(f"Erro ao buscar perfil do usuário {usuario_id}: {e}")
        return None


async def notificar_recomendacao(usuario_id: str, payload: dict) -> bool:
    """
    Envia a recomendação gerada de volta para a Core API salvar no banco.
    """
    try:
        async with httpx.AsyncClient(headers=HEADERS, timeout=TIMEOUT) as client:
            response = await client.post(
                f"{CORE_API_URL}/api/users/{usuario_id}/recommendations",
                json=payload,
            )
            response.raise_for_status()
            logger.info(f"Recomendação enviada para Core API - usuário {usuario_id}")
            return True
    except Exception as e:
        logger.error(f"Erro ao notificar Core API: {e}")
        return False
