from fastapi import APIRouter, HTTPException
from app.models.schemas import RecomendacaoRequest, RecomendacaoResponse
from app.services.recomendacao_service import gerar_recomendacao
from app.services.core_api_client import buscar_perfil_usuario, notificar_recomendacao
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/gerar", response_model=RecomendacaoResponse, summary="Gerar recomendação financeira")
async def gerar_recomendacao_endpoint(body: RecomendacaoRequest):
    """
    Gera uma recomendação de alocação de investimentos personalizada.
    Combina perfil de risco, renda, patrimônio e histórico de gastos.
    """
    try:
        recomendacao = gerar_recomendacao(body)

        # Notifica a Core API para salvar a recomendação no banco
        await notificar_recomendacao(body.usuario_id, recomendacao.dict())

        return recomendacao
    except Exception as e:
        logger.error(f"Erro ao gerar recomendação: {e}")
        raise HTTPException(status_code=500, detail="Erro interno ao gerar recomendação.")


@router.get("/{usuario_id}", response_model=RecomendacaoResponse, summary="Gerar recomendação pelo perfil na Core API")
async def recomendacao_por_usuario(usuario_id: str):
    """
    Busca o perfil do usuário na Core API e gera a recomendação automaticamente.
    """
    perfil = await buscar_perfil_usuario(usuario_id)
    if not perfil:
        raise HTTPException(status_code=503, detail="Não foi possível buscar perfil do usuário.")

    try:
        from app.models.schemas import PerfilRisco
        req = RecomendacaoRequest(
            usuario_id=usuario_id,
            renda_mensal=perfil.get("renda_mensal", 0),
            patrimonio_atual=perfil.get("patrimonio", 0),
            perfil_risco=PerfilRisco(perfil.get("perfil_risco", "conservador")),
        )
        return gerar_recomendacao(req)
    except Exception as e:
        logger.error(f"Erro ao processar perfil do usuário {usuario_id}: {e}")
        raise HTTPException(status_code=422, detail=str(e))
