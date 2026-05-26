from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date
from enum import Enum


class CategoriaGasto(str, Enum):
    ALIMENTACAO = "alimentacao"
    TRANSPORTE = "transporte"
    LAZER = "lazer"
    SAUDE = "saude"
    EDUCACAO = "educacao"
    MORADIA = "moradia"
    OUTROS = "outros"


class Transacao(BaseModel):
    id: str
    data: date
    descricao: str
    valor: float = Field(..., gt=0)
    categoria: CategoriaGasto


class HistoricoGastosRequest(BaseModel):
    usuario_id: str
    transacoes: List[Transacao]


class PadraoDetectado(BaseModel):
    categoria: str
    total_gasto: float
    percentual_renda: Optional[float] = None
    alerta: bool
    mensagem: str


class AnaliseGastosResponse(BaseModel):
    usuario_id: str
    total_analisado: float
    padroes: List[PadraoDetectado]
    score_financeiro: float = Field(..., ge=0, le=100)
    resumo: str


class PerfilRisco(str, Enum):
    CONSERVADOR = "conservador"
    MODERADO = "moderado"
    ARROJADO = "arrojado"


class RecomendacaoRequest(BaseModel):
    usuario_id: str
    renda_mensal: float
    patrimonio_atual: float
    perfil_risco: PerfilRisco
    historico_gastos: Optional[List[Transacao]] = []


class AlocacaoRecomendada(BaseModel):
    tipo: str
    percentual: float
    exemplos: List[str]
    justificativa: str


class RecomendacaoResponse(BaseModel):
    usuario_id: str
    perfil_risco: str
    capacidade_investimento_mensal: float
    alocacao_recomendada: List[AlocacaoRecomendada]
    dica_principal: str
