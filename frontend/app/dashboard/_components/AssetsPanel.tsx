"use client";

import { ReactNode, useState } from "react";
import { fmtBRL, fmtPct } from "./ui";

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

const CATEGORIES: Category[] = [
  {
    key: "acoes",
    label: "Ações BR",
    icon: "bar-chart",
    iconColor: "#c89b3c",
    currency: "R$",
    count: 5,
    total: 399382,
    change: 0.024,
    profitability: 0.171,
    currentPct: 0.32,
    targetPct: 0.25,
    assets: [
      {
        ticker: "VALE3",
        name: "Vale ON",
        qty: 800,
        avgPrice: 56.92,
        currentPrice: 67.42,
        change: 0.012,
        return: 0.184,
        rating: "A",
        currentPct: 0.108,
        targetPct: 0.07,
        recommendation: "sell",
      },
      {
        ticker: "ITUB4",
        name: "Itaú PN",
        qty: 1200,
        avgPrice: 32.05,
        currentPrice: 38.91,
        change: 0.008,
        return: 0.213,
        rating: "A",
        currentPct: 0.094,
        targetPct: 0.08,
        recommendation: "hold",
      },
      {
        ticker: "PETR4",
        name: "Petrobras PN",
        qty: 600,
        avgPrice: 38.2,
        currentPrice: 41.78,
        change: -0.014,
        return: 0.094,
        rating: "B",
        currentPct: 0.057,
        targetPct: 0.04,
        recommendation: "sell",
      },
      {
        ticker: "WEGE3",
        name: "WEG ON",
        qty: 350,
        avgPrice: 41.5,
        currentPrice: 47.12,
        change: 0.018,
        return: 0.135,
        rating: "A",
        currentPct: 0.043,
        targetPct: 0.04,
        recommendation: "hold",
      },
      {
        ticker: "BBAS3",
        name: "Banco do Brasil ON",
        qty: 400,
        avgPrice: 28.3,
        currentPrice: 26.85,
        change: -0.022,
        return: -0.051,
        rating: "C",
        currentPct: 0.022,
        targetPct: 0.03,
        recommendation: "buy",
      },
    ],
  },
  {
    key: "exterior",
    label: "Exterior",
    icon: "globe",
    iconColor: "#10b981",
    currency: "US$",
    count: 3,
    total: 349267,
    change: 0.018,
    profitability: 0.268,
    currentPct: 0.28,
    targetPct: 0.3,
    assets: [
      {
        ticker: "VOO",
        name: "Vanguard S&P 500 ETF",
        qty: 180,
        avgPrice: 421.5,
        currentPrice: 521.14,
        change: 0.011,
        return: 0.241,
        rating: "A",
        currentPct: 0.122,
        targetPct: 0.15,
        recommendation: "buy",
      },
      {
        ticker: "QQQM",
        name: "Invesco Nasdaq-100 ETF",
        qty: 220,
        avgPrice: 144.8,
        currentPrice: 187.55,
        change: 0.022,
        return: 0.297,
        rating: "A",
        currentPct: 0.108,
        targetPct: 0.1,
        recommendation: "hold",
      },
      {
        ticker: "VT",
        name: "Vanguard Total World",
        qty: 90,
        avgPrice: 92.4,
        currentPrice: 108.65,
        change: 0.009,
        return: 0.184,
        rating: "A",
        currentPct: 0.05,
        targetPct: 0.05,
        recommendation: "hold",
      },
    ],
  },
  {
    key: "fii",
    label: "FIIs",
    icon: "building",
    iconColor: "#64748b",
    currency: "R$",
    count: 4,
    total: 224529,
    change: -0.006,
    profitability: 0.058,
    currentPct: 0.18,
    targetPct: 0.15,
    assets: [
      {
        ticker: "HGLG11",
        name: "CSHG Logística",
        qty: 850,
        avgPrice: 151.2,
        currentPrice: 162.34,
        change: -0.008,
        return: 0.072,
        rating: "B",
        currentPct: 0.072,
        targetPct: 0.05,
        recommendation: "sell",
      },
      {
        ticker: "KNRI11",
        name: "Kinea Renda Imob.",
        qty: 420,
        avgPrice: 142.8,
        currentPrice: 148.9,
        change: -0.004,
        return: 0.041,
        rating: "B",
        currentPct: 0.038,
        targetPct: 0.04,
        recommendation: "hold",
      },
      {
        ticker: "MXRF11",
        name: "Maxi Renda",
        qty: 4200,
        avgPrice: 9.85,
        currentPrice: 10.42,
        change: 0.002,
        return: 0.058,
        rating: "C",
        currentPct: 0.027,
        targetPct: 0.03,
        recommendation: "hold",
      },
      {
        ticker: "VISC11",
        name: "Vinci Shopping Centers",
        qty: 380,
        avgPrice: 108.4,
        currentPrice: 112.85,
        change: -0.012,
        return: 0.041,
        rating: "C",
        currentPct: 0.027,
        targetPct: 0.03,
        recommendation: "hold",
      },
    ],
  },
  {
    key: "rf",
    label: "Renda fixa",
    icon: "landmark",
    iconColor: "#a1a1aa",
    currency: "R$",
    count: 3,
    total: 174634,
    change: 0.004,
    profitability: 0.108,
    currentPct: 0.14,
    targetPct: 0.25,
    assets: [
      {
        ticker: "TESOURO IPCA+ 2035",
        name: "Tesouro Direto",
        qty: 1,
        avgPrice: 158420,
        currentPrice: 174634,
        change: 0.004,
        return: 0.102,
        rating: "A",
        currentPct: 0.092,
        targetPct: 0.15,
        recommendation: "buy",
      },
      {
        ticker: "CDB ITAÚ 2026",
        name: "CDB 110% CDI",
        qty: 1,
        avgPrice: 0,
        currentPrice: 0,
        change: 0.003,
        return: 0.118,
        rating: "B",
        currentPct: 0.028,
        targetPct: 0.05,
        recommendation: "buy",
      },
      {
        ticker: "LCI INTER 2027",
        name: "LCI 96% CDI",
        qty: 1,
        avgPrice: 0,
        currentPrice: 0,
        change: 0.003,
        return: 0.092,
        rating: "B",
        currentPct: 0.02,
        targetPct: 0.05,
        recommendation: "buy",
      },
    ],
  },
  {
    key: "cripto",
    label: "Cripto",
    icon: "bitcoin",
    iconColor: "#f59e0b",
    currency: "R$",
    count: 3,
    total: 99570,
    change: -0.041,
    profitability: 0.358,
    currentPct: 0.08,
    targetPct: 0.05,
    assets: [
      {
        ticker: "BTC",
        name: "Bitcoin",
        qty: 0.42,
        avgPrice: 124800,
        currentPrice: 178420,
        change: -0.038,
        return: 0.412,
        rating: "B",
        currentPct: 0.06,
        targetPct: 0.03,
        recommendation: "sell",
      },
      {
        ticker: "ETH",
        name: "Ethereum",
        qty: 6.8,
        avgPrice: 11420,
        currentPrice: 14820,
        change: -0.052,
        return: 0.286,
        rating: "B",
        currentPct: 0.018,
        targetPct: 0.015,
        recommendation: "hold",
      },
      {
        ticker: "SOL",
        name: "Solana",
        qty: 42,
        avgPrice: 480,
        currentPrice: 612,
        change: -0.064,
        return: 0.178,
        rating: "C",
        currentPct: 0.005,
        targetPct: 0.005,
        recommendation: "hold",
      },
    ],
  },
];

