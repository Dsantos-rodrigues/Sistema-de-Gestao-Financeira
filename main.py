from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import gastos, recomendacao, saude
from app.core.redis_client import get_redis_client
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Motor de IA - Fintech",
    description="Microsserviço de análise financeira e recomendações inteligentes",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restringir em produção via env
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(gastos.router, prefix="/api/v1/gastos", tags=["Análise de Gastos"])
app.include_router(recomendacao.router, prefix="/api/v1/recomendacao", tags=["Recomendações"])
app.include_router(saude.router, prefix="/api/v1/saude", tags=["Saúde"])


@app.on_event("startup")
async def startup_event():
    logger.info("Motor de IA iniciado.")
    redis = await get_redis_client()
    if redis:
        await redis.ping()
        logger.info("Conexão com Redis OK.")


@app.get("/")
async def root():
    return {"status": "Motor de IA online", "versao": "1.0.0"}
