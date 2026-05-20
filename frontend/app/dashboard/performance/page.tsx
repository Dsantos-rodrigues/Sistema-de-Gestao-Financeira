"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { PerformanceResponse } from "../../lib/types";
import { KpiCard, PageHeader, Section, fmtPct } from "../_components/ui";

export default function PerformancePage() {
  const [data, setData] = useState<PerformanceResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<PerformanceResponse>("/patrimonio/performance")
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const hasData = data && data.portfolio.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Histórico de performance"
        description="12 meses · comparado com CDI e Ibovespa"
      />

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="YTD"
          value={loading ? "..." : data?.ytd != null ? fmtPct(data.ytd, { withSign: true }) : "—"}
          delta={
            !loading && data?.ytd != null
              ? { value: fmtPct(data.ytd, { withSign: true }), positive: data.ytd >= 0 }
              : undefined
          }
        />
        <KpiCard
          label="Melhor mês"
          value={
            loading ? "..." : data?.bestMonth != null
              ? fmtPct(data.bestMonth, { withSign: true })
              : "—"
          }
        />
        <KpiCard
          label="Pior mês"
          value={
            loading ? "..." : data?.worstMonth != null
              ? fmtPct(data.worstMonth, { withSign: true })
              : "—"
          }
        />
        <KpiCard
          label="Sharpe ratio"
          value={loading ? "..." : data?.sharpe != null ? String(data.sharpe) : "—"}
          hint="Anualizado, rf = CDI"
        />
      </div>

      {/* Gráfico de linha */}
      <Section
        title="Evolução acumulada · 12 meses"
        description="FinFlow vs benchmarks de mercado"
        action={
          <div className="flex items-center gap-3 text-xs">
            <ChartLegend color="#c89b3c" label="FinFlow" />
            <ChartLegend color="#52525b" label="CDI" dashed />
            <ChartLegend color="#9ca3af" label="Ibovespa" dashed />
          </div>
        }
      >
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <span className="text-sm text-zinc-500">Carregando...</span>
          </div>
        ) : !hasData ? (
          <div className="flex h-64 items-center justify-center">
            <span className="text-sm font-medium text-zinc-400">Sem histórico de performance</span>
          </div>
        ) : (
          <PerformanceChart data={data} />
        )}
      </Section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Heatmap */}
        <Section
          title="Heatmap mensal"
          description="Retorno por mês · 12 últimos"
          className="lg:col-span-2"
        >
          {loading ? (
            <div className="flex h-24 items-center justify-center">
              <span className="text-sm text-zinc-500">Carregando...</span>
            </div>
          ) : !hasData || !data.monthlyReturns.length ? (
            <div className="flex h-24 items-center justify-center">
              <span className="text-sm font-medium text-zinc-400">Sem dados de retorno mensal</span>
            </div>
          ) : (
            <Heatmap returns={data.monthlyReturns} months={data.months} />
          )}
        </Section>

        {/* vs Benchmarks */}
        <Section title="vs Benchmarks" description="Diferença acumulada">
          <ul className="flex flex-col divide-y divide-white/5">
            <BenchmarkRow
              label="FinFlow"
              value={data?.ytd != null ? fmtPct(data.ytd, { withSign: true }) : "—"}
              tone="ink"
              bar={data?.ytd != null ? Math.min(Math.abs(data.ytd), 1) : 0}
            />
            <BenchmarkRow
              label="Ibovespa"
              value={
                data?.ibov?.length
                  ? fmtPct(data.ibov[data.ibov.length - 1], { withSign: true })
                  : "—"
              }
              tone="neutral"
              bar={
                data?.ibov?.length
                  ? Math.min(Math.abs(data.ibov[data.ibov.length - 1]), 1)
                  : 0
              }
            />
            <BenchmarkRow
              label="CDI"
              value={
                data?.cdi?.length
                  ? fmtPct(data.cdi[data.cdi.length - 1], { withSign: true })
                  : "—"
              }
              tone="neutral"
              bar={
                data?.cdi?.length
                  ? Math.min(Math.abs(data.cdi[data.cdi.length - 1]), 1)
                  : 0
              }
            />
          </ul>
        </Section>
      </div>
    </div>
  );
}

