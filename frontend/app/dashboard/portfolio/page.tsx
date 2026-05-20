"use client";

import { useEffect, useState } from "react";
import { AllocationDonut } from "../_components/AllocationDonut";
import { AssetsPanel } from "../_components/AssetsPanel";
import { EvolucaoChart } from "../_components/EvolucaoChart";
import { MarketStrip } from "../_components/MarketStrip";
import { Chip, KpiCard, PageHeader, Section, fmtBRL, fmtPct } from "../_components/ui";
import { api } from "../../lib/api";
import type { AssetResponse, MarketQuote, MarketSummary, PatrimonioResponse } from "../../lib/types";

export default function PortfolioPage() {
  const [patrimonio, setPatrimonio] = useState<PatrimonioResponse | null>(null);
  const [assets, setAssets]         = useState<AssetResponse[]>([]);
  const [market, setMarket]         = useState<MarketSummary | null>(null);
  const [quotes, setQuotes]         = useState<Record<string, MarketQuote>>({});
  const [marketLoading, setMarketLoading] = useState(true);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<PatrimonioResponse>("/patrimonio"),
      api.get<AssetResponse[]>("/assets"),
    ])
      .then(([p, a]) => {
        setPatrimonio(p);
        setAssets(a);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get<MarketSummary>("/market/summary")
      .then(setMarket)
      .catch(() => setMarket(null))
      .finally(() => setMarketLoading(false));
  }, []);

  useEffect(() => {
    const symbols = assets
      .map((asset) => asset.ticker?.trim().toUpperCase())
      .filter((ticker): ticker is string => Boolean(ticker));

    if (symbols.length === 0) return;

    api.get<MarketQuote[]>(`/market/quotes?symbols=${encodeURIComponent(symbols.join(","))}`)
      .then((data) => {
        const nextQuotes: Record<string, MarketQuote> = {};
        for (const quote of data) {
          nextQuotes[quote.symbol.toUpperCase()] = quote;
          if (quote.requestedSymbol) nextQuotes[quote.requestedSymbol.toUpperCase()] = quote;
          if (quote.resolvedSymbol) nextQuotes[quote.resolvedSymbol.toUpperCase()] = quote;
        }
        setQuotes(nextQuotes);
      })
      .catch(() => setQuotes({}));
  }, [assets]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="text-sm text-zinc-500">Carregando portfólio...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="text-sm text-rose-500">{error}</span>
      </div>
    );
  }

  const assetsWithMarket = applyMarketQuotes(assets, quotes, market);
  const marketAssetsTotal = assetsWithMarket.reduce((sum, asset) => sum + asset.totalValue, 0);
  const marketAssetsCost = assetsWithMarket.reduce((sum, asset) => sum + asset.totalCost, 0);
  const marketAssetsProfit = marketAssetsTotal - marketAssetsCost;

  const total      = (patrimonio?.carteiras.total ?? 0) + marketAssetsTotal;
  const assetCount = patrimonio?.ativos.quantidade ?? 0;
  const lucro      = marketAssetsProfit;
  const custo      = marketAssetsCost;
  const rentPct    = custo > 0 ? lucro / custo : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Portfólio de ativos"
        description="Visão consolidada do seu patrimônio em todas as classes."
        action={
          assetCount > 0
            ? <Chip tone="neutral">Atualizado agora</Chip>
            : <Chip tone="neutral">Nenhuma instituição conectada</Chip>
        }
      />

      <MarketStrip summary={market} loading={marketLoading} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Patrimônio total" value={fmtBRL(total)} />
        <KpiCard
          label="Rentabilidade total"
          value={rentPct !== null ? fmtPct(rentPct, { withSign: true }) : "—"}
          delta={lucro !== 0 ? { value: fmtBRL(lucro, { compact: true }), positive: lucro > 0 } : undefined}
        />
        <KpiCard
          label="Saldo em carteiras"
          value={fmtBRL(patrimonio?.carteiras.total ?? 0)}
          hint={`${patrimonio?.carteiras.quantidade ?? 0} carteiras`}
        />
        <KpiCard
          label="Ativos sob gestão"
          value={String(assetCount)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Section
          title="Evolução do Patrimônio"
          description="Aporte acumulado + ganho de capital, mês a mês"
          className="lg:col-span-3"
        >
          <EvolucaoChart />
        </Section>

        <Section
          title="Ativos na carteira"
          description="Distribuição por classe"
          className="lg:col-span-2"
        >
          <AllocationDonut assets={assetsWithMarket} />
        </Section>
      </div>

      <AssetsPanel assets={assetsWithMarket} />
    </div>
  );
}

