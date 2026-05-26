"""
Serviço de análise de gastos e detecção de padrões de desperdício.
Analisa o histórico de transações e identifica comportamentos financeiros.
"""
from collections import defaultdict
from typing import List, Dict
from app.models.schemas import Transacao, PadraoDetectado, AnaliseGastosResponse
import logging

logger = logging.getLogger(__name__)

# Limites recomendados por categoria (% da renda)
LIMITES_SAUDAVEIS: Dict[str, float] = {
    "alimentacao": 0.30,
    "moradia": 0.30,
    "transporte": 0.15,
    "lazer": 0.10,
    "saude": 0.10,
    "educacao": 0.10,
    "outros": 0.10,
}


def detectar_padroes(
    transacoes: List[Transacao],
    renda_mensal: float = None,
) -> List[PadraoDetectado]:
    """
    Agrupa gastos por categoria e detecta padrões de desperdício.
    Se renda_mensal for informada, calcula o percentual sobre a renda.
    """
    gastos_por_categoria: Dict[str, float] = defaultdict(float)

    for t in transacoes:
        gastos_por_categoria[t.categoria.value] += t.valor

    padroes = []
    for categoria, total in gastos_por_categoria.items():
        percentual_renda = None
        alerta = False
        mensagem = ""

        if renda_mensal and renda_mensal > 0:
            percentual_renda = round((total / renda_mensal) * 100, 2)
            limite = LIMITES_SAUDAVEIS.get(categoria, 0.10) * 100

            if percentual_renda > limite:
                alerta = True
                mensagem = (
                    f"⚠️ Gastos com {categoria} representam {percentual_renda:.1f}% da sua renda. "
                    f"O recomendado é até {limite:.0f}%."
                )
            else:
                mensagem = f"✅ Gastos com {categoria} estão dentro do recomendado ({percentual_renda:.1f}%)."
        else:
            mensagem = f"Total gasto em {categoria}: R$ {total:.2f}"

        padroes.append(
            PadraoDetectado(
                categoria=categoria,
                total_gasto=round(total, 2),
                percentual_renda=percentual_renda,
                alerta=alerta,
                mensagem=mensagem,
            )
        )

    # Ordena: alertas primeiro, depois por valor gasto
    padroes.sort(key=lambda p: (-p.alerta, -p.total_gasto))
    return padroes


def calcular_score_financeiro(padroes: List[PadraoDetectado]) -> float:
    """
    Calcula um score financeiro de 0 a 100 com base nos alertas detectados.
    Penaliza cada categoria com alerta proporcionalmente ao excesso.
    """
    if not padroes:
        return 50.0

    total = len(padroes)
    alertas = sum(1 for p in padroes if p.alerta)
    score = max(0, 100 - (alertas / total) * 60)

    # Penalidade extra por excesso severo (mais de 2x o limite)
    for p in padroes:
        if p.percentual_renda and p.alerta:
            limite = LIMITES_SAUDAVEIS.get(p.categoria, 0.10) * 100
            if p.percentual_renda > limite * 2:
                score -= 10

    return round(max(0, min(100, score)), 1)


def analisar_gastos(
    usuario_id: str,
    transacoes: List[Transacao],
    renda_mensal: float = None,
) -> AnaliseGastosResponse:
    """Pipeline completo de análise de gastos."""
    logger.info(f"Analisando {len(transacoes)} transações do usuário {usuario_id}")

    total = sum(t.valor for t in transacoes)
    padroes = detectar_padroes(transacoes, renda_mensal)
    score = calcular_score_financeiro(padroes)

    alertas_count = sum(1 for p in padroes if p.alerta)
    if score >= 80:
        resumo = "🟢 Suas finanças estão em ótimo estado! Continue assim."
    elif score >= 60:
        resumo = f"🟡 Atenção: {alertas_count} categoria(s) precisam de ajuste."
    else:
        resumo = f"🔴 Suas finanças precisam de atenção urgente. {alertas_count} alertas identificados."

    return AnaliseGastosResponse(
        usuario_id=usuario_id,
        total_analisado=round(total, 2),
        padroes=padroes,
        score_financeiro=score,
        resumo=resumo,
    )
