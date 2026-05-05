// dashboard/page.tsx — página de patrimônio consolidado

'use client'

import { useEffect, useState } from 'react'
import { api } from '../lib/api'

// tipo que representa o retorno do endpoint /api/patrimonio
type Patrimonio = {
  patrimonioTotal: number
  carteiras:   { total: number; quantidade: number }
  ativos:      { valorAtual: number; custoCompra: number; lucroprejuizo: number; quantidade: number }
  transacoes:  { totalEntradas: number; totalSaidas: number; saldo: number; quantidade: number }
}

// componente de card de resumo
function Card({ titulo, valor, sub, cor }: { titulo: string; valor: string; sub?: string; cor?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <p className="text-sm text-gray-500 mb-1">{titulo}</p>
      <p className={`text-2xl font-bold ${cor ?? 'text-gray-800'}`}>{valor}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

// formata número como moeda brasileira
function brl(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function DashboardPage() {
  const [dados, setDados]     = useState<Patrimonio | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro]       = useState('')

  useEffect(() => {
    // busca os dados de patrimônio ao entrar na página
    api.get<Patrimonio>('/patrimonio')
      .then(setDados)
      .catch((err: Error) => setErro(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-gray-400">Carregando...</p>
  if (erro)    return <p className="text-red-500">{erro}</p>
  if (!dados)  return null

  const lucro = dados.ativos.lucroprejuizo
  const corLucro = lucro >= 0 ? 'text-green-600' : 'text-red-500'

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Patrimônio consolidado</h2>

      {/* card principal com o total */}
      <div className="bg-blue-600 text-white rounded-2xl p-6 mb-6">
        <p className="text-sm opacity-80 mb-1">Patrimônio total</p>
        <p className="text-4xl font-bold">{brl(dados.patrimonioTotal)}</p>
        <p className="text-sm opacity-70 mt-2">
          Carteiras + Ativos
        </p>
      </div>

      {/* grid de cards */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card
          titulo="Saldo em carteiras"
          valor={brl(dados.carteiras.total)}
          sub={`${dados.carteiras.quantidade} carteira(s)`}
        />
        <Card
          titulo="Valor em ativos"
          valor={brl(dados.ativos.valorAtual)}
          sub={`${dados.ativos.quantidade} ativo(s)`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card
          titulo="Total de entradas"
          valor={brl(dados.transacoes.totalEntradas)}
          sub={`${dados.transacoes.quantidade} transação(ões)`}
          cor="text-green-600"
        />
        <Card
          titulo="Total de saídas"
          valor={brl(dados.transacoes.totalSaidas)}
          cor="text-red-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card
          titulo="Saldo das transações"
          valor={brl(dados.transacoes.saldo)}
          cor={dados.transacoes.saldo >= 0 ? 'text-green-600' : 'text-red-500'}
        />
        <Card
          titulo="Lucro/Prejuízo nos ativos"
          valor={brl(lucro)}
          sub={`Custo: ${brl(dados.ativos.custoCompra)}`}
          cor={corLucro}
        />
      </div>
    </div>
  )
}