function applyMarketQuotes(
  assets: AssetResponse[],
  quotes: Record<string, MarketQuote>,
  market: MarketSummary | null,
): AssetResponse[] {
  return assets.map((asset) => {
    if (asset.type === "FIXED_INCOME") {
      return applyFixedIncomePricing(asset, market);
    }

    const ticker = asset.ticker?.toUpperCase();
    const quote = ticker ? quotes[ticker] : undefined;

    if (!quote?.price) return { ...asset, priceSource: "manual" };

    const quantity = Number(asset.quantity);
    const purchasePrice = Number(asset.purchasePrice);
    const totalValue = quantity * quote.price;
    const totalCost = quantity * purchasePrice;

    return {
      ...asset,
      currentPrice: String(quote.price),
      totalValue,
      totalCost,
      profitLoss: totalValue - totalCost,
      priceSource: "market",
      marketSymbol: quote.resolvedSymbol ?? quote.symbol,
      marketSource: quote.source,
      marketUpdatedAt: quote.updatedAt,
      marketChangePercent: quote.changePercent,
    };
  });
}

function applyFixedIncomePricing(
  asset: AssetResponse,
  market: MarketSummary | null,
): AssetResponse {
  const rule = parseFixedIncomeRule(asset);
  const rate = rule ? findRate(market, rule.indexer) : null;

  if (!rule || !rate?.price) {
    return { ...asset, priceSource: "manual" };
  }

  const quantity = Number(asset.quantity);
  const purchasePrice = Number(asset.purchasePrice);
  const elapsedDays = Math.max(
    0,
    Math.floor((Date.now() - new Date(asset.purchasedAt).getTime()) / 86_400_000),
  );

  if (!Number.isFinite(elapsedDays) || elapsedDays <= 0) {
    return {
      ...asset,
      priceSource: "calculated",
      marketSource: `${rule.label} · ${rate.source}`,
      marketUpdatedAt: rate.updatedAt,
      marketChangePercent: null,
    };
  }

  const dailyRate =
    rule.rateKind === "daily"
      ? (rate.price / 100) * rule.multiplier
      : Math.pow(1 + rule.annualRate, 1 / 365) - 1;

  const currentPrice = purchasePrice * Math.pow(1 + dailyRate, elapsedDays);
  const totalValue = quantity * currentPrice;
  const totalCost = quantity * purchasePrice;

  return {
    ...asset,
    currentPrice: currentPrice.toFixed(2),
    totalValue,
    totalCost,
    profitLoss: totalValue - totalCost,
    priceSource: "calculated",
    marketSymbol: rule.indexer,
    marketSource: `${rule.label} · ${rate.source}`,
    marketUpdatedAt: rate.updatedAt,
    marketChangePercent: dailyRate * 100,
  };
}

type FixedIncomeRule =
  | {
      indexer: "CDI" | "SELIC";
      label: string;
      rateKind: "daily";
      multiplier: number;
      annualRate: 0;
    }
  | {
      indexer: "CDI";
      label: string;
      rateKind: "annual";
      multiplier: 1;
      annualRate: number;
    };

function parseFixedIncomeRule(asset: AssetResponse): FixedIncomeRule | null {
  const text = `${asset.ticker ?? ""} ${asset.name}`.toUpperCase();

  if (text.includes("SELIC") || text.includes("TESOUR")) {
    return {
      indexer: "SELIC",
      label: "Selic",
      rateKind: "daily",
      multiplier: 1,
      annualRate: 0,
    };
  }

  const cdiMatch = text.match(/(\d+(?:[,.]\d+)?)\s*%?\s*CDI/);
  if (cdiMatch) {
    const percent = Number(cdiMatch[1].replace(",", "."));
    const multiplier = Number.isFinite(percent) ? percent / 100 : 1;
    return {
      indexer: "CDI",
      label: `${Math.round(multiplier * 100)}% CDI`,
      rateKind: "daily",
      multiplier,
      annualRate: 0,
    };
  }

  if (text.includes("CDI")) {
    return {
      indexer: "CDI",
      label: "100% CDI",
      rateKind: "daily",
      multiplier: 1,
      annualRate: 0,
    };
  }

  const annualMatch = text.match(/(\d+(?:[,.]\d+)?)\s*%/);
  if (annualMatch) {
    const annualRate = Number(annualMatch[1].replace(",", ".")) / 100;
    if (Number.isFinite(annualRate) && annualRate > 0) {
      return {
        indexer: "CDI",
        label: `${(annualRate * 100).toFixed(2).replace(".", ",")}% a.a.`,
        rateKind: "annual",
        multiplier: 1,
        annualRate,
      };
    }
  }

  return null;
}

function findRate(market: MarketSummary | null, symbol: "CDI" | "SELIC") {
  return market?.rates.find((rate) => rate.symbol === symbol) ?? null;
}
