import {
  Chip,
  PageHeader,
  Section,
  fmtBRL,
  fmtPct,
} from "../_components/ui";

const SCORE = 84;

const PERFORMANCE_BY_CLASS = [
  { class: "Cripto", color: "#92400e", ytd: 0.412, alloc: 0.08 },
  { class: "Exterior", color: "#475569", ytd: 0.268, alloc: 0.28 },
  { class: "Ações BR", color: "#c89b3c", ytd: 0.171, alloc: 0.32 },
  { class: "Renda fixa", color: "#a1a1aa", ytd: 0.108, alloc: 0.14 },
  { class: "FIIs", color: "#18181b", ytd: 0.058, alloc: 0.18 },
];

const PROJECTION_LOWER = [
  1247382, 1310000, 1396000, 1488000, 1586000, 1690000, 1801000,
];
const PROJECTION_BASE = [
  1247382, 1366000, 1495000, 1635000, 1789000, 1957000, 2141000,
];
const PROJECTION_UPPER = [
  1247382, 1422000, 1620000, 1846000, 2103000, 2396000, 2731000,
];

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Relatórios"
        description="Score financeiro, performance por classe e projeção patrimonial"
        action={
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-3.5 w-3.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Exportar PDF
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Section
          title="Score financeiro"
          description="Saúde global do seu patrimônio"
        >
          <div className="flex flex-col items-center gap-4 py-2">
            <ScoreGauge value={SCORE} />
            <div className="flex flex-col items-center gap-1 text-center">
              <Chip tone="positive">Excelente</Chip>
              <p className="max-w-xs text-xs text-zinc-500">
                Diversificação saudável e poupança acima da média. Melhore a
                exposição a renda fixa de longo prazo.
              </p>
            </div>
          </div>
        </Section>

        <Section
          title="Componentes do score"
          description="Pontuação por dimensão"
          className="lg:col-span-2"
        >
          <ul className="grid gap-3 sm:grid-cols-2">
            <ScoreItem label="Diversificação" score={92} hint="5 classes ativas" />
            <ScoreItem label="Reserva de emergência" score={88} hint="6,2 meses" />
            <ScoreItem label="Taxa de poupança" score={85} hint="38% da renda" />
            <ScoreItem label="Risco da carteira" score={71} hint="Moderado" />
            <ScoreItem label="Custos de corretagem" score={94} hint="0,12% / ano" />
            <ScoreItem
              label="Aderência ao plano"
              score={68}
              hint="2 metas em atraso"
            />
          </ul>
        </Section>
      </div>

      <Section
        title="Performance por classe · YTD"
        description="Contribuição de cada classe para o resultado total"
      >
        <ul className="flex flex-col gap-3">
          {PERFORMANCE_BY_CLASS.map((p) => {
            const max = Math.max(...PERFORMANCE_BY_CLASS.map((x) => x.ytd));
            return (
              <li key={p.class} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: p.color }}
                    />
                    <span className="text-zinc-700">{p.class}</span>
                    <span className="text-xs text-zinc-400">
                      · {fmtPct(p.alloc)} da carteira
                    </span>
                  </span>
                  <span className="font-medium tabular-nums text-emerald-600">
                    {fmtPct(p.ytd, { withSign: true })}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(p.ytd / max) * 100}%`,
                      background: p.color,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section
        title="Projeção patrimonial · 5 anos"
        description="Cenários otimista, base e conservador (aporte mensal de R$ 12k)"
        action={
          <div className="flex items-center gap-3 text-xs">
            <Legend color="#c89b3c" label="Cenário base" />
            <Legend color="#d4a574" label="Faixa de confiança" />
          </div>
        }
      >
        <ProjectionChart />

        <div className="mt-4 grid gap-3 border-t border-zinc-100 pt-4 sm:grid-cols-3">
          <ProjectionStat
            label="Conservador"
            value={fmtBRL(PROJECTION_LOWER[6], { compact: true })}
            tone="zinc"
          />
          <ProjectionStat
            label="Base"
            value={fmtBRL(PROJECTION_BASE[6], { compact: true })}
            tone="gold"
          />
          <ProjectionStat
            label="Otimista"
            value={fmtBRL(PROJECTION_UPPER[6], { compact: true })}
            tone="zinc"
          />
        </div>
      </Section>
    </div>
  );
}

function ScoreGauge({ value }: { value: number }) {
  const radius = 64;
  const circumference = Math.PI * radius;
  const dash = (value / 100) * circumference;
  return (
    <div className="relative">
      <svg viewBox="0 0 160 96" className="h-32 w-44">
        <path
          d="M 16 84 A 64 64 0 0 1 144 84"
          fill="none"
          stroke="#f4f4f5"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M 16 84 A 64 64 0 0 1 144 84"
          fill="none"
          stroke="#c89b3c"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-2 flex flex-col items-center">
        <span className="text-3xl font-semibold tracking-tight text-ink-900">
          {value}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-zinc-400">
          de 100
        </span>
      </div>
    </div>
  );
}

function ScoreItem({
  label,
  score,
  hint,
}: {
  label: string;
  score: number;
  hint: string;
}) {
  const tone =
    score >= 85
      ? "bg-emerald-500"
      : score >= 70
      ? "bg-gold-500"
      : "bg-rose-500";
  return (
    <li className="flex flex-col gap-1.5 rounded-xl border border-zinc-100 bg-zinc-50/60 p-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-700">{label}</span>
        <span className="font-medium tabular-nums text-ink-900">{score}</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-200/70">
        <div
          className={`h-full rounded-full ${tone}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs text-zinc-500">{hint}</span>
    </li>
  );
}

