// patrimonio.service.ts — calcula o patrimônio consolidado do usuário
// Agrega saldos de carteiras, valor atual de ativos e resumo de transações

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// meses abreviados em português para formatar o label do gráfico
const PT_MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

@Injectable()
export class PatrimonioService {
  constructor(private readonly prisma: PrismaService) {}

  async getPatrimonio(userId: string) {
    // busca carteiras, ativos e transações do usuário em paralelo para melhor performance
    const [wallets, assets, transactions] = await Promise.all([
      this.prisma.wallet.findMany({
        where: { userId },
        // inclui as transações de cada carteira para calcular o saldo dinamicamente
        include: { transactions: { select: { amount: true, type: true } } },
      }),
      this.prisma.asset.findMany({ where: { userId } }),
      this.prisma.transaction.findMany({ where: { userId } }),
    ]);

    // saldo de cada carteira = soma das entradas − soma das saídas vinculadas a ela
    // depois soma os saldos de todas as carteiras para obter o total
    const totalCarteiras = wallets.reduce((total, carteira) => {
      const saldoCarteira = carteira.transactions.reduce((soma, t) => {
        return soma + (t.type === 'INCOME' ? Number(t.amount) : -Number(t.amount));
      }, 0);
      return total + saldoCarteira;
    }, 0);

    // soma o valor atual de cada ativo (quantidade × preço atual)
    const totalAtivos = assets.reduce(
      (soma, ativo) => soma + Number(ativo.quantity) * Number(ativo.currentPrice),
      0,
    );

    // soma o custo total de compra dos ativos (quantidade × preço de compra)
    const custoAtivos = assets.reduce(
      (soma, ativo) => soma + Number(ativo.quantity) * Number(ativo.purchasePrice),
      0,
    );

    // soma todas as entradas (salário, freelance, etc.)
    const totalEntradas = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((soma, t) => soma + Number(t.amount), 0);

    // soma todas as saídas (contas, compras, etc.)
    const totalSaidas = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((soma, t) => soma + Number(t.amount), 0);

    return {
      // patrimônio total = saldo em carteiras + valor atual dos ativos
      patrimonioTotal: totalCarteiras + totalAtivos,

      // detalhamento por categoria
      carteiras: {
        total: totalCarteiras, // soma dos saldos calculados de todas as carteiras
        quantidade: wallets.length, // número de carteiras cadastradas
      },

      ativos: {
        valorAtual: totalAtivos, // valor de mercado atual
        custoCompra: custoAtivos, // quanto foi investido
        lucroprejuizo: totalAtivos - custoAtivos, // resultado: positivo = lucro, negativo = prejuízo
        quantidade: assets.length, // número de ativos cadastrados
      },

      transacoes: {
        totalEntradas, // soma de todas as receitas
        totalSaidas, // soma de todas as despesas
        saldo: totalEntradas - totalSaidas, // saldo líquido das transações
        quantidade: transactions.length, // total de transações registradas
      },
    };
  }

