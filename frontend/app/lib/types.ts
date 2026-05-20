// lib/types.ts — tipos TypeScript que espelham os responses do backend

export type PatrimonioResponse = {
  patrimonioTotal: number
  carteiras:   { total: number; quantidade: number }
  ativos:      { valorAtual: number; custoCompra: number; lucroprejuizo: number; quantidade: number }
  transacoes:  { totalEntradas: number; totalSaidas: number; saldo: number; quantidade: number }
}

export type AssetType = 'STOCK' | 'CRYPTO' | 'REAL_ESTATE' | 'FIXED_INCOME' | 'FUND' | 'OTHER'

export type AssetResponse = {
  id: string
  name: string
  ticker?: string
  type: AssetType
  quantity: string       // decimal como string vindo do backend
  purchasePrice: string
  currentPrice: string
  purchasedAt: string
  totalValue: number     // calculado pelo backend: qty × currentPrice
  totalCost: number      // calculado pelo backend: qty × purchasePrice
  profitLoss: number     // totalValue - totalCost
  priceSource?: 'market' | 'manual' | 'calculated'
  marketSymbol?: string
  marketSource?: string
  marketUpdatedAt?: string | null
  marketChangePercent?: number | null
}

export type TransactionType = 'INCOME' | 'EXPENSE'

export type TransactionResponse = {
  id: string
  description: string
  amount: string         // decimal como string
  type: TransactionType
  category?: string
  date: string           // ISO 8601
  walletId?: string
  wallet?: { name: string }
}

export type WalletType = 'CHECKING' | 'SAVINGS' | 'CASH' | 'INVESTMENT'

export type WalletResponse = {
  id: string
  name: string
  type: WalletType
  balance: number        // calculado dinamicamente pelo backend
  createdAt: string
}

export type MarketQuote = {
  symbol: string
  requestedSymbol?: string
  resolvedSymbol?: string
  name: string
  price: number
  currency: 'BRL' | 'USD' | '%'
  change?: number | null
  changePercent?: number | null
  updatedAt?: string | null
  source: string
  kind: 'currency' | 'stock' | 'crypto' | 'rate'
}

export type MarketSearchResult = {
  symbol: string
  name: string
  kind: 'stock' | 'fii' | 'etf' | 'crypto' | 'fixed_income'
  currency: 'BRL' | 'USD' | '%'
  source: string
}

export type MarketSummary = {
  currencies: MarketQuote[]
  stocks: MarketQuote[]
  crypto: MarketQuote[]
  rates: MarketQuote[]
  updatedAt: string
}

// ponto de dados para o gráfico de evolução patrimonial
export type EvolucaoPoint = {
  month: string    // label formatado, ex: "Jan 24"
  aplicado: number // soma dos aportes (INCOME) do mês
  ganho: number    // lucro dos ativos comprados naquele mês
}

// resposta do endpoint de relatórios (score + projeção)
export type RelatorioResponse = {
  score: number                        // score geral 0-100
  scoreLabel: string                   // 'Crítico' | 'Regular' | 'Bom' | 'Excelente'
  scoreComponents: Array<{
    label: string
    score: number                      // 0-100 por componente
    hint: string
  }>
  projecao: {
    aporteMensal: number               // aporte médio mensal calculado do histórico
    monthly: {                         // 61 pontos: hoje + 60 meses
      conservador: number[]
      base: number[]
      otimista: number[]
    }
  }
}

// resposta do endpoint de performance histórica
export type PerformanceResponse = {
  ytd: number | null          // retorno acumulado no período (decimal, ex: 0.12 = 12%)
  bestMonth: number | null    // melhor retorno mensal
  worstMonth: number | null   // pior retorno mensal
  sharpe: number | null       // índice de Sharpe anualizado
  months: string[]            // labels dos meses, ex: ["Jan 24", "Fev 24", ...]
  portfolio: number[]         // retorno acumulado do portfólio por mês (decimal)
  cdi: number[]               // retorno acumulado do CDI por mês (decimal)
  ibov: number[]              // retorno acumulado do Ibovespa por mês (decimal)
  monthlyReturns: number[]    // retorno mês a mês do portfólio (para heatmap)
}