export function AssetsPanel() {
  const [expanded, setExpanded] = useState<string | null>("acoes");

  return (
    <section className="overflow-hidden rounded-3xl bg-ink-900 ring-1 ring-inset ring-ink-700">
      <header className="flex items-center justify-between gap-4 border-b border-ink-700/60 px-6 py-5">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold text-zinc-50">
            Painel de ativos
          </h2>
          <p className="text-xs text-zinc-500">
            Por classe · expanda para ver detalhes e ações
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          <span className="hidden items-center gap-1.5 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Sincronizado
          </span>
        </div>
      </header>

      <ul className="flex flex-col gap-2.5 p-3 sm:p-4">
        {CATEGORIES.map((c) => (
          <CategoryRow
            key={c.key}
            category={c}
            expanded={expanded === c.key}
            onToggle={() =>
              setExpanded((prev) => (prev === c.key ? null : c.key))
            }
          />
        ))}
      </ul>
    </section>
  );
}

function CategoryRow({
  category,
  expanded,
  onToggle,
}: {
  category: Category;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <li
      className={`overflow-hidden rounded-2xl bg-ink-800 ring-1 ring-inset transition-colors ${
        expanded ? "ring-gold-400/30" : "ring-ink-700/60"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-ink-700/30 sm:px-5"
      >
        <div className="flex min-w-0 shrink-0 items-center gap-3 sm:min-w-[180px]">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset"
            style={{
              background: `${category.iconColor}1f`,
              color: category.iconColor,
              boxShadow: `inset 0 0 0 1px ${category.iconColor}33`,
            }}
          >
            <CategoryIcon name={category.icon} />
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-50">
              {category.label}
            </span>
            <span className="text-[11px] text-zinc-500">
              {category.currency === "US$" ? "Mercado externo" : "B3 · Brasil"}
            </span>
          </span>
        </div>

        <div className="ml-auto flex flex-1 items-center justify-end gap-5 overflow-x-auto sm:gap-8">
          <Metric label="Ativos" value={category.count.toString()} />
          <Metric
            label="Valor total"
            value={`${category.currency} ${fmtCompact(category.total)}`}
          />
          <Metric
            label="Variação"
            value={fmtPct(category.change, { withSign: true })}
            icon={
              <ArrowIcon direction={category.change >= 0 ? "up" : "down"} />
            }
            tone={category.change >= 0 ? "positive" : "negative"}
          />
          <Metric
            label="Rentabilidade"
            value={fmtPct(category.profitability, { withSign: true })}
            icon={
              <TrendingIcon
                direction={category.profitability >= 0 ? "up" : "down"}
              />
            }
            tone={category.profitability >= 0 ? "positive" : "negative"}
          />
          <Metric
            label="% na carteira"
            value={`${pctNoDec(category.currentPct)} / ${pctNoDec(
              category.targetPct
            )}`}
            icon={<PercentIcon />}
          />
        </div>

        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-md text-zinc-500 transition-transform duration-200 ${
            expanded ? "rotate-180 text-gold-400" : ""
          }`}
        >
          <ChevronDown />
        </span>
      </button>

      {expanded && <CategoryDetails category={category} />}
    </li>
  );
}