  // retorna a evolução mensal do patrimônio agrupando transações e ativos por mês
  // aplicado = soma das receitas (INCOME) do mês
  // ganho = lucro dos ativos comprados naquele mês (currentPrice - purchasePrice) × qty
  // assetType opcional filtra apenas ativos do tipo informado (ex: 'STOCK', 'CRYPTO')
  async getEvolucao(userId: string, assetType?: string) {
    const [transactions, assets] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: 'asc' },
        select: { amount: true, type: true, date: true },
      }),
      this.prisma.asset.findMany({
        // filtra por tipo quando informado; caso contrário retorna todos os ativos
        where: { userId, ...(assetType ? { type: assetType as any } : {}) },
        select: { quantity: true, purchasePrice: true, currentPrice: true, purchasedAt: true },
      }),
    ]);

    // acumula aplicado e ganho por chave "AAAA-MM"
    const monthMap = new Map<string, { aplicado: number; ganho: number }>();

    // agrupa receitas por mês para representar os aportes
    for (const t of transactions) {
      const key = new Date(t.date).toISOString().slice(0, 7);
      if (!monthMap.has(key)) monthMap.set(key, { aplicado: 0, ganho: 0 });
      if (t.type === 'INCOME') {
        monthMap.get(key)!.aplicado += Number(t.amount);
      }
    }

    // agrupa o lucro realizado de cada ativo no mês em que foi comprado
    for (const asset of assets) {
      const key = new Date(asset.purchasedAt).toISOString().slice(0, 7);
      if (!monthMap.has(key)) monthMap.set(key, { aplicado: 0, ganho: 0 });
      const profit =
        (Number(asset.currentPrice) - Number(asset.purchasePrice)) * Number(asset.quantity);
      // só adiciona ganho positivo; prejuízo não altera a barra de ganho
      if (profit > 0) monthMap.get(key)!.ganho += profit;
    }

    // ordena cronologicamente e formata o label em português
    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, data]) => {
        const [year, month] = key.split('-').map(Number);
        return {
          month: `${PT_MONTHS[month - 1]} ${String(year).slice(2)}`,
          aplicado: Math.round(data.aplicado * 100) / 100,
          ganho: Math.round(data.ganho * 100) / 100,
        };
      });
  }

  // calcula score financeiro, componentes e projeção patrimonial de 5 anos (60 pontos mensais)
  async getRelatorio(userId: string) {
    const [assets, transactions] = await Promise.all([
      this.prisma.asset.findMany({ where: { userId } }),
      this.prisma.transaction.findMany({ where: { userId }, orderBy: { date: 'asc' } }),
    ]);

    const N = (v: unknown) => Number(v);
    const totalValue = assets.reduce((s, a) => s + N(a.quantity) * N(a.currentPrice), 0);
    const totalCost  = assets.reduce((s, a) => s + N(a.quantity) * N(a.purchasePrice), 0);
    const incomes    = transactions.filter((t) => t.type === 'INCOME');
    const expenses   = transactions.filter((t) => t.type === 'EXPENSE');
    const totalIncome  = incomes.reduce((s, t) => s + N(t.amount), 0);
    const totalExpense = expenses.reduce((s, t) => s + N(t.amount), 0);

    // --- score por dimensão (cada uma de 0-100) ---

    // diversificação: quantas classes de ativos diferentes
    const classCount = new Set(assets.map((a) => a.type)).size;
    const divScore = Math.min(classCount * 20, 100); // 5 classes = 100

    // rentabilidade vs CDI acumulado (~14%)
    const returnRate = totalCost > 0 ? (totalValue - totalCost) / totalCost : 0;
    const cdiRef = 0.1426;
    const rentScore = cdiRef > 0 ? Math.round(Math.min((returnRate / cdiRef) * 100, 100)) : (returnRate > 0 ? 100 : 0);

    // fluxo de caixa: taxa de poupança (50% = 100 pts)
    const savingsRate = totalIncome > 0 ? (totalIncome - totalExpense) / totalIncome : 0;
    const fluxScore = Math.round(Math.max(0, Math.min(savingsRate * 200, 100)));

    // tamanho do patrimônio (escala log; R$500k = 100)
    const patriScore = totalValue > 0
      ? Math.round(Math.min((Math.log10(totalValue) / Math.log10(500000)) * 100, 100))
      : 0;

    // score geral ponderado
    const score = Math.round(divScore * 0.25 + rentScore * 0.35 + fluxScore * 0.25 + patriScore * 0.15);
    const scoreLabel =
      score >= 81 ? 'Excelente' : score >= 61 ? 'Bom' : score >= 41 ? 'Regular' : 'Crítico';

    // --- projeção patrimonial (5 anos = 60 meses) ---

    // aporte mensal = média das receitas dos últimos 6 meses
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentIncome = incomes
      .filter((t) => new Date(t.date) >= sixMonthsAgo)
      .reduce((s, t) => s + N(t.amount), 0);
    const aporteMensal = Math.round(recentIncome / 6);

    // taxa mensal para cada cenário (anualizada)
    const rates = { conservador: 0.10 / 12, base: 0.135 / 12, otimista: 0.20 / 12 };

    const buildProjection = (monthlyRate: number): number[] => {
      const pts = [totalValue];
      for (let m = 1; m <= 60; m++) {
        pts.push(pts[m - 1] * (1 + monthlyRate) + aporteMensal);
      }
      return pts;
    };

    return {
      score,
      scoreLabel,
      scoreComponents: [
        { label: 'Diversificação',  score: divScore,   hint: `${classCount} classe(s) de ativos` },
        { label: 'Rentabilidade',   score: rentScore,  hint: `Retorno vs CDI (${(cdiRef * 100).toFixed(1)}% ref)` },
        { label: 'Fluxo de caixa', score: fluxScore,  hint: `Taxa de poupança ${(savingsRate * 100).toFixed(0)}%` },
        { label: 'Patrimônio',      score: patriScore, hint: `Ref. R$ 500k` },
      ],
      projecao: {
        aporteMensal,
        monthly: {
          conservador: buildProjection(rates.conservador),
          base:        buildProjection(rates.base),
          otimista:    buildProjection(rates.otimista),
        },
      },
    };
  }

  // calcula histórico de performance dos últimos 12 meses comparando com CDI e Ibovespa
  // usa interpolação linear para estimar o valor do portfólio em cada mês passado
  async getPerformance(userId: string) {
    const assets = await this.prisma.asset.findMany({
      where: { userId },
      select: { quantity: true, purchasePrice: true, currentPrice: true, purchasedAt: true },
    });

    // monta timeline dos últimos 12 meses
    const now = new Date();
    const monthKeys: string[] = [];
    const months: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthKeys.push(d.toISOString().slice(0, 7));
      months.push(`${PT_MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`);
    }

    // retorno acumulado do portfólio para cada mês via interpolação linear do preço atual
    // ex: ativo comprado há 6 meses com 20% de retorno total → contribui ~3,3% ao mês
    const portfolioCumulative = monthKeys.map((key, idx) => {
      let totalCost = 0;
      let totalValue = 0;
      for (const asset of assets) {
        const assetKey = new Date(asset.purchasedAt).toISOString().slice(0, 7);
        if (assetKey > key) continue; // ativo ainda não havia sido comprado neste mês
        const qty = Number(asset.quantity);
        const pPrice = Number(asset.purchasePrice);
        const cPrice = Number(asset.currentPrice);
        const assetStartIdx = monthKeys.indexOf(assetKey);
        const startIdx = assetStartIdx >= 0 ? assetStartIdx : 0;
        const totalMonths = monthKeys.length - startIdx;
        const monthsHeld = idx - startIdx + 1;
        const progress = totalMonths <= 1 ? 1 : monthsHeld / totalMonths;
        totalCost += qty * pPrice;
        totalValue += qty * (pPrice + (cPrice - pPrice) * progress);
      }
      return totalCost === 0 ? 0 : (totalValue - totalCost) / totalCost;
    });

    // retornos mês a mês (para heatmap e métricas)
    const monthlyReturns = portfolioCumulative.map((ret, i) => {
      if (i === 0) return ret;
      const prev = portfolioCumulative[i - 1];
      return prev === -1 ? 0 : (1 + ret) / (1 + prev) - 1;
    });

    // busca CDI histórico mensal do Banco Central (série 4391)
    const cdiRates = await this.fetchCdiMonthly(12).catch(() => null);
    const fallbackCdi = monthKeys.map(() => 0.00836); // fallback ~10,5% ao ano
    const cdiCumulative = this.buildCumulative(cdiRates ?? fallbackCdi);

    // busca Ibovespa histórico mensal via BRAPI
    const ibovRates = await this.fetchIbovMonthly().catch(() => null);
    const ibovCumulative = ibovRates ? this.buildCumulative(ibovRates) : [];

    // métricas de resumo
    const ytd = portfolioCumulative.at(-1) ?? null;
    const bestMonth = monthlyReturns.length > 0 ? Math.max(...monthlyReturns) : null;
    const worstMonth = monthlyReturns.length > 0 ? Math.min(...monthlyReturns) : null;
    const mean = monthlyReturns.reduce((a, b) => a + b, 0) / (monthlyReturns.length || 1);
    const variance = monthlyReturns.reduce((a, r) => a + Math.pow(r - mean, 2), 0) / (monthlyReturns.length || 1);
    const stdDev = Math.sqrt(variance);
    const cdiMonthlyMean = (cdiRates ?? fallbackCdi).reduce((a, b) => a + b, 0) / 12;
    const sharpe = stdDev === 0 ? null : Math.round(((mean - cdiMonthlyMean) / stdDev) * Math.sqrt(12) * 100) / 100;

    return {
      ytd,
      bestMonth,
      worstMonth,
      sharpe,
      months,
      portfolio: portfolioCumulative,
      cdi: cdiCumulative,
      ibov: ibovCumulative,
      monthlyReturns,
    };
  }

  // acumula taxas mensais em retorno composto: [(1+r1)(1+r2)... - 1]
  private buildCumulative(monthlyRates: number[]): number[] {
    const result: number[] = [];
    let acc = 0;
    for (const rate of monthlyRates) {
      acc = (1 + acc) * (1 + rate) - 1;
      result.push(acc);
    }
    return result;
  }

  // busca CDI acumulado mensal da API do Banco Central do Brasil (SGS série 4391)
  private async fetchCdiMonthly(n: number): Promise<number[]> {
    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.4391/dados/ultimos/${n}?formato=json`;
    const data = await this.fetchJsonSimple<Array<{ data: string; valor: string }>>(url);
    return data.map((item) => Number(item.valor) / 100);
  }

  // busca histórico mensal do Ibovespa
  // fonte 1: Yahoo Finance (sem token, confiável)
  // fonte 2: BRAPI com token (se BRAPI_TOKEN estiver configurado)
  private async fetchIbovMonthly(): Promise<number[]> {
    // Yahoo Finance — gratuito, sem autenticação, suporte a ^BVSP nativo
    try {
      const result = await this.fetchIbovYahoo();
      if (result.length > 0) return result;
    } catch { /* tenta próxima fonte */ }

    // BRAPI — requer token; tenta ^BVSP e depois BOVA11 como proxy
    const token = process.env.BRAPI_API_KEY ?? process.env.BRAPI_TOKEN;
    if (token) {
      const symbols = ['%5EBVSP', 'BOVA11'];
      for (const sym of symbols) {
        try {
          const url = `https://brapi.dev/api/quote/${sym}?range=1y&interval=1mo&token=${token}`;
          type H = { close?: number; adjustedClose?: number };
          const data = await this.fetchJsonSimple<{ results?: Array<{ historicalDataPrice?: H[] }> }>(url);
          const prices = (data.results?.[0]?.historicalDataPrice ?? [])
            .map((h) => h.adjustedClose ?? h.close ?? 0)
            .filter((p) => p > 0);
          if (prices.length < 2) continue;
          const returns: number[] = [];
          for (let i = 1; i < prices.length; i++) returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
          if (returns.length > 0) return returns.slice(-12);
        } catch { /* próximo */ }
      }
    }

    return [];
  }

  // fetch do Ibovespa mensal diretamente do Yahoo Finance (v8 chart API)
  private async fetchIbovYahoo(): Promise<number[]> {
    const url = 'https://query1.finance.yahoo.com/v8/finance/chart/%5EBVSP?range=1y&interval=1mo';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          // Yahoo Finance exige User-Agent para não retornar 401
          'User-Agent': 'Mozilla/5.0 (compatible; FinFlow/1.0)',
        },
      });
      if (!res.ok) throw new Error(`Yahoo HTTP ${res.status}`);

      type YahooChart = {
        chart: {
          result?: Array<{
            indicators: {
              quote: Array<{ close: (number | null)[] }>;
            };
          }>;
        };
      };
      const data = (await res.json()) as YahooChart;
      const closes = data.chart.result?.[0]?.indicators?.quote?.[0]?.close ?? [];
      const prices = closes.filter((p): p is number => p !== null && p > 0);

      if (prices.length < 2) return [];

      const returns: number[] = [];
      for (let i = 1; i < prices.length; i++) returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
      return returns.slice(-12);
    } finally {
      clearTimeout(timeout);
    }
  }

  // helper de fetch com timeout de 7s
  private async fetchJsonSimple<T>(url: string): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    try {
      const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as T;
    } finally {
      clearTimeout(timeout);
    }
  }
}
