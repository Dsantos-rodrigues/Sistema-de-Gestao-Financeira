import {
  Chip,
  KpiCard,
  PageHeader,
  Section,
  fmtBRL,
  fmtPct,
} from "../_components/ui";

const CLASS_COLORS = {
  acoes: "#c89b3c",
  fiis: "#18181b",
  exterior: "#475569",
  cripto: "#92400e",
  rf: "#a1a1aa",
} as const;

const ALLOCATION = [
  {
    key: "acoes" as const,
    label: "Ações BR",
    value: 399382,
    pct: 0.32,
    color: CLASS_COLORS.acoes,
  },
  {
    key: "exterior" as const,
    label: "Exterior",
    value: 349267,
    pct: 0.28,
    color: CLASS_COLORS.exterior,
  },
  {
    key: "fiis" as const,
    label: "FIIs",
    value: 224529,
    pct: 0.18,
    color: CLASS_COLORS.fiis,
  },
  {
    key: "rf" as const,
    label: "Renda fixa",
    value: 174634,
    pct: 0.14,
    color: CLASS_COLORS.rf,
  },
  {
    key: "cripto" as const,
    label: "Cripto",
    value: 99570,
    pct: 0.08,
    color: CLASS_COLORS.cripto,
  },
];

const ASSETS = [
  {
    ticker: "VALE3",
    name: "Vale ON",
    cls: "Ações BR",
    clsKey: "acoes" as const,
    qty: 800,
    price: 67.42,
    return: 0.184,
    risk: 58,
  },
  {
    ticker: "ITUB4",
    name: "Itaú PN",
    cls: "Ações BR",
    clsKey: "acoes" as const,
    qty: 1200,
    price: 38.91,
    return: 0.213,
    risk: 42,
  },
  {
    ticker: "PETR4",
    name: "Petrobras PN",
    cls: "Ações BR",
    clsKey: "acoes" as const,
    qty: 600,
    price: 41.78,
    return: 0.094,
    risk: 71,
  },
  {
    ticker: "HGLG11",
    name: "CSHG Logística",
    cls: "FIIs",
    clsKey: "fiis" as const,
    qty: 850,
    price: 162.34,
    return: 0.072,
    risk: 28,
  },
  {
    ticker: "KNRI11",
    name: "Kinea Renda Imob.",
    cls: "FIIs",
    clsKey: "fiis" as const,
    qty: 420,
    price: 148.9,
    return: 0.041,
    risk: 24,
  },
  {
    ticker: "VOO",
    name: "Vanguard S&P 500",
    cls: "Exterior",
    clsKey: "exterior" as const,
    qty: 180,
    price: 521.14,
    return: 0.241,
    risk: 38,
  },
  {
    ticker: "QQQM",
    name: "Invesco Nasdaq",
    cls: "Exterior",
    clsKey: "exterior" as const,
    qty: 220,
    price: 187.55,
    return: 0.297,
    risk: 52,
  },
  {
    ticker: "BTC",
    name: "Bitcoin",
    cls: "Cripto",
    clsKey: "cripto" as const,
    qty: 0.42,
    price: 178420,
    return: 0.412,
    risk: 88,
  },
  {
    ticker: "ETH",
    name: "Ethereum",
    cls: "Cripto",
    clsKey: "cripto" as const,
    qty: 6.8,
    price: 14820,
    return: 0.286,
    risk: 84,
  },
  {
    ticker: "TESOURO IPCA+ 2035",
    name: "Tesouro Direto",
    cls: "Renda fixa",
    clsKey: "rf" as const,
    qty: 1,
    price: 174634,
    return: 0.108,
    risk: 12,
  },
];

const TOTAL = ALLOCATION.reduce((s, a) => s + a.value, 0);

