"""
Sistema de recomendação financeira.
Sugere alocação ideal de investimentos com base no perfil de risco do usuário.
Baseado no documento de arquitetura: integração Bianca + Anderson → Motor IA.
"""
from typing import List
from app.models.schemas import (
    RecomendacaoRequest,
    RecomendacaoResponse,
    AlocacaoRecomendada,
    PerfilRisco,
)
from app.services.analise_service import analisar_gastos
import logging

logger = logging.getLogger(__name__)

# Estratégias de alocação por perfil de risco
ESTRATEGIAS = {
    PerfilRisco.CONSERVADOR: {
        "dica": "Priorize segurança e liquidez. Construa uma reserva de emergência antes de investir.",
        "alocacao": [
            {
                "tipo": "Renda Fixa - Tesouro Selic",
                "percentual": 50.0,
                "exemplos": ["Tesouro Selic 2027", "CDB pós-fixado"],
                "justificativa": "Alta liquidez e segurança para emergências.",
            },
            {
                "tipo": "Renda Fixa - CDB/LCI/LCA",
                "percentual": 35.0,
                "exemplos": ["CDB 110% CDI", "LCI isenta de IR"],
                "justificativa": "Rentabilidade superior à poupança com baixo risco.",
            },
            {
                "tipo": "Fundos Multimercado Conservadores",
                "percentual": 15.0,
                "exemplos": ["Fundo DI", "Fundo de Curto Prazo"],
                "justificativa": "Diversificação com volatilidade controlada.",
            },
        ],
    },
    PerfilRisco.MODERADO: {
        "dica": "Equilibre segurança e crescimento. Mantenha reserva de emergência e diversifique.",
        "alocacao": [
            {
                "tipo": "Renda Fixa",
                "percentual": 50.0,
                "exemplos": ["Tesouro IPCA+", "CDB", "Debêntures"],
                "justificativa": "Base sólida do portfólio com proteção à inflação.",
            },
            {
                "tipo": "Renda Variável - Ações Brasileiras",
                "percentual": 25.0,
                "exemplos": ["IVVB11 (S&P 500)", "BOVA11 (Ibovespa)"],
                "justificativa": "Potencial de crescimento no longo prazo.",
            },
            {
                "tipo": "FIIs - Fundos Imobiliários",
                "percentual": 15.0,
                "exemplos": ["HGLG11", "VISC11", "KNRI11"],
                "justificativa": "Renda passiva mensal com isenção de IR para PF.",
            },
            {
                "tipo": "Internacional / BDRs",
                "percentual": 10.0,
                "exemplos": ["AAPL34", "MSFT34", "GOGL34"],
                "justificativa": "Diversificação geográfica e proteção cambial.",
            },
        ],
    },
    PerfilRisco.ARROJADO: {
        "dica": "Foco em crescimento de longo prazo. Aceite volatilidade em troca de maior retorno potencial.",
        "alocacao": [
            {
                "tipo": "Renda Variável - Ações",
                "percentual": 50.0,
                "exemplos": ["Small Caps", "Ações de crescimento", "ETFs setoriais"],
                "justificativa": "Alto potencial de valorização no longo prazo.",
            },
            {
                "tipo": "Internacional",
                "percentual": 20.0,
                "exemplos": ["ETFs americanos (QQQ)", "BDRs de tech", "Fundos globais"],
                "justificativa": "Exposição a mercados mais desenvolvidos.",
            },
            {
                "tipo": "FIIs e Renda Variável Alternativa",
                "percentual": 15.0,
                "exemplos": ["FIIs de Desenvolvimento", "CRIs/CRAs"],
                "justificativa": "Diversificação com potencial de renda.",
            },
            {
                "tipo": "Renda Fixa (Liquidez)",
                "percentual": 10.0,
                "exemplos": ["Tesouro Selic (reserva)"],
                "justificativa": "Reserva para aproveitar oportunidades.",
            },
            {
                "tipo": "Criptoativos",
                "percentual": 5.0,
                "exemplos": ["Bitcoin (BTC)", "Ethereum (ETH)"],
                "justificativa": "Alta volatilidade com potencial de retorno expressivo.",
            },
        ],
    },
}


def gerar_recomendacao(req: RecomendacaoRequest) -> RecomendacaoResponse:
    """
    Gera recomendação de alocação personalizada.
    Considera o perfil de risco e histórico de gastos para calcular
    a capacidade real de investimento mensal.
    """
    logger.info(f"Gerando recomendação para usuário {req.usuario_id} - Perfil: {req.perfil_risco}")

    # Calcula capacidade de investimento com base nos gastos reais
    capacidade = req.renda_mensal * 0.20  # padrão: 20% da renda

    if req.historico_gastos:
        analise = analisar_gastos(req.usuario_id, req.historico_gastos, req.renda_mensal)
        sobra = req.renda_mensal - analise.total_analisado
        if sobra > 0:
            capacidade = round(sobra * 0.80, 2)  # 80% da sobra real → investe
        else:
            capacidade = 0.0

    estrategia = ESTRATEGIAS[req.perfil_risco]
    alocacao = [AlocacaoRecomendada(**a) for a in estrategia["alocacao"]]

    return RecomendacaoResponse(
        usuario_id=req.usuario_id,
        perfil_risco=req.perfil_risco.value,
        capacidade_investimento_mensal=round(capacidade, 2),
        alocacao_recomendada=alocacao,
        dica_principal=estrategia["dica"],
    )
