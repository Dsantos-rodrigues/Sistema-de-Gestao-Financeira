"use client";

import { ReactNode, useState } from "react";
import { fmtBRL, fmtPct } from "./ui";
import type { AssetResponse, AssetType } from "../../lib/types";

type IconName = "bar-chart" | "building" | "globe" | "bitcoin" | "landmark";
type Recommendation = "buy" | "hold" | "sell";

type AssetRow = {
  ticker: string;
  name: string;
  qty: number;
  avgPrice: number;
  currentPrice: number;
  change: number;
  return: number;
  priceSource?: "market" | "manual" | "calculated";
  marketSymbol?: string;
  marketSource?: string;
  marketUpdatedAt?: string | null;
  marketChangePercent?: number | null;
  rating: "A" | "B" | "C" | "D";
  currentPct: number;
  targetPct: number;
  recommendation: Recommendation;
};

type Category = {
  key: string;
  label: string;
  icon: IconName;
  iconColor: string;
  currency: "R$" | "US$";
  count: number;
  total: number;
  change: number;
  profitability: number;
  currentPct: number;
  targetPct: number;
  assets: AssetRow[];
};

// Metadados visuais por tipo de ativo
const TYPE_META: Record<AssetType, { label: string; icon: IconName; iconColor: string; currency: "R$" | "US$" }> = {
  STOCK:        { label: "Ações",       icon: "bar-chart", iconColor: "#c89b3c", currency: "R$" },
  FUND:         { label: "Fundos",      icon: "building",  iconColor: "#64748b", currency: "R$" },
  REAL_ESTATE:  { label: "FIIs",        icon: "building",  iconColor: "#475569", currency: "R$" },
  FIXED_INCOME: { label: "Renda Fixa",  icon: "landmark",  iconColor: "#a1a1aa", currency: "R$" },
  CRYPTO:       { label: "Cripto",      icon: "bitcoin",   iconColor: "#f59e0b", currency: "R$" },
  OTHER:        { label: "Outros",      icon: "bar-chart", iconColor: "#6366f1", currency: "R$" },
};

function groupAssets(assets: AssetResponse[]): Category[] {
  const portfolioTotal = assets.reduce((s, a) => s + a.totalValue, 0);
  const grouped: Partial<Record<AssetType, AssetResponse[]>> = {};

  for (const a of assets) {
    if (!grouped[a.type]) grouped[a.type] = [];
    grouped[a.type]!.push(a);
  }

  return (Object.entries(grouped) as [AssetType, AssetResponse[]][]).map(([type, group]) => {
    const meta       = TYPE_META[type];
    const total      = group.reduce((s, a) => s + a.totalValue, 0);
    const totalCost  = group.reduce((s, a) => s + a.totalCost, 0);
    const profitability = totalCost > 0 ? (total - totalCost) / totalCost : 0;
    const currentPct    = portfolioTotal > 0 ? total / portfolioTotal : 0;

    const rows: AssetRow[] = group.map((a) => {
      const qty          = parseFloat(a.quantity);
      const avgPrice     = parseFloat(a.purchasePrice);
      const currentPrice = parseFloat(a.currentPrice);
      const returnPct    = a.totalCost > 0 ? a.profitLoss / a.totalCost : 0;
      const assetPct     = portfolioTotal > 0 ? a.totalValue / portfolioTotal : 0;

      return {
        ticker:          a.ticker ?? a.name.slice(0, 6).toUpperCase(),
        name:            a.name,
        qty,
        avgPrice,
        currentPrice,
        change:          a.marketChangePercent ?? 0,
        return:          returnPct,
        priceSource:     a.priceSource,
        marketSymbol:    a.marketSymbol,
        marketSource:    a.marketSource,
        marketUpdatedAt: a.marketUpdatedAt,
        marketChangePercent: a.marketChangePercent,
        rating:          returnPct > 0.1 ? "A" : returnPct > 0 ? "B" : returnPct > -0.05 ? "C" : "D",
        currentPct:      assetPct,
        targetPct:       0,
        recommendation:  "hold",
      };
    });

    return {
      key:          type,
      label:        meta.label,
      icon:         meta.icon,
      iconColor:    meta.iconColor,
      currency:     meta.currency,
      count:        group.length,
      total,
      change:       0,
      profitability,
      currentPct,
      targetPct:    0,
      assets:       rows,
    };
  });
}

