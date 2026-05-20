"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { AssetResponse, RelatorioResponse } from "../../lib/types";
import { Chip, PageHeader, Section, fmtBRL, fmtPct } from "../_components/ui";

const CLASS_META: Record<string, { label: string; color: string }> = {
  STOCK:        { label: "Ações",      color: "#c89b3c" },
  REAL_ESTATE:  { label: "FIIs",       color: "#92400e" },
  FUND:         { label: "ETFs",       color: "#1d4ed8" },
  CRYPTO:       { label: "Cripto",     color: "#047857" },
  FIXED_INCOME: { label: "Renda Fixa", color: "#475569" },
  OTHER:        { label: "Outros",     color: "#a1a1aa" },
};

function buildPerformanceByClass(assets: AssetResponse[]) {
  const groups: Record<string, { totalValue: number; totalCost: number }> = {};
  const grandTotal = assets.reduce((s, a) => s + a.totalValue, 0);
  for (const a of assets) {
    if (!groups[a.type]) groups[a.type] = { totalValue: 0, totalCost: 0 };
    groups[a.type].totalValue += a.totalValue;
    groups[a.type].totalCost  += a.totalCost;
  }
  return Object.entries(groups).map(([type, g]) => ({
    class: CLASS_META[type]?.label ?? type,
    color: CLASS_META[type]?.color ?? "#a1a1aa",
    ytd:   g.totalCost > 0 ? (g.totalValue - g.totalCost) / g.totalCost : 0,
    alloc: grandTotal > 0 ? g.totalValue / grandTotal : 0,
  }));
}

const PROJ_RATES = { conservador: 0.10 / 12, base: 0.135 / 12, otimista: 0.20 / 12 };

// recalcula a projeção client-side para qualquer número de anos
function buildProjectionClient(initial: number, aporte: number, totalYears: number) {
  const build = (rate: number) => {
    const pts = [initial];
    for (let m = 1; m <= totalYears * 12; m++) pts.push(pts[m - 1] * (1 + rate) + aporte);
    return pts;
  };
  return { conservador: build(PROJ_RATES.conservador), base: build(PROJ_RATES.base), otimista: build(PROJ_RATES.otimista) };
}

// selectedYear null = visão geral (pontos anuais); number = detalhe mensal daquele ano
function getView(monthly: number[], totalYears: number, selectedYear: number | null) {
  if (selectedYear === null) {
    const indices = Array.from({ length: totalYears + 1 }, (_, i) => i * 12);
    return {
      values: indices.map((i) => monthly[i]),
      labels: ["Hoje", ...Array.from({ length: totalYears }, (_, i) => `Ano ${i + 1}`)],
    };
  }
  const start = 12 * (selectedYear - 1);
  const indices = Array.from({ length: 13 }, (_, i) => start + i);
  return {
    values: indices.map((i) => monthly[i]),
    labels: [selectedYear === 1 ? "Hoje" : `Ano ${selectedYear - 1}`, ...Array.from({ length: 12 }, (_, i) => `M${i + 1}`)],
  };
}

