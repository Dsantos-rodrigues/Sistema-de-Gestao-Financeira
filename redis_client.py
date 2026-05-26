import redis.asyncio as aioredis
import os
import logging

logger = logging.getLogger(__name__)

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)  # Gerenciado pelo Secret Manager no GCP

_redis_client = None


async def get_redis_client() -> aioredis.Redis:
    """
    Retorna instância singleton do cliente Redis.
    Em produção, REDIS_HOST aponta para o Memorystore (GCP).
    """
    global _redis_client
    if _redis_client is None:
        try:
            _redis_client = await aioredis.from_url(
                f"redis://{REDIS_HOST}:{REDIS_PORT}",
                password=REDIS_PASSWORD,
                encoding="utf-8",
                decode_responses=True,
            )
            logger.info(f"Redis conectado em {REDIS_HOST}:{REDIS_PORT}")
        except Exception as e:
            logger.error(f"Erro ao conectar Redis: {e}")
            return None
    return _redis_client


async def cache_set(key: str, value: str, ttl: int = 300):
    """Salva valor no cache com TTL em segundos (padrão: 5 min)."""
    r = await get_redis_client()
    if r:
        await r.setex(key, ttl, value)


async def cache_get(key: str) -> str | None:
    """Busca valor no cache. Retorna None se não encontrado."""
    r = await get_redis_client()
    if r:
        return await r.get(key)
    return None


async def cache_delete(key: str):
    """Remove chave do cache."""
    r = await get_redis_client()
    if r:
        await r.delete(key)