function CategoryDetails({ category }: { category: Category }) {
  return (
    <div className="border-t border-ink-700/60 bg-ink-900/40">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] text-sm">
          <thead>
            <tr className="border-b border-ink-700/60 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              <th className="px-5 py-3 text-left">Ativo</th>
              <th className="px-3 py-3 text-right">Quant.</th>
              <th className="px-3 py-3 text-right">Preço médio</th>
              <th className="px-3 py-3 text-right">Preço atual</th>
              <th className="px-3 py-3 text-right">Variação</th>
              <th className="px-3 py-3 text-right">Rentabilidade</th>
              <th className="px-3 py-3 text-right">Saldo</th>
              <th className="px-3 py-3 text-center">Nota</th>
              <th className="px-3 py-3 text-right">% Carteira</th>
              <th className="px-3 py-3 text-right">% Ideal</th>
              <th className="px-3 py-3 text-center">Comprar?</th>
              <th className="px-3 py-3 text-right">Opções</th>
            </tr>
          </thead>
          <tbody>
            {category.assets.map((a) => (
              <AssetTableRow
                key={a.ticker}
                asset={a}
                color={category.iconColor}
                currency={category.currency}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-ink-700/60 px-4 py-3 sm:px-5">
        <DarkGhostButton icon={<ListIcon />}>Lançamentos</DarkGhostButton>
        <DarkGhostButton icon={<ChartIcon />}>Gráficos</DarkGhostButton>
        <DarkGhostButton icon={<ColumnsIcon />}>Editar colunas</DarkGhostButton>
        <DarkPrimaryButton icon={<PlusIcon />}>
          Adicionar Lançamento
        </DarkPrimaryButton>
      </div>
    </div>
  );
}

function AssetTableRow({
  asset: a,
  color,
  currency,
}: {
  asset: AssetRow;
  color: string;
  currency: "R$" | "US$";
}) {
  const balance = a.qty * a.currentPrice;
  return (
    <tr className="border-b border-ink-700/40 last:border-0 hover:bg-ink-700/20">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[10px] font-bold"
            style={{ background: `${color}1f`, color: color }}
          >
            {a.ticker.slice(0, 2)}
          </span>
          <div className="flex flex-col">
            <span className="font-mono text-xs font-semibold text-zinc-50">
              {a.ticker}
            </span>
            <span className="text-[11px] text-zinc-500">{a.name}</span>
          </div>
        </div>
      </td>
      <td className="px-3 py-3.5 text-right tabular-nums text-zinc-300">
        {a.qty.toLocaleString("pt-BR", {
          minimumFractionDigits: a.qty < 10 && a.qty !== 1 ? 2 : 0,
          maximumFractionDigits: a.qty < 10 && a.qty !== 1 ? 4 : 0,
        })}
      </td>
      <td className="px-3 py-3.5 text-right tabular-nums text-zinc-300">
        {a.avgPrice > 0 ? fmtMoney(a.avgPrice, currency) : "—"}
      </td>
      <td className="px-3 py-3.5 text-right tabular-nums text-zinc-100">
        {a.currentPrice > 0 ? fmtMoney(a.currentPrice, currency) : "—"}
      </td>
      <td
        className={`px-3 py-3.5 text-right tabular-nums font-medium ${
          a.change >= 0 ? "text-emerald-400" : "text-rose-400"
        }`}
      >
        <span className="inline-flex items-center justify-end gap-1">
          <ArrowIcon direction={a.change >= 0 ? "up" : "down"} />
          {fmtPct(a.change, { withSign: true })}
        </span>
      </td>
      <td
        className={`px-3 py-3.5 text-right tabular-nums font-medium ${
          a.return >= 0 ? "text-emerald-400" : "text-rose-400"
        }`}
      >
        <span className="inline-flex items-center justify-end gap-1">
          <TrendingIcon direction={a.return >= 0 ? "up" : "down"} />
          {fmtPct(a.return, { withSign: true })}
        </span>
      </td>
      <td className="px-3 py-3.5 text-right tabular-nums font-medium text-zinc-50">
        {fmtBRL(balance, { compact: true })}
      </td>
      <td className="px-3 py-3.5 text-center">
        <RatingBadge rating={a.rating} />
      </td>
      <td className="px-3 py-3.5 text-right">
        <PctIndicator value={a.currentPct} max={0.15} color="#c89b3c" />
      </td>
      <td className="px-3 py-3.5 text-right">
        <PctIndicator value={a.targetPct} max={0.15} color="#52525b" />
      </td>
      <td className="px-3 py-3.5 text-center">
        <RecommendationTag recommendation={a.recommendation} />
      </td>
      <td className="px-3 py-3.5 text-right">
        <button
          type="button"
          aria-label="Opções"
          className="grid h-7 w-7 place-items-center rounded-md text-zinc-500 transition-colors hover:bg-ink-700 hover:text-zinc-200"
        >
          <MoreIcon />
        </button>
      </td>
    </tr>
  );
}

function Metric({
  label,
  value,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  tone?: "positive" | "negative" | "neutral";
}) {
  const colors = {
    positive: "text-emerald-400",
    negative: "text-rose-400",
    neutral: "text-zinc-50",
  };
  return (
    <div className="flex shrink-0 flex-col gap-0.5">
      <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <span
        className={`flex items-center gap-1 text-sm font-semibold tabular-nums ${colors[tone]}`}
      >
        {icon}
        {value}
      </span>
    </div>
  );
}

function PctIndicator({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.min(value / max, 1);
  return (
    <div className="ml-auto flex items-center justify-end gap-2">
      <span className="text-xs tabular-nums text-zinc-300">
        {pctNoDec(value)}
      </span>
      <span className="relative h-1 w-12 overflow-hidden rounded-full bg-ink-700">
        <span
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${pct * 100}%`, background: color }}
        />
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
  return (
    <span
      className={`inline-flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold ring-1 ring-inset ${tones[rating]}`}
    >
      {rating}
    </span>
  );
}

function RecommendationTag({
  recommendation,
}: {
  recommendation: Recommendation;
}) {
  const map = {
    buy: {
      label: "Sim",
      cls: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/25",
    },
    hold: {
      label: "Manter",
      cls: "bg-zinc-500/20 text-zinc-300 ring-zinc-500/30",
    },
    sell: {
      label: "Não",
      cls: "bg-rose-500/15 text-rose-300 ring-rose-500/25",
    },
  } as const;
  const r = map[recommendation];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${r.cls}`}
    >
      {r.label}
    </span>
  );
}

function DarkGhostButton({
  children,
  icon,
  ...props
}: { icon?: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-ink-700 bg-ink-800 px-3 text-xs font-medium text-zinc-300 transition-colors hover:border-ink-700 hover:bg-ink-700/60 hover:text-zinc-50"
    >
      {icon}
      {children}
    </button>
  );
}

function DarkPrimaryButton({
  children,
  icon,
  ...props
}: { icon?: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="inline-flex h-8 items-center gap-1.5 rounded-md bg-gold-400 px-3 text-xs font-semibold text-ink-900 transition-colors hover:bg-gold-300"
    >
      {icon}
      {children}
    </button>
  );
}

function fmtCompact(n: number) {
  return n.toLocaleString("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  });
}

function fmtMoney(n: number, currency: "R$" | "US$") {
  if (currency === "US$") {
    return (
      "US$ " +
      n.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }
  return fmtBRL(n);
}

function pctNoDec(n: number) {
  return `${Math.round(n * 100)}%`;
}

/* ---------- Icons (Lucide-style) ---------- */

function CategoryIcon({ name }: { name: IconName }) {
  const cls = "h-4 w-4";
  const baseProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: cls,
  };
  if (name === "bar-chart")
    return (
      <svg {...baseProps}>
        <path d="M3 3v18h18" />
        <path d="M18 17V9" />
        <path d="M13 17V5" />
        <path d="M8 17v-3" />
      </svg>
    );
  if (name === "building")
    return (
      <svg {...baseProps}>
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
        <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
        <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
        <path d="M10 6h4" />
        <path d="M10 10h4" />
        <path d="M10 14h4" />
        <path d="M10 18h4" />
      </svg>
    );
  if (name === "globe")
    return (
      <svg {...baseProps}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </svg>
    );
  if (name === "bitcoin")
    return (
      <svg {...baseProps}>
        <path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727" />
      </svg>
    );
  return (
    <svg {...baseProps}>
      <line x1="3" x2="21" y1="22" y2="22" />
      <line x1="6" x2="6" y1="18" y2="11" />
      <line x1="10" x2="10" y1="18" y2="11" />
      <line x1="14" x2="14" y1="18" y2="11" />
      <line x1="18" x2="18" y1="18" y2="11" />
      <polygon points="12 2 20 7 4 7" />
    </svg>
  );
}

function ArrowIcon({ direction }: { direction: "up" | "down" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
    >
      {direction === "up" ? (
        <>
          <path d="M12 19V5" />
          <path d="m5 12 7-7 7 7" />
        </>
      ) : (
        <>
          <path d="M12 5v14" />
          <path d="m19 12-7 7-7-7" />
        </>
      )}
    </svg>
  );
}

function TrendingIcon({ direction }: { direction: "up" | "down" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      {direction === "up" ? (
        <>
          <path d="M22 7 13.5 15.5 8.5 10.5 2 17" />
          <path d="M16 7h6v6" />
        </>
      ) : (
        <>
          <path d="M22 17 13.5 8.5 8.5 13.5 2 7" />
          <path d="M16 17h6v-6" />
        </>
      )}
    </svg>
  );
}

function PercentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3 text-zinc-500"
    >
      <line x1="19" x2="5" y1="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <line x1="8" x2="21" y1="6" y2="6" />
      <line x1="8" x2="21" y1="12" y2="12" />
      <line x1="8" x2="21" y1="18" y2="18" />
      <line x1="3" x2="3.01" y1="6" y2="6" />
      <line x1="3" x2="3.01" y1="12" y2="12" />
      <line x1="3" x2="3.01" y1="18" y2="18" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <path d="M3 3v18h18" />
      <path d="m7 14 4-4 4 4 5-5" />
    </svg>
  );
}

function ColumnsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M12 3v18" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="h-3.5 w-3.5"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
