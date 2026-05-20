"use client";

import { fmtBRL } from "./ui";
import type { MarketQuote, MarketSummary } from "../../lib/types";

export function MarketStrip({
  summary,
  loading,
}: {
  summary: MarketSummary | null;
  loading: boolean;
}) {
  const items = summary
    ? [
        ...summary.currencies.slice(0, 2),
        ...summary.stocks.slice(0, 2),
        ...summary.crypto.slice(0, 1),
        ...summary.rates.slice(0, 2),
      ]
    : [];

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0d] text-zinc-50 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.75)]" />
            <h2 className="text-sm font-semibold">Mercado hoje</h2>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500">
            Cotacoes e indicadores usados para acompanhar sua carteira
          </p>
        </div>
      </div>

      <div className="scrollbar-none flex gap-px overflow-x-auto bg-white/10">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonQuote key={i} />)
        ) : items.length > 0 ? (
          items.map((quote) => (
            <QuoteTile key={`${quote.kind}-${quote.symbol}`} quote={quote} />
          ))
        ) : (
          <div className="bg-[#0b0b0d] px-5 py-4 text-sm text-zinc-400">
            Nao foi possivel carregar o mercado agora.
          </div>
        )}
      </div>
    </section>
  );
}

function QuoteTile({ quote }: { quote: MarketQuote }) {
  const change = quote.changePercent;
  const isPositive = (change ?? 0) >= 0;
  const tone =
    change === null || change === undefined
      ? "neutral"
      : isPositive
        ? "positive"
        : "negative";

  return (
    <div className="group flex min-w-[210px] flex-1 flex-col justify-between gap-4 bg-[#0b0b0d] px-5 py-4 transition-colors hover:bg-[#111114]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            {quote.symbol}
          </div>
          <div className="mt-1 truncate text-xs font-medium text-zinc-300">
            {quote.name}
          </div>
        </div>

        {change !== null && change !== undefined && (
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${toneClasses[tone]}`}
          >
            {isPositive ? "+" : ""}
            {change.toFixed(2).replace(".", ",")}%
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-xl font-semibold tracking-tight text-white">
            {formatPrice(quote)}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-wide text-zinc-600">
            {quote.source}
          </div>
        </div>
        <MiniSparkline tone={tone} />
      </div>
    </div>
  );
}

function SkeletonQuote() {
  return (
    <div className="min-w-[210px] flex-1 bg-[#0b0b0d] px-5 py-4">
      <div className="h-3 w-20 rounded bg-white/10" />
      <div className="mt-2 h-2 w-12 rounded bg-white/5" />
      <div className="mt-6 h-5 w-24 rounded bg-white/10" />
    </div>
  );
}

const toneClasses = {
  positive: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20",
  negative: "bg-rose-400/10 text-rose-300 ring-rose-400/20",
  neutral: "bg-zinc-400/10 text-zinc-300 ring-zinc-400/20",
};

function MiniSparkline({
  tone,
}: {
  tone: "positive" | "negative" | "neutral";
}) {
  const stroke =
    tone === "positive" ? "#34d399" : tone === "negative" ? "#fb7185" : "#71717a";
  const path =
    tone === "negative"
      ? "M2 10 C8 6 12 8 17 5 C22 2 25 6 30 3"
      : tone === "positive"
        ? "M2 12 C8 9 11 11 16 7 C21 3 25 5 30 2"
        : "M2 8 C8 8 12 7 17 8 C22 9 25 8 30 8";

  return (
    <svg
      viewBox="0 0 32 16"
      fill="none"
      className="h-8 w-16 opacity-70 transition-opacity group-hover:opacity-100"
    >
      <path d={path} stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M2 14H30" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    </svg>
  );
}

function formatPrice(quote: MarketQuote) {
  if (quote.currency === "%") {
    return `${quote.price.toFixed(2).replace(".", ",")}%`;
  }

  if (quote.currency === "USD") {
    return `US$ ${quote.price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return fmtBRL(quote.price);
}
