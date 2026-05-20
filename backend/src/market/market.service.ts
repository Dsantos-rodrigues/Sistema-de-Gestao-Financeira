import { BadRequestException, Injectable } from '@nestjs/common';

type QuoteKind = 'currency' | 'stock' | 'crypto' | 'rate';
type SearchKind = 'stock' | 'fii' | 'etf' | 'crypto' | 'fixed_income';

export type MarketQuote = {
  symbol: string;
  requestedSymbol?: string;
  resolvedSymbol?: string;
  name: string;
  price: number;
  currency: 'BRL' | 'USD' | '%';
  change?: number | null;
  changePercent?: number | null;
  updatedAt?: string | null;
  source: string;
  kind: QuoteKind;
};

export type MarketSearchResult = {
  symbol: string;
  name: string;
  kind: SearchKind;
  currency: 'BRL' | 'USD' | '%';
  source: string;
};

type BrapiQuote = {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketTime?: string;
  currency?: string;
};

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      meta?: {
        symbol?: string;
        shortName?: string;
        longName?: string;
        regularMarketPrice?: number;
        previousClose?: number;
        currency?: string;
        regularMarketTime?: number;
      };
      indicators?: {
        quote?: Array<{
          close?: Array<number | null>;
        }>;
      };
    }>;
  };
};

type AwesomeCurrency = {
  code: string;
  codein: string;
  name: string;
  bid: string;
  pctChange?: string;
  varBid?: string;
  timestamp?: string;
};

const CRYPTO_IDS: Record<string, { id: string; name: string }> = {
  BTC: { id: 'bitcoin', name: 'Bitcoin' },
  ETH: { id: 'ethereum', name: 'Ethereum' },
  SOL: { id: 'solana', name: 'Solana' },
  ADA: { id: 'cardano', name: 'Cardano' },
};

const BCB_SERIES = [
  { symbol: 'SELIC', name: 'Selic diaria', id: 11 },
  { symbol: 'CDI', name: 'CDI diario', id: 12 },
  { symbol: 'IPCA', name: 'IPCA mensal', id: 433 },
];

const MARKET_SYMBOL_ALIASES: Record<string, string> = {
  VALE: 'VALE3',
  PETR: 'PETR4',
  PETROBRAS: 'PETR4',
  ITUB: 'ITUB4',
  ITAU: 'ITUB4',
  BBDC: 'BBDC4',
  BRADESCO: 'BBDC4',
  BBAS: 'BBAS3',
  'BANCO-DO-BRASIL': 'BBAS3',
  WEG: 'WEGE3',
  IBOV: '^BVSP',
  IBOVESPA: '^BVSP',
};