export default function ReportsPage() {
  const [relatorio, setRelatorio] = useState<RelatorioResponse | null>(null);
  const [assets, setAssets]       = useState<AssetResponse[]>([]);
  const [loading, setLoading]     = useState(true);
  const [totalYears, setTotalYears] = useState(5); // total de anos a projetar (padrão 5)

  useEffect(() => {
    Promise.all([
      api.get<RelatorioResponse>("/patrimonio/relatorio"),
      api.get<AssetResponse[]>("/assets"),
    ])
      .then(([r, a]) => { setRelatorio(r); setAssets(a); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const performanceByClass = buildPerformanceByClass(assets);
  const score = relatorio?.score ?? 0;
  const scoreLabel = relatorio?.scoreLabel ?? "Sem dados";
  const hasScore = !loading && relatorio != null;
  const hasProjecao = !loading && relatorio != null;

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
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Exportar PDF
          </button>
        }
      />

      {/* Score */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Section title="Score financeiro" description="Saúde global do seu patrimônio">
          <div className="flex flex-col items-center gap-4 py-2">
            <ScoreGauge value={score} />
            <div className="flex flex-col items-center gap-1 text-center">
              <Chip tone={score >= 81 ? "positive" : score >= 61 ? "gold" : score >= 41 ? "neutral" : "negative"}>
                {loading ? "Calculando..." : scoreLabel}
              </Chip>
              {!hasScore && (
                <p className="max-w-xs text-xs text-zinc-500">
                  Adicione ativos e transações para calcular seu score financeiro.
                </p>
              )}
            </div>
          </div>
        </Section>

        <Section title="Componentes do score" description="Pontuação por dimensão" className="lg:col-span-2">
          {loading ? (
            <div className="flex h-full items-center justify-center py-8">
              <span className="text-sm text-zinc-500">Calculando...</span>
            </div>
          ) : !hasScore || (relatorio?.scoreComponents ?? []).length === 0 ? (
            <div className="flex h-full items-center justify-center py-8">
              <span className="text-sm font-medium text-zinc-400">Sem dados suficientes para calcular o score</span>
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {relatorio!.scoreComponents.map((c) => (
                <ScoreItem key={c.label} label={c.label} score={c.score} hint={c.hint} />
              ))}
            </ul>
          )}
        </Section>
      </div>

      {/* Performance por classe */}
      <Section title="Performance por classe · YTD" description="Contribuição de cada classe para o resultado total">
        {performanceByClass.length === 0 ? (
          <div className="flex h-24 items-center justify-center">
            <span className="text-sm font-medium text-zinc-400">Nenhum ativo registrado</span>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {performanceByClass.map((p) => {
              const maxAbs = Math.max(...performanceByClass.map((x) => Math.abs(x.ytd)), 0.0001);
              return (
                <li key={p.class} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                      <span className="font-medium text-zinc-100">{p.class}</span>
                      <span className="text-xs text-zinc-400">· {fmtPct(p.alloc)} da carteira</span>
                    </span>
                    <span className={`font-medium tabular-nums ${p.ytd >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {fmtPct(p.ytd, { withSign: true })}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(Math.abs(p.ytd) / maxAbs) * 100}%`, background: p.color }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {/* Projeção */}
      {(() => {
        // projeção recalculada client-side quando totalYears muda
        const initial  = relatorio?.projecao.monthly.base[0] ?? 0;
        const aporte   = relatorio?.projecao.aporteMensal ?? 0;
        const monthly  = relatorio ? buildProjectionClient(initial, aporte, totalYears) : null;
        const endIdx = totalYears * 12;
        const title  = `Projeção patrimonial · ${totalYears} ${totalYears === 1 ? "ano" : "anos"}`;

        return (
          <Section
            title={title}
            description={`Cenários conservador, base e otimista · Aporte mensal: ${relatorio ? fmtBRL(aporte) : "—"}`}
            action={
              <div className="flex items-center gap-2">
                {/* controle de total de anos */}
                <div className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-white/5 px-1 h-7">
                  <button
                    type="button"
                    onClick={() => setTotalYears((y) => Math.max(1, y - 1))}
                    className="w-6 text-center text-zinc-400 hover:text-white transition-colors text-sm leading-none"
                  >−</button>
                  <span className="w-10 text-center text-[11px] font-semibold tabular-nums text-zinc-200">
                    {totalYears} {totalYears === 1 ? "ano" : "anos"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setTotalYears((y) => Math.min(20, y + 1))}
                    className="w-6 text-center text-zinc-400 hover:text-white transition-colors text-sm leading-none"
                  >+</button>
                </div>

              </div>
            }
          >
            {loading ? (
              <div className="flex h-56 items-center justify-center">
                <span className="text-sm text-zinc-500">Calculando projeção...</span>
              </div>
            ) : !monthly ? (
              <div className="flex h-56 items-center justify-center">
                <span className="text-sm font-medium text-zinc-400">Sem dados para projeção patrimonial</span>
              </div>
            ) : (
              <>
                <ProjectionChart monthly={monthly} totalYears={totalYears} />
                <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-3">
                  {(["conservador", "base", "otimista"] as const).map((s) => (
                    <ProjectionStat
                      key={s}
                      label={s.charAt(0).toUpperCase() + s.slice(1)}
                      value={fmtBRL(monthly[s][endIdx], { compact: true })}
                      tone={s === "base" ? "gold" : "zinc"}
                    />
                  ))}
                </div>
              </>
            )}
          </Section>
        );
      })()}

    </div>
  );
}

function ProjectionChart({
  monthly,
  totalYears,
}: {
  monthly: { conservador: number[]; base: number[]; otimista: number[] };
  totalYears: number;
}) {
  const baseView  = getView(monthly.base, totalYears, null);
  const lowerView = getView(monthly.conservador, totalYears, null);
  const upperView = getView(monthly.otimista, totalYears, null);

  const w = 720; const h = 220;
  const pad = { l: 58, r: 16, t: 12, b: 28 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;

  const allVals = [...lowerView.values, ...upperView.values];
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const range = maxV - minV || 1;

  const yToPx = (v: number) => pad.t + (1 - (v - minV) / range) * innerH;
  const xToPx = (i: number) => pad.l + (i / (baseView.values.length - 1)) * innerW;

  const linePath = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? "M" : "L"} ${xToPx(i)} ${yToPx(v)}`).join(" ");

  // faixa de confiança entre conservador e otimista
  const bandPath =
    upperView.values.map((v, i) => `${i === 0 ? "M" : "L"} ${xToPx(i)} ${yToPx(v)}`).join(" ") +
    " " +
    lowerView.values
      .slice()
      .reverse()
      .map((v, i) => `L ${xToPx(lowerView.values.length - 1 - i)} ${yToPx(v)}`)
      .join(" ") +
    " Z";

  const yTicks = [minV, (minV + maxV) / 2, maxV];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-56 w-full">
      <defs>
        <linearGradient id="proj-band" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#d4a574" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#d4a574" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={pad.l} x2={w - pad.r} y1={yToPx(t)} y2={yToPx(t)} stroke="#3f3f46" strokeWidth="1" />
          <text x={pad.l - 6} y={yToPx(t) + 3} fontSize="10" fill="#a1a1aa" textAnchor="end">
            {fmtBRL(t, { compact: true })}
          </text>
        </g>
      ))}

      {baseView.labels.map((l, i) => (
        <text key={l + i} x={xToPx(i)} y={h - 8} fontSize="10" fill="#a1a1aa" textAnchor="middle">
          {l}
        </text>
      ))}

      {/* faixa conservador → otimista */}
      <path d={bandPath} fill="url(#proj-band)" />

      {/* linhas conservador e otimista */}
      <path d={linePath(lowerView.values)} fill="none" stroke="#a1a1aa" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d={linePath(upperView.values)} fill="none" stroke="#a1a1aa" strokeWidth="1.5" strokeDasharray="3 3" />

      {/* linha base */}
      <path d={linePath(baseView.values)} fill="none" stroke="#c89b3c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* ponto final */}
      <circle
        cx={xToPx(baseView.values.length - 1)}
        cy={yToPx(baseView.values[baseView.values.length - 1])}
        r="4" fill="#c89b3c" stroke="white" strokeWidth="2"
      />
    </svg>
  );
}

function ScoreGauge({ value }: { value: number }) {
  const radius = 64;
  const circumference = Math.PI * radius;
  const dash = (value / 100) * circumference;
  return (
    <div className="relative">
      <svg viewBox="0 0 160 96" className="h-32 w-44">
        <path d="M 16 84 A 64 64 0 0 1 144 84" fill="none" stroke="#f4f4f5" strokeWidth="14" strokeLinecap="round" />
        <path
          d="M 16 84 A 64 64 0 0 1 144 84"
          fill="none"
          stroke={value >= 81 ? "#059669" : value >= 61 ? "#c89b3c" : value >= 41 ? "#f59e0b" : "#ef4444"}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-2 flex flex-col items-center">
        <span className="text-3xl font-semibold tracking-tight text-white">{value}</span>
        <span className="text-[10px] uppercase tracking-wider text-zinc-500">de 100</span>
      </div>
    </div>
  );
}

function ScoreItem({ label, score, hint }: { label: string; score: number; hint: string }) {
  const barColor = score >= 85 ? "#059669" : score >= 70 ? "#c89b3c" : "#e11d48";
  return (
    <li className="flex flex-col gap-1.5 rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-300">{label}</span>
        <span className="font-semibold tabular-nums text-white">{score}</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: barColor }} />
      </div>
      <span className="text-xs text-zinc-500">{hint}</span>
    </li>
  );
}

function ProjectionStat({ label, value, tone }: { label: string; value: string; tone: "gold" | "zinc" }) {
  return (
    <div className={`flex flex-col gap-1 rounded-xl p-4 ${
      tone === "gold"
        ? "bg-gold-400/10 ring-1 ring-inset ring-gold-400/25"
        : "bg-white/5 ring-1 ring-inset ring-white/10"
    }`}>
      <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</span>
      <span className={`text-xl font-semibold tabular-nums ${tone === "gold" ? "text-gold-400" : "text-zinc-200"}`}>
        {value}
      </span>
    </div>
  );
}