export default function PortfolioPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Portfólio de ativos"
        description="Visão consolidada do seu patrimônio em todas as classes."
        action={
          <div className="flex items-center gap-2">
            <Chip tone="gold">Open Finance · 4 instituições</Chip>
            <Chip tone="neutral">Atualizado há 2 min</Chip>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Patrimônio total"
          value={fmtBRL(TOTAL)}
          delta={{ value: "+2,4% mês", positive: true }}
        />
        <KpiCard
          label="Rentabilidade YTD"
          value="+18,30%"
          delta={{ value: "vs CDI 11,2%", positive: true }}
          hint="Ibovespa: +14,1%"
        />
        <KpiCard
          label="Aporte mensal"
          value={fmtBRL(12000)}
          hint="Próximo: 05 jun"
        />
        <KpiCard
          label="Ativos sob gestão"
          value={String(ASSETS.length)}
          hint="5 classes · 4 instituições"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Section
          title="Alocação por classe"
          description="Distribuição atual do patrimônio"
          className="lg:col-span-2"
        >
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <Donut data={ALLOCATION} total={TOTAL} />
            <ul className="flex w-full flex-col gap-3">
              {ALLOCATION.map((a) => (
                <li
                  key={a.key}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: a.color }}
                    />
                    <span className="text-zinc-700">{a.label}</span>
                  </span>
                  <span className="flex items-baseline gap-2">
                    <span className="font-medium text-ink-900">
                      {fmtPct(a.pct)}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {fmtBRL(a.value, { compact: true })}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section
          title="Risco × retorno"
          description="Cada ativo plotado por volatilidade e retorno YTD"
          className="lg:col-span-3"
        >
          <RiskReturnScatter />
        </Section>
      </div>

      <Section
        title="Ativos"
        description={`${ASSETS.length} posições em 5 classes`}
        action={
          <button
            type="button"
            className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900"
          >
            Filtrar
          </button>
        }
        bodyPadding={false}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-3 text-left">Ativo</th>
                <th className="px-6 py-3 text-left">Classe</th>
                <th className="px-6 py-3 text-right">Qtd.</th>
                <th className="px-6 py-3 text-right">Preço</th>
                <th className="px-6 py-3 text-right">Posição</th>
                <th className="px-6 py-3 text-right">Retorno YTD</th>
                <th className="px-6 py-3 text-right">Risco</th>
              </tr>
            </thead>
            <tbody>
              {ASSETS.map((a) => {
                const position = a.qty * a.price;
                return (
                  <tr
                    key={a.ticker}
                    className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/60"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-medium text-ink-900">
                          {a.ticker}
                        </span>
                        <span className="text-xs text-zinc-500">{a.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <ClassChip clsKey={a.clsKey} label={a.cls} />
                    </td>
                    <td className="px-6 py-3.5 text-right tabular-nums text-zinc-700">
                      {a.qty < 10
                        ? a.qty.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })
                        : a.qty.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-6 py-3.5 text-right tabular-nums text-zinc-700">
                      {fmtBRL(a.price)}
                    </td>
                    <td className="px-6 py-3.5 text-right tabular-nums font-medium text-ink-900">
                      {fmtBRL(position)}
                    </td>
                    <td
                      className={`px-6 py-3.5 text-right tabular-nums font-medium ${
                        a.return >= 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {fmtPct(a.return, { withSign: true })}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <RiskMeter value={a.risk} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function Donut({
  data,
  total,
}: {
  data: typeof ALLOCATION;
  total: number;
}) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const segments = data.reduce<
    { key: string; color: string; dash: number; offset: number }[]
  >((acc, d) => {
    const dash = (d.value / total) * circumference;
    const last = acc[acc.length - 1];
    const offset = last ? last.offset + last.dash : 0;
    acc.push({ key: d.key, color: d.color, dash, offset });
    return acc;
  }, []);
  return (
    <div className="relative">
      <svg viewBox="0 0 140 140" className="h-40 w-40 -rotate-90">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#f4f4f5"
          strokeWidth="14"
        />
        {segments.map((s) => (
          <circle
            key={s.key}
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth="14"
            strokeDasharray={`${s.dash} ${circumference}`}
            strokeDashoffset={-s.offset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] uppercase tracking-wider text-zinc-400">
          Total
        </span>
        <span className="text-base font-semibold text-ink-900">
          {fmtBRL(total, { compact: true })}
        </span>
      </div>
    </div>
  );
}

function RiskReturnScatter() {
  const xToPx = (x: number) => 40 + (x / 100) * 360;
  const yToPx = (y: number) => 130 - ((y + 0.1) / 0.6) * 110;

  return (
    <div className="w-full">
      <svg viewBox="0 0 420 160" className="h-56 w-full">
        <line
          x1="40"
          y1="130"
          x2="410"
          y2="130"
          stroke="#e4e4e7"
          strokeWidth="1"
        />
        <line
          x1="40"
          y1="20"
          x2="40"
          y2="130"
          stroke="#e4e4e7"
          strokeWidth="1"
        />
        <line
          x1="40"
          y1={yToPx(0)}
          x2="410"
          y2={yToPx(0)}
          stroke="#e4e4e7"
          strokeWidth="1"
          strokeDasharray="2 3"
        />

        {ASSETS.map((a) => {
          const cx = xToPx(a.risk);
          const cy = yToPx(a.return);
          return (
            <g key={a.ticker}>
              <circle
                cx={cx}
                cy={cy}
                r={8}
                fill={CLASS_COLORS[a.clsKey]}
                fillOpacity="0.85"
              />
              <text
                x={cx}
                y={cy - 12}
                fontSize="9"
                fill="#3f3f46"
                textAnchor="middle"
                fontWeight="500"
              >
                {a.ticker}
              </text>
            </g>
          );
        })}

        <text x="40" y="148" fontSize="9" fill="#a1a1aa">
          Baixo risco
        </text>
        <text x="410" y="148" fontSize="9" fill="#a1a1aa" textAnchor="end">
          Alto risco
        </text>
        <text x="36" y="24" fontSize="9" fill="#a1a1aa" textAnchor="end">
          +50%
        </text>
        <text x="36" y={yToPx(0) + 3} fontSize="9" fill="#a1a1aa" textAnchor="end">
          0%
        </text>
        <text x="36" y="133" fontSize="9" fill="#a1a1aa" textAnchor="end">
          -10%
        </text>
      </svg>
    </div>
  );
}

function ClassChip({
  clsKey,
  label,
}: {
  clsKey: keyof typeof CLASS_COLORS;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-700">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: CLASS_COLORS[clsKey] }}
      />
      {label}
    </span>
  );
}

function RiskMeter({ value }: { value: number }) {
  const tone =
    value < 30 ? "bg-emerald-500" : value < 60 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="ml-auto flex items-center justify-end gap-2">
      <span className="text-xs tabular-nums text-zinc-500">{value}</span>
      <span className="relative h-1.5 w-16 overflow-hidden rounded-full bg-zinc-100">
        <span
          className={`absolute inset-y-0 left-0 rounded-full ${tone}`}
          style={{ width: `${value}%` }}
        />
      </span>
    </div>
  );
}