const MARKET_CATALOG: Array<MarketSearchResult & { aliases?: string[] }> = [
  { symbol: 'VALE3', name: 'Vale ON', kind: 'stock', currency: 'BRL', source: 'catalogo', aliases: ['VALE', 'VALE ON'] },
  { symbol: 'PETR4', name: 'Petrobras PN', kind: 'stock', currency: 'BRL', source: 'catalogo', aliases: ['PETR', 'PETROBRAS'] },
  { symbol: 'PETR3', name: 'Petrobras ON', kind: 'stock', currency: 'BRL', source: 'catalogo', aliases: ['PETR3', 'PETROBRAS ON'] },
  { symbol: 'ITUB4', name: 'Itau Unibanco PN', kind: 'stock', currency: 'BRL', source: 'catalogo', aliases: ['ITUB', 'ITAU'] },
  { symbol: 'BBDC4', name: 'Bradesco PN', kind: 'stock', currency: 'BRL', source: 'catalogo', aliases: ['BBDC', 'BRADESCO'] },
  { symbol: 'BBAS3', name: 'Banco do Brasil ON', kind: 'stock', currency: 'BRL', source: 'catalogo', aliases: ['BBAS', 'BANCO DO BRASIL'] },
  { symbol: 'WEGE3', name: 'WEG ON', kind: 'stock', currency: 'BRL', source: 'catalogo', aliases: ['WEG'] },
  { symbol: 'B3SA3', name: 'B3 ON', kind: 'stock', currency: 'BRL', source: 'catalogo', aliases: ['B3'] },
  { symbol: 'ABEV3', name: 'Ambev ON', kind: 'stock', currency: 'BRL', source: 'catalogo', aliases: ['AMBEV'] },
  { symbol: 'PRIO3', name: 'Prio ON', kind: 'stock', currency: 'BRL', source: 'catalogo', aliases: ['PRIO'] },
  { symbol: 'RENT3', name: 'Localiza ON', kind: 'stock', currency: 'BRL', source: 'catalogo', aliases: ['RENT', 'LOCALIZA'] },
  { symbol: 'MGLU3', name: 'Magazine Luiza ON', kind: 'stock', currency: 'BRL', source: 'catalogo', aliases: ['MGLU', 'MAGALU'] },
  { symbol: 'HGLG11', name: 'CSHG Logistica FII', kind: 'fii', currency: 'BRL', source: 'catalogo', aliases: ['HGLG', 'HGLL', 'HGL', 'CSHG LOGISTICA'] },
  { symbol: 'MXRF11', name: 'Maxi Renda FII', kind: 'fii', currency: 'BRL', source: 'catalogo', aliases: ['MXRF', 'MAXI RENDA'] },
  { symbol: 'KNRI11', name: 'Kinea Renda Imobiliaria FII', kind: 'fii', currency: 'BRL', source: 'catalogo', aliases: ['KNRI', 'KINEA RENDA'] },
  { symbol: 'KNCR11', name: 'Kinea Rendimentos Imobiliarios FII', kind: 'fii', currency: 'BRL', source: 'catalogo', aliases: ['KNCR', 'KINEA CRI'] },
  { symbol: 'XPML11', name: 'XP Malls FII', kind: 'fii', currency: 'BRL', source: 'catalogo', aliases: ['XPML', 'XP MALLS'] },
  { symbol: 'VISC11', name: 'Vinci Shopping Centers FII', kind: 'fii', currency: 'BRL', source: 'catalogo', aliases: ['VISC', 'VINCI SHOPPING'] },
  { symbol: 'XPLG11', name: 'XP Log FII', kind: 'fii', currency: 'BRL', source: 'catalogo', aliases: ['XPLG', 'XP LOG'] },
  { symbol: 'VILG11', name: 'Vinci Logistica FII', kind: 'fii', currency: 'BRL', source: 'catalogo', aliases: ['VILG', 'VINCI LOGISTICA'] },
  { symbol: 'BCFF11', name: 'BTG Pactual Fundo de Fundos FII', kind: 'fii', currency: 'BRL', source: 'catalogo', aliases: ['BCFF', 'BTG FOF'] },
  { symbol: 'IVVB11', name: 'iShares S&P 500 ETF', kind: 'etf', currency: 'BRL', source: 'catalogo', aliases: ['IVVB', 'SP500'] },
  { symbol: 'BOVA11', name: 'iShares Ibovespa ETF', kind: 'etf', currency: 'BRL', source: 'catalogo', aliases: ['BOVA', 'IBOVESPA'] },
  { symbol: 'SMAL11', name: 'iShares Small Cap ETF', kind: 'etf', currency: 'BRL', source: 'catalogo', aliases: ['SMAL', 'SMALL CAP'] },
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', kind: 'etf', currency: 'USD', source: 'catalogo', aliases: ['VANGUARD SP500'] },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', kind: 'etf', currency: 'USD', source: 'catalogo', aliases: ['NASDAQ ETF'] },
  { symbol: 'BTC', name: 'Bitcoin', kind: 'crypto', currency: 'BRL', source: 'catalogo', aliases: ['BITCOIN'] },
  { symbol: 'ETH', name: 'Ethereum', kind: 'crypto', currency: 'BRL', source: 'catalogo', aliases: ['ETHEREUM'] },
  { symbol: 'SOL', name: 'Solana', kind: 'crypto', currency: 'BRL', source: 'catalogo', aliases: ['SOLANA'] },
];

@Injectable()
export class MarketService {
  private readonly cache = new Map<string, { expiresAt: number; data: unknown }>();
  private readonly ttlMs = 1000 * 60 * 5;

