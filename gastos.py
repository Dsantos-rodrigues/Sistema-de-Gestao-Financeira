from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import HistoricoGastosRequest, AnaliseGastosResponse
from app.services.analise_service import analisar_gastos
from app.services.core_api_client import buscar_historico_usuario
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/analisar", response_model=AnaliseGastosResponse, summary="Analisar gastos via payload")
async def analisar_gastos_endpoint(
    body: HistoricoGastosRequest,
    renda_mensal: float = Query(None, description="Renda mensal para calcular percentuais"),
):
    """
    Recebe histórico de transações e retorna análise completa de padrões de gastos.
    Detecta desperdícios e calcula score financeiro de 0 a 100.
    """
    if not body.transacoes:
        raise HTTPException(status_code=400, detail="Nenhuma transação fornecida para análise.")

    return analisar_gastos(body.usuario_id, body.transacoes, renda_mensal)


@router.get("/analisar/{usuario_id}", response_model=AnaliseGastosResponse, summary="Analisar gastos via Core API")
async def analisar_gastos_por_usuario(
    usuario_id: str,
    renda_mensal: float = Query(None, description="Renda mensal para calcular percentuais"),
):
    """
    Busca o histórico do usuário direto na Core API e retorna a análise.
    Usa cache Redis para evitar chamadas repetidas.
    """
    data = await buscar_historico_usuario(usuario_id)
    if not data:
        raise HTTPException(status_code=503, detail="Não foi possível buscar dados da Core API.")

    transacoes = data.get("transacoes", [])
    if not transacoes:
        raise HTTPException(status_code=404, detail="Nenhuma transação encontrada para este usuário.")

    from app.models.schemas import Transacao
    transacoes_obj = [Transacao(**t) for t in transacoes]

    return analisar_gastos(usuario_id, transacoes_obj, renda_mensal)