export function AssetsPanel({ assets }: { assets: AssetResponse[] }) {
  const categories = groupAssets(assets);
  const [expanded, setExpanded] = useState<string | null>(categories[0]?.key ?? null);

  return (
    <section className="overflow-hidden rounded-3xl bg-ink-900 ring-1 ring-inset ring-ink-700">
      <header className="flex items-center justify-between gap-4 border-b border-ink-700/60 px-6 py-5">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold text-zinc-50">Painel de ativos</h2>
          <p className="text-xs text-zinc-500">Por classe · expanda para ver detalhes e ações</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          <span className="hidden items-center gap-1.5 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Sincronizado
          </span>
        </div>
      </header>

      <ul className="flex flex-col gap-2.5 p-3 sm:p-4">
        {categories.length === 0 ? (
          <li className="flex flex-col items-center gap-2 py-12 text-center">
            <span className="text-sm font-medium text-zinc-400">Nenhum ativo cadastrado</span>
            <span className="text-xs text-zinc-600">Adicione um lançamento para começar a acompanhar sua carteira.</span>
          </li>
        ) : (
          categories.map((c) => (
            <CategoryRow
              key={c.key}
              category={c}
              expanded={expanded === c.key}
              onToggle={() => setExpanded((prev) => (prev === c.key ? null : c.key))}
            />
          ))
        )}
      </ul>
    </section>
  );
}

function CategoryRow({ category, expanded, onToggle }: { category: Category; expanded: boolean; onToggle: () => void }) {
  return (
    <li className={`overflow-hidden rounded-2xl bg-ink-800 ring-1 ring-inset transition-colors ${expanded ? "ring-gold-400/30" : "ring-ink-700/60"}`}>
      {/* Header clicável */}
      <div className="flex w-full items-center gap-4 px-4 py-3.5 sm:px-5">
        <button type="button" onClick={onToggle} aria-expanded={expanded} className="flex min-w-0 flex-1 items-center gap-4 text-left transition-colors">
          <div className="flex min-w-0 shrink-0 items-center gap-3 sm:min-w-[180px]">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset" style={{ background: `${category.iconColor}1f`, color: category.iconColor, boxShadow: `inset 0 0 0 1px ${category.iconColor}33` }}>
              <CategoryIcon name={category.icon} />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-semibold text-zinc-50">{category.label}</span>
              <span className="text-[11px] text-zinc-500">{category.currency === "US$" ? "Mercado externo" : "B3 · Brasil"}</span>
            </span>
          </div>

          <div className="ml-auto flex flex-1 items-center justify-end gap-5 overflow-x-auto sm:gap-8">
            <Metric label="Ativos" value={category.count.toString()} />
            <Metric label="Valor total" value={`${category.currency} ${fmtCompact(category.total)}`} />
            <Metric label="Rentabilidade" value={fmtPct(category.profitability, { withSign: true })} icon={<TrendingIcon direction={category.profitability >= 0 ? "up" : "down"} />} tone={category.profitability >= 0 ? "positive" : "negative"} />
            <Metric label="% na carteira" value={pctNoDec(category.currentPct)} icon={<PercentIcon />} />
          </div>
        </button>

        {/* Ações visíveis só quando expandido */}
        {expanded && (
          <div className="flex shrink-0 items-center gap-2">
            <DarkGhostButton icon={<ChartIcon />}>Gráficos</DarkGhostButton>
            <DarkPrimaryButton icon={<PlusIcon />}>+ Lançamento</DarkPrimaryButton>
          </div>
        )}

        <button type="button" onClick={onToggle} aria-label={expanded ? "Recolher" : "Expandir"} className={`ml-2 grid h-8 w-8 shrink-0 place-items-center rounded-md text-zinc-500 transition-transform duration-200 ${expanded ? "rotate-180 text-gold-400" : ""}`}>
          <ChevronDown />
        </button>
      </div>

      {expanded && <CategoryDetails category={category} />}
    </li>
  );
}