function ProjectionChart() {
  const w = 720;
  const h = 220;
  const pad = { l: 50, r: 16, t: 12, b: 28 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const all = [...PROJECTION_LOWER, ...PROJECTION_UPPER];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const yToPx = (v: number) =>
    pad.t + (1 - (v - min) / (max - min)) * innerH;
  const xToPx = (i: number) =>
    pad.l + (i / (PROJECTION_BASE.length - 1)) * innerW;

  const path = (data: number[]) =>
    data.map((v, i) => `${i === 0 ? "M" : "L"} ${xToPx(i)} ${yToPx(v)}`).join(" ");

  const bandPath =
    PROJECTION_UPPER.map(
      (v, i) => `${i === 0 ? "M" : "L"} ${xToPx(i)} ${yToPx(v)}`
    ).join(" ") +
    " " +
    PROJECTION_LOWER.slice()
      .reverse()
      .map((v, i) => {
        const idx = PROJECTION_LOWER.length - 1 - i;
        return `L ${xToPx(idx)} ${yToPx(v)}`;
      })
      .join(" ") +
    " Z";

  const labels = ["Hoje", "+1a", "+2a", "+3a", "+4a", "+5a", "Total"];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-56 w-full">
      <defs>
        <linearGradient id="band-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#d4a574" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#d4a574" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {[min, (min + max) / 2, max].map((t, i) => (
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
            {fmtBRL(t, { compact: true })}
          </text>
        </g>
      ))}

      <path d={bandPath} fill="url(#band-grad)" />

      <path
        d={path(PROJECTION_BASE)}
        fill="none"
        stroke="#c89b3c"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {labels.map((l, i) =>
        i < PROJECTION_BASE.length ? (
          <text
            key={l + i}
            x={xToPx(i)}
            y={h - 8}
            fontSize="10"
            fill="#a1a1aa"
            textAnchor="middle"
          >
            {l}
          </text>
        ) : null
      )}
    </svg>
  );
}

function ProjectionStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "gold" | "zinc";
}) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-xl p-3 ${
        tone === "gold"
          ? "bg-gold-200/30 ring-1 ring-inset ring-gold-300/40"
          : "bg-zinc-50 ring-1 ring-inset ring-zinc-100"
      }`}
    >
      <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <span
        className={`text-lg font-semibold tabular-nums ${
          tone === "gold" ? "text-gold-600" : "text-ink-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-zinc-500">
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
