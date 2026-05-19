import {
  Chip,
  KpiCard,
  PageHeader,
  Section,
  fmtPct,
} from "../_components/ui";

const MONTHS = [
  "Mai/24",
  "Jun/24",
  "Jul/24",
  "Ago/24",
  "Set/24",
  "Out/24",
  "Nov/24",
  "Dez/24",
  "Jan/25",
  "Fev/25",
  "Mar/25",
  "Abr/25",
];

const PORTFOLIO = [
  0.0, 0.018, 0.041, 0.029, 0.062, 0.078, 0.095, 0.124, 0.142, 0.151, 0.168,
  0.183,
];
const CDI = [
  0.0, 0.009, 0.019, 0.028, 0.037, 0.047, 0.057, 0.067, 0.077, 0.088, 0.099,
  0.112,
];
const IBOV = [
  0.0, 0.024, 0.036, 0.018, 0.052, 0.071, 0.082, 0.108, 0.119, 0.124, 0.135,
  0.141,
];

const MONTHLY_RETURNS = [
  0.0, 0.018, 0.023, -0.012, 0.033, 0.016, 0.017, 0.029, 0.018, 0.009, 0.017,
  0.015,
];

export default function PerformancePage() {
  const best = Math.max(...MONTHLY_RETURNS);
  const worst = Math.min(...MONTHLY_RETURNS);
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Histórico de performance"
        description="12 meses · comparado com CDI e Ibovespa"
        action={<Chip tone="positive">Beat CDI · +7,1 p.p.</Chip>}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="YTD"
          value="+18,30%"
          delta={{ value: "vs 11,2% CDI", positive: true }}
        />
        <KpiCard
          label="Melhor mês"
          value={fmtPct(best, { withSign: true })}
          hint="Set/24"
        />
        <KpiCard
          label="Pior mês"
          value={fmtPct(worst, { withSign: true })}
          hint="Ago/24"
        />
        <KpiCard
          label="Sharpe ratio"
          value="1,84"
          hint="Risco ajustado · 12m"
        />
      </div>

      <Section
        title="Evolução acumulada · 12 meses"
        description="FinFlow vs benchmarks de mercado"
        action={
          <div className="flex items-center gap-3 text-xs">
            <Legend color="#c89b3c" label="FinFlow" />
            <Legend color="#52525b" label="CDI" dashed />
            <Legend color="#9ca3af" label="Ibovespa" dashed />
          </div>
        }
      >
        <PerformanceChart />
      </Section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Section
          title="Heatmap mensal"
          description="Retorno por mês · 12 últimos"
          className="lg:col-span-2"
        >
          <Heatmap returns={MONTHLY_RETURNS} months={MONTHS} />
        </Section>

        <Section
          title="vs Benchmarks"
          description="Diferença acumulada"
        >
          <ul className="flex flex-col divide-y divide-zinc-100">
            <BenchmarkRow
              label="FinFlow"
              value="+18,30%"
              tone="ink"
              bar={1.0}
            />
            <BenchmarkRow
              label="Ibovespa"
              value="+14,10%"
              tone="neutral"
              bar={0.77}
            />
            <BenchmarkRow
              label="CDI"
              value="+11,20%"
              tone="neutral"
              bar={0.61}
            />
            <BenchmarkRow
              label="Inflação (IPCA)"
              value="+4,30%"
              tone="neutral"
              bar={0.23}
            />
          </ul>
        </Section>
      </div>
    </div>
  );
}

