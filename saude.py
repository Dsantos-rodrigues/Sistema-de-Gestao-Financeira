from fastapi import APIRouter
from app.core.redis_client import get_redis_client
import os

router = APIRouter()


@router.get("/", summary="Health check completo")
async def health_check():
    redis_ok = False
    try:
        r = await get_redis_client()
        if r:
            await r.ping()
            redis_ok = True
    except Exception:
        pass

    return {
        "status": "healthy" if redis_ok else "degraded",
        "servico": "motor-ia",
        "versao": "1.0.0",
        "ambiente": os.getenv("APP_ENV", "development"),
        "dependencias": {
            "redis": "ok" if redis_ok else "indisponível",
            "core_api": os.getenv("CORE_API_URL", "não configurado"),
        },
    }