// gráfico de linhas com portfólio, CDI e Ibovespa
function PerformanceChart({ data }: { data: PerformanceResponse }) {
  const w = 720;
  const h = 240;
  const pad = { l: 48, r: 16, t: 12, b: 28 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;

  const allSeries = [data.portfolio, data.cdi, ...(data.ibov.length ? [data.ibov] : [])];
  const allValues = allSeries.flat();
  const minV = Math.min(...allValues);
  const maxV = Math.max(...allValues);
  const range = maxV - minV || 0.01;

  const yToPx = (v: number) => pad.t + (1 - (v - minV) / range) * innerH;
  const xToPx = (i: number) => pad.l + (i / (data.portfolio.length - 1)) * innerW;

  const linePath = (series: number[]) =>
    series.map((v, i) => `${i === 0 ? "M" : "L"} ${xToPx(i)} ${yToPx(v)}`).join(" ");

  // área preenchida sob a linha do portfólio
  const areaPath =
    `${linePath(data.portfolio)} ` +
    `L ${xToPx(data.portfolio.length - 1)} ${yToPx(minV)} ` +
    `L ${xToPx(0)} ${yToPx(minV)} Z`;

  const yTicks = [minV, (minV + maxV) / 2, maxV];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-64 w-full">
      <defs>
        <linearGradient id="perf-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#c89b3c" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#c89b3c" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* linhas de grade e labels do eixo Y */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line
            x1={pad.l} x2={w - pad.r}
            y1={yToPx(t)} y2={yToPx(t)}
            stroke="#3f3f46" strokeWidth="1"
            strokeDasharray={i === 0 ? undefined : "3 3"}
          />
          <text x={pad.l - 6} y={yToPx(t) + 3} fontSize="10" fill="#71717a" textAnchor="end">
            {fmtPct(t, { withSign: true })}
          </text>
        </g>
      ))}

      {/* labels do eixo X (a cada 2 meses) */}
      {data.months.map((m, i) =>
        i % 2 === 0 ? (
          <text key={m} x={xToPx(i)} y={h - 6} fontSize="10" fill="#71717a" textAnchor="middle">
            {m}
          </text>
        ) : null,
      )}

      {/* área do portfólio */}
      <path d={areaPath} fill="url(#perf-grad)" />

      {/* linha Ibovespa */}
      {data.ibov.length > 0 && (
        <path
          d={linePath(data.ibov)}
          fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="3 3"
        />
      )}

      {/* linha CDI */}
      <path
        d={linePath(data.cdi)}
        fill="none" stroke="#52525b" strokeWidth="1.5" strokeDasharray="3 3"
      />

      {/* linha do portfólio */}
      <path
        d={linePath(data.portfolio)}
        fill="none" stroke="#c89b3c" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
      />

      {/* ponto final do portfólio */}
      <circle
        cx={xToPx(data.portfolio.length - 1)}
        cy={yToPx(data.portfolio[data.portfolio.length - 1])}
        r="4" fill="#c89b3c" stroke="white" strokeWidth="2"
      />
    </svg>
  );
}

function Heatmap({ returns, months }: { returns: number[]; months: string[] }) {
  const maxAbs = Math.max(...returns.map((r) => Math.abs(r)), 0.001);
  return (
    <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
      {returns.map((r, i) => {
        const intensity = Math.abs(r) / maxAbs;
        const positive = r >= 0;
        const bg = positive
          ? `rgba(16,185,129,${0.15 + intensity * 0.55})`
          : `rgba(244,63,94,${0.15 + intensity * 0.55})`;
        return (
          <div
            key={i}
            className="flex flex-col items-center gap-1 rounded-lg p-2 text-center"
            style={{ background: bg }}
            title={`${months[i]}: ${fmtPct(r, { withSign: true })}`}
          >
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-300">
              {months[i]?.split(" ")[0]}
            </span>
            <span className={`text-xs font-semibold tabular-nums ${positive ? "text-emerald-300" : "text-rose-300"}`}>
              {fmtPct(r, { withSign: true })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function BenchmarkRow({
  label, value, tone, bar,
}: {
  label: string; value: string; tone: "ink" | "neutral"; bar: number;
}) {
  return (
    <li className="flex flex-col gap-2 py-3">
      <div className="flex items-center justify-between text-sm">
        <span className={tone === "ink" ? "font-semibold text-white" : "text-zinc-400"}>{label}</span>
        <span className="font-medium tabular-nums text-zinc-50">{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${tone === "ink" ? "bg-gold-400" : "bg-zinc-500"}`}
          style={{ width: `${Math.min(bar * 100, 100)}%` }}
        />
      </div>
    </li>
  );
}

function ChartLegend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-zinc-500">
      <svg viewBox="0 0 16 4" className="h-1 w-4">
        <line
          x1="0" y1="2" x2="16" y2="2"
          stroke={color} strokeWidth="2"
          strokeDasharray={dashed ? "3 3" : undefined}
          strokeLinecap="round"
        />
      </svg>
      {label}
    </span>
  );
}