function PerformanceChart() {
  const w = 720;
  const h = 240;
  const pad = { l: 40, r: 16, t: 12, b: 28 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const all = [...PORTFOLIO, ...CDI, ...IBOV];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const yToPx = (v: number) =>
    pad.t + (1 - (v - min) / (max - min)) * innerH;
  const xToPx = (i: number) =>
    pad.l + (i / (PORTFOLIO.length - 1)) * innerW;

  const path = (data: number[]) =>
    data
      .map((v, i) => `${i === 0 ? "M" : "L"} ${xToPx(i)} ${yToPx(v)}`)
      .join(" ");

  const areaPath =
    `${path(PORTFOLIO)} L ${xToPx(PORTFOLIO.length - 1)} ${yToPx(min)} ` +
    `L ${xToPx(0)} ${yToPx(min)} Z`;

  const yTicks = [min, (min + max) / 2, max];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-64 w-full">
      <defs>
        <linearGradient id="finflow-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#c89b3c" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#c89b3c" stopOpacity="0" />
        </linearGradient>
      </defs>

      {yTicks.map((t, i) => (
        <g key={i}>
          <line
            x1={pad.l}
            x2={w - pad.r}
            y1={yToPx(t)}
            y2={yToPx(t)}
            stroke="#f4f4f5"
            strokeWidth="1"
          />
          <text
            x={pad.l - 6}
            y={yToPx(t) + 3}
            fontSize="10"
            fill="#a1a1aa"
            textAnchor="end"
          >
            {fmtPct(t)}
          </text>
        </g>
      ))}

      {MONTHS.map((m, i) =>
        i % 2 === 0 ? (
          <text
            key={m}
            x={xToPx(i)}
            y={h - 8}
            fontSize="10"
            fill="#a1a1aa"
            textAnchor="middle"
          >
            {m}
          </text>
        ) : null
      )}

      <path d={areaPath} fill="url(#finflow-grad)" />

      <path
        d={path(IBOV)}
        fill="none"
        stroke="#9ca3af"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      <path
        d={path(CDI)}
        fill="none"
        stroke="#52525b"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      <path
        d={path(PORTFOLIO)}
        fill="none"
        stroke="#c89b3c"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {PORTFOLIO.map((v, i) =>
        i === PORTFOLIO.length - 1 ? (
          <circle
            key={i}
            cx={xToPx(i)}
            cy={yToPx(v)}
            r="4"
            fill="#c89b3c"
            stroke="white"
            strokeWidth="2"
          />
        ) : null
      )}
    </svg>
  );
}

function Heatmap({
  returns,
  months,
}: {
  returns: number[];
  months: string[];
}) {
  const max = Math.max(...returns.map((r) => Math.abs(r)));
  return (
    <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
      {returns.map((r, i) => {
        const intensity = Math.abs(r) / max;
        const positive = r >= 0;
        const bg = positive
          ? `rgba(16, 185, 129, ${0.15 + intensity * 0.55})`
          : `rgba(244, 63, 94, ${0.15 + intensity * 0.55})`;
        return (
          <div
            key={i}
            className="flex flex-col items-center gap-1 rounded-lg p-2 text-center"
            style={{ background: bg }}
            title={`${months[i]}: ${fmtPct(r, { withSign: true })}`}
          >
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-700">
              {months[i].split("/")[0]}
            </span>
            <span
              className={`text-xs font-semibold tabular-nums ${
                positive ? "text-emerald-800" : "text-rose-800"
              }`}
            >
              {fmtPct(r, { withSign: true })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function BenchmarkRow({
  label,
  value,
  tone,
  bar,
}: {
  label: string;
  value: string;
  tone: "ink" | "neutral";
  bar: number;
}) {
  return (
    <li className="flex flex-col gap-2 py-3">
      <div className="flex items-center justify-between text-sm">
        <span className={tone === "ink" ? "font-medium text-ink-900" : "text-zinc-600"}>
          {label}
        </span>
        <span className="font-medium tabular-nums text-ink-900">{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
        <div
          className={`h-full rounded-full ${
            tone === "ink" ? "bg-ink-900" : "bg-zinc-300"
          }`}
          style={{ width: `${bar * 100}%` }}
        />
      </div>
    </li>
  );
}

function Legend({
  color,
  label,
  dashed,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-zinc-500">
      <svg viewBox="0 0 16 4" className="h-1 w-4">
        <line
          x1="0"
          y1="2"
          x2="16"
          y2="2"
          stroke={color}
          strokeWidth="2"
          strokeDasharray={dashed ? "3 3" : undefined}
          strokeLinecap="round"
        />
      </svg>
      {label}
    </span>
  );
}