  async getSummary() {
    const [currencies, stocks, crypto, rates] = await Promise.all([
      this.safe(() => this.fetchCurrencies(['USD-BRL', 'EUR-BRL'])),
      this.safe(() => this.fetchBrapiQuotes(['^BVSP', 'PETR4', 'VALE3'])),
      this.safe(() => this.fetchCrypto(['BTC', 'ETH'])),
      this.safe(() => this.fetchRates()),
    ]);

    return {
      currencies,
      stocks,
      crypto,
      rates,
      updatedAt: new Date().toISOString(),
    };
  }

  async searchAssets(queryParam: string, kindParam = ''): Promise<MarketSearchResult[]> {
    const query = this.normalizeSearchText(queryParam);
    if (query.length < 2) return [];

    const wantedKind = this.normalizeSearchKind(kindParam);

    return MARKET_CATALOG
      .filter((asset) => !wantedKind || asset.kind === wantedKind)
      .map((asset) => ({
        asset,
        score: this.searchScore(query, asset),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.asset.symbol.localeCompare(b.asset.symbol))
      .slice(0, 8)
      .map(({ asset }) => ({
        symbol: asset.symbol,
        name: asset.name,
        kind: asset.kind,
        currency: asset.currency,
        source: asset.source,
      }));
  }

  async getQuotes(symbolsParam: string) {
    const symbols = symbolsParam
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    if (symbols.length === 0) {
      throw new BadRequestException('Informe pelo menos um simbolo em symbols');
    }

    const resolvedSymbols = symbols.map((symbol) => this.resolveSymbol(symbol));

    const currencySymbols = resolvedSymbols.filter((s) => /^[A-Z]{3}-[A-Z]{3}$/.test(s));
    const cryptoSymbols = resolvedSymbols.filter((s) => CRYPTO_IDS[s]);
    const stockSymbols = resolvedSymbols.filter(
      (s) => !currencySymbols.includes(s) && !cryptoSymbols.includes(s),
    );

    const [currencies, stocks, crypto] = await Promise.all([
      currencySymbols.length ? this.safe(() => this.fetchCurrencies(currencySymbols)) : [],
      stockSymbols.length ? this.safe(() => this.fetchBrapiQuotes(stockSymbols)) : [],
      cryptoSymbols.length ? this.safe(() => this.fetchCrypto(cryptoSymbols)) : [],
    ]);

    const bySymbol = new Map(
      [...currencies, ...stocks, ...crypto].map((quote) => [quote.symbol.toUpperCase(), quote]),
    );

    return symbols.map((symbol, index) => {
      const resolvedSymbol = resolvedSymbols[index];
      const quote = bySymbol.get(resolvedSymbol);
      if (!quote) return this.unavailable(symbol, resolvedSymbol);

      return {
        ...quote,
        requestedSymbol: symbol,
        resolvedSymbol,
      };
    });
  }

  private async fetchCurrencies(pairs: string[]): Promise<MarketQuote[]> {
    const key = `currencies:${pairs.join(',')}`;
    return this.cached(key, async () => {
      const data = await this.fetchJson<Record<string, AwesomeCurrency>>(
        `https://economia.awesomeapi.com.br/json/last/${pairs.join(',')}`,
      );

      return pairs
        .map((pair) => data[pair.replace('-', '')])
        .filter(Boolean)
        .map((item) => ({
          symbol: `${item.code}-${item.codein}`,
          name: item.name,
          price: Number(item.bid),
          currency: item.codein as 'BRL',
          change: item.varBid !== undefined ? Number(item.varBid) : null,
          changePercent: item.pctChange !== undefined ? Number(item.pctChange) : null,
          updatedAt: item.timestamp
            ? new Date(Number(item.timestamp) * 1000).toISOString()
            : null,
          source: 'AwesomeAPI',
          kind: 'currency' as const,
        }));
    });
  }

  private async fetchBrapiQuotes(symbols: string[]): Promise<MarketQuote[]> {
    const key = `brapi:${symbols.join(',')}`;
    return this.cached(key, async () => {
      const token = process.env.BRAPI_API_KEY || process.env.BRAPI_TOKEN;
      const url = new URL(`https://brapi.dev/api/quote/${symbols.join(',')}`);
      if (token) url.searchParams.set('token', token);

      let brapiQuotes: MarketQuote[] = [];

      try {
        const data = await this.fetchJson<{ results?: BrapiQuote[] }>(url.toString());

        brapiQuotes = (data.results ?? [])
          .filter(
            (item) =>
              item.regularMarketPrice !== undefined &&
              Number.isFinite(Number(item.regularMarketPrice)) &&
              Number(item.regularMarketPrice) > 0,
          )
          .map((item) => ({
            symbol: item.symbol,
            name: item.shortName || item.longName || item.symbol,
            price: Number(item.regularMarketPrice),
            currency: item.currency === 'USD' ? 'USD' : 'BRL',
            change:
              item.regularMarketChange !== undefined ? Number(item.regularMarketChange) : null,
            changePercent:
              item.regularMarketChangePercent !== undefined
                ? Number(item.regularMarketChangePercent)
                : null,
            updatedAt: item.regularMarketTime ?? null,
            source: 'brapi',
            kind: 'stock' as const,
          }));
      } catch {
        brapiQuotes = [];
      }

      const found = new Set(brapiQuotes.map((quote) => quote.symbol.toUpperCase()));
      const missing = symbols.filter((symbol) => !found.has(symbol.toUpperCase()));
      const yahooQuotes = missing.length ? await this.fetchYahooQuotes(missing) : [];

      return [...brapiQuotes, ...yahooQuotes];
    });
  }

  private async fetchYahooQuotes(symbols: string[]): Promise<MarketQuote[]> {
    const quotes = await Promise.all(
      symbols.map(async (symbol): Promise<MarketQuote | null> => {
        try {
          const yahooSymbol = this.toYahooSymbol(symbol);
          const data = await this.fetchJson<YahooChartResponse>(
            `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
              yahooSymbol,
            )}?range=5d&interval=1d`,
          );

          const result = data.chart?.result?.[0];
          const meta = result?.meta;
          const fallbackClose = this.lastFinite(result?.indicators?.quote?.[0]?.close);
          const price = Number(meta?.regularMarketPrice ?? fallbackClose);
          if (!Number.isFinite(price) || price <= 0) return null;

          const previousClose = Number(meta?.previousClose);
          const change =
            Number.isFinite(previousClose) && previousClose > 0 ? price - previousClose : null;
          const changePercent =
            change !== null && Number.isFinite(previousClose) && previousClose > 0
              ? (change / previousClose) * 100
              : null;

          return {
            symbol,
            name: meta?.shortName || meta?.longName || symbol,
            price,
            currency: meta?.currency === 'USD' ? ('USD' as const) : ('BRL' as const),
            change,
            changePercent,
            updatedAt: meta?.regularMarketTime
              ? new Date(meta.regularMarketTime * 1000).toISOString()
              : null,
            source: 'Yahoo Finance',
            kind: 'stock' as const,
          };
        } catch {
          return null;
        }
      }),
    );

    return quotes.filter((quote): quote is MarketQuote => quote !== null);
  }

  private lastFinite(values?: Array<number | null>) {
    if (!values) return null;

    for (let i = values.length - 1; i >= 0; i -= 1) {
      const value = Number(values[i]);
      if (Number.isFinite(value) && value > 0) return value;
    }

    return null;
  }

  private toYahooSymbol(symbol: string) {
    if (symbol.startsWith('^')) return symbol;
    if (/^[A-Z]{4,5}\d{1,2}$/.test(symbol)) return `${symbol}.SA`;
    return symbol;
  }

  private async fetchCrypto(symbols: string[]): Promise<MarketQuote[]> {
    const ids = symbols.map((symbol) => CRYPTO_IDS[symbol]?.id).filter(Boolean);
    const key = `crypto:${ids.join(',')}`;

    return this.cached(key, async () => {
      const url = new URL('https://api.coingecko.com/api/v3/simple/price');
      url.searchParams.set('ids', ids.join(','));
      url.searchParams.set('vs_currencies', 'brl');
      url.searchParams.set('include_24hr_change', 'true');
      url.searchParams.set('include_last_updated_at', 'true');

      const data = await this.fetchJson<
        Record<string, { brl?: number; brl_24h_change?: number; last_updated_at?: number }>
      >(url.toString());

      const quotes: MarketQuote[] = [];

      for (const symbol of symbols) {
          const meta = CRYPTO_IDS[symbol];
          const item = data[meta.id];
          if (!item?.brl) continue;

          quotes.push({
            symbol,
            name: meta.name,
            price: Number(item.brl),
            currency: 'BRL' as const,
            change: null,
            changePercent:
              item.brl_24h_change !== undefined ? Number(item.brl_24h_change) : null,
            updatedAt: item.last_updated_at
              ? new Date(item.last_updated_at * 1000).toISOString()
              : null,
            source: 'CoinGecko',
            kind: 'crypto' as const,
          });
      }

      return quotes;
    });
  }

  private async fetchRates(): Promise<MarketQuote[]> {
    const key = 'rates:bcb';
    return this.cached(key, async () => {
      const results = await Promise.all(
        BCB_SERIES.map(async (serie) => {
          const data = await this.fetchJson<Array<{ data: string; valor: string }>>(
            `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serie.id}/dados/ultimos/1?formato=json`,
          );
          const item = data[0];
          return {
            symbol: serie.symbol,
            name: serie.name,
            price: item ? Number(item.valor) : 0,
            currency: '%' as const,
            change: null,
            changePercent: null,
            updatedAt: item?.data ?? null,
            source: 'Banco Central do Brasil SGS',
            kind: 'rate' as const,
          };
        }),
      );

      return results;
    });
  }

  private unavailable(symbol: string, resolvedSymbol = symbol): MarketQuote {
    return {
      symbol,
      requestedSymbol: symbol,
      resolvedSymbol,
      name: symbol,
      price: 0,
      currency: 'BRL',
      change: null,
      changePercent: null,
      updatedAt: null,
      source: 'indisponivel',
      kind: 'stock',
    };
  }

  private resolveSymbol(symbol: string) {
    return MARKET_SYMBOL_ALIASES[symbol] ?? symbol;
  }

  private normalizeSearchKind(kind: string): SearchKind | '' {
    const map: Record<string, SearchKind> = {
      acoes: 'stock',
      stock: 'stock',
      stocks: 'stock',
      fii: 'fii',
      fiis: 'fii',
      etf: 'etf',
      cripto: 'crypto',
      crypto: 'crypto',
      rf: 'fixed_income',
      fixed_income: 'fixed_income',
    };

    return map[kind.trim().toLowerCase()] ?? '';
  }

  private searchScore(query: string, asset: MarketSearchResult & { aliases?: string[] }) {
    const fields = [asset.symbol, asset.name, ...(asset.aliases ?? [])].map((field) =>
      this.normalizeSearchText(field),
    );

    let score = 0;
    for (const field of fields) {
      if (field === query) score = Math.max(score, 100);
      else if (field.startsWith(query)) score = Math.max(score, 85);
      else if (field.includes(query)) score = Math.max(score, 70);
      else if (this.isSubsequence(query, field)) score = Math.max(score, 45);
      else {
        const distance = this.levenshtein(query, field.slice(0, Math.max(query.length, 4)));
        if (distance <= 1) score = Math.max(score, 60);
        if (query.length >= 4 && distance <= 2) score = Math.max(score, 50);
      }
    }

    return score;
  }

  private normalizeSearchText(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9]/gi, '')
      .toUpperCase();
  }

  private isSubsequence(query: string, field: string) {
    let index = 0;
    for (const char of field) {
      if (char === query[index]) index += 1;
      if (index === query.length) return true;
    }
    return false;
  }

  private levenshtein(a: string, b: string) {
    const dp = Array.from({ length: a.length + 1 }, (_, i) =>
      Array.from({ length: b.length + 1 }, (_unused, j) => (i === 0 ? j : j === 0 ? i : 0)),
    );

    for (let i = 1; i <= a.length; i += 1) {
      for (let j = 1; j <= b.length; j += 1) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost,
        );
      }
    }

    return dp[a.length][b.length];
  }

  private async safe(fn: () => Promise<MarketQuote[]>): Promise<MarketQuote[]> {
    try {
      return await fn();
    } catch {
      return [];
    }
  }

  private async cached<T>(key: string, loader: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.data as T;

    const data = await loader();
    this.cache.set(key, { data, expiresAt: Date.now() + this.ttlMs });
    return data;
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Falha ao buscar ${url}: HTTP ${response.status}`);
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeout);
    }
  }
}