function CategoryDetails({ category }: { category: Category }) {
  return (
    <div className="border-t border-ink-700/60 bg-ink-900/40">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="border-b border-ink-700/60 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              <th className="px-5 py-3 text-left">Ativo</th>
              <th className="px-3 py-3 text-right">Quant.</th>
              <th className="px-3 py-3 text-right">Preço médio</th>
              <th className="px-3 py-3 text-right">Preço atual</th>
              <th className="px-3 py-3 text-left">Fonte</th>
              <th className="px-3 py-3 text-right">Rentabilidade</th>
              <th className="px-3 py-3 text-right">Saldo</th>
              <th className="px-3 py-3 text-center">Nota</th>
              <th className="px-3 py-3 text-right">% Carteira</th>
              <th className="px-3 py-3 text-right">Opções</th>
            </tr>
          </thead>
          <tbody>
            {category.assets.map((a) => (
              <AssetTableRow key={a.ticker} asset={a} color={category.iconColor} currency={category.currency} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AssetTableRow({ asset: a, color, currency }: { asset: AssetRow; color: string; currency: "R$" | "US$" }) {
  const balance = a.qty * a.currentPrice;
  return (
    <tr className="border-b border-ink-700/40 last:border-0 hover:bg-ink-700/20">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[10px] font-bold" style={{ background: `${color}1f`, color }}>
            {a.ticker.slice(0, 2)}
          </span>
          <div className="flex flex-col">
            <span className="font-mono text-xs font-semibold text-zinc-50">{a.ticker}</span>
            <span className="text-[11px] text-zinc-500">{a.name}</span>
          </div>
        </div>
      </td>
      <td className="px-3 py-3.5 text-right tabular-nums text-zinc-300">
        {a.qty.toLocaleString("pt-BR", { minimumFractionDigits: a.qty < 10 && a.qty !== 1 ? 2 : 0, maximumFractionDigits: a.qty < 10 && a.qty !== 1 ? 4 : 0 })}
      </td>
      <td className="px-3 py-3.5 text-right tabular-nums text-zinc-300">{a.avgPrice > 0 ? fmtMoney(a.avgPrice, currency) : "—"}</td>
      <td className="px-3 py-3.5 text-right tabular-nums text-zinc-100">{a.currentPrice > 0 ? fmtMoney(a.currentPrice, currency) : "—"}</td>
      <td className="px-3 py-3.5 text-left text-[11px] text-zinc-500">{formatPriceSource(a)}</td>
      <td className={`px-3 py-3.5 text-right tabular-nums font-medium ${a.return >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
        <span className="inline-flex items-center justify-end gap-1">
          <TrendingIcon direction={a.return >= 0 ? "up" : "down"} />
          {fmtPct(a.return, { withSign: true })}
        </span>
      </td>
      <td className="px-3 py-3.5 text-right tabular-nums font-medium text-zinc-50">{fmtBRL(balance, { compact: true })}</td>
      <td className="px-3 py-3.5 text-center"><RatingBadge rating={a.rating} /></td>
      <td className="px-3 py-3.5 text-right"><PctIndicator value={a.currentPct} max={0.15} color="#c89b3c" /></td>
      <td className="px-3 py-3.5 text-right">
        <button type="button" aria-label="Opções" className="grid h-7 w-7 place-items-center rounded-md text-zinc-500 transition-colors hover:bg-ink-700 hover:text-zinc-200">
          <MoreIcon />
        </button>
      </td>
    </tr>
  );
}

function formatPriceSource(asset: AssetRow) {
  if (asset.priceSource === "calculated") {
    return asset.marketSource ?? "Calculado";
  }

  if (asset.priceSource !== "market") return "Manual";

  const source = asset.marketSource ?? "Mercado";
  const updated = formatQuoteTime(asset.marketUpdatedAt);
  return updated ? `${source} · ${updated}` : source;
}

function formatQuoteTime(value?: string | null) {
  if (!value) return "";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Metric({ label, value, icon, tone = "neutral" }: { label: string; value: string; icon?: ReactNode; tone?: "positive" | "negative" | "neutral" }) {
  const colors = { positive: "text-emerald-400", negative: "text-rose-400", neutral: "text-zinc-50" };
  return (
    <div className="flex shrink-0 flex-col gap-0.5">
      <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</span>
      <span className={`flex items-center gap-1 text-sm font-semibold tabular-nums ${colors[tone]}`}>{icon}{value}</span>
    </div>
  );
}

function PctIndicator({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(value / max, 1);
  return (
    <div className="ml-auto flex items-center justify-end gap-2">
      <span className="text-xs tabular-nums text-zinc-300">{pctNoDec(value)}</span>
      <span className="relative h-1 w-12 overflow-hidden rounded-full bg-ink-700">
        <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct * 100}%`, background: color }} />
      </span>
    </div>
  );
}

function RatingBadge({ rating }: { rating: AssetRow["rating"] }) {
  const tones: Record<AssetRow["rating"], string> = {
    A: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/25",
    B: "bg-gold-400/15 text-gold-300 ring-gold-400/25",
    C: "bg-zinc-500/20 text-zinc-300 ring-zinc-500/30",
    D: "bg-rose-500/15 text-rose-300 ring-rose-500/25",
  };
  return <span className={`inline-flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold ring-1 ring-inset ${tones[rating]}`}>{rating}</span>;
}

function DarkGhostButton({ children, icon, ...props }: { icon?: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" {...props} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-ink-700 bg-ink-800 px-3 text-xs font-medium text-zinc-300 transition-colors hover:border-ink-700 hover:bg-ink-700/60 hover:text-zinc-50">
      {icon}{children}
    </button>
  );
}

function DarkPrimaryButton({ children, icon, ...props }: { icon?: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" {...props} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-gold-400 px-3 text-xs font-semibold text-ink-900 transition-colors hover:bg-gold-300">
      {icon}{children}
    </button>
  );
}

function fmtCompact(n: number) {
  return n.toLocaleString("pt-BR", { notation: "compact", maximumFractionDigits: 1 });
}

function fmtMoney(n: number, currency: "R$" | "US$") {
  if (currency === "US$") return "US$ " + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return fmtBRL(n);
}

function pctNoDec(n: number) { return `${Math.round(n * 100)}%`; }

/* ── Icons ── */
function CategoryIcon({ name }: { name: IconName }) {
  const cls = "h-4 w-4";
  const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className: cls };
  if (name === "bar-chart") return <svg {...base}><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg>;
  if (name === "building") return <svg {...base}><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" /></svg>;
  if (name === "bitcoin") return <svg {...base}><path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727" /></svg>;
  if (name === "landmark") return <svg {...base}><line x1="3" x2="21" y1="22" y2="22" /><line x1="6" x2="6" y1="18" y2="11" /><line x1="10" x2="10" y1="18" y2="11" /><line x1="14" x2="14" y1="18" y2="11" /><line x1="18" x2="18" y1="18" y2="11" /><polygon points="12 2 20 7 4 7" /></svg>;
  return <svg {...base}><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /></svg>;
}

function TrendingIcon({ direction }: { direction: "up" | "down" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      {direction === "up" ? <><path d="M22 7 13.5 15.5 8.5 10.5 2 17" /><path d="M16 7h6v6" /></> : <><path d="M22 17 13.5 8.5 8.5 13.5 2 7" /><path d="M16 17h6v-6" /></>}
    </svg>
  );
}

function PercentIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-zinc-500"><line x1="19" x2="5" y1="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg>;
}

function ChevronDown() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m6 9 6 6 6-6" /></svg>;
}

function MoreIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>;
}

function ChartIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><path d="M3 3v18h18" /><path d="m7 14 4-4 4 4 5-5" /></svg>;
}

function PlusIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-3.5 w-3.5"><path d="M12 5v14M5 12h14" /></svg>;
}
