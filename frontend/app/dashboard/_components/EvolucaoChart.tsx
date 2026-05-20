"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "../../lib/api";
import type { EvolucaoPoint } from "../../lib/types";
import { fmtBRL } from "./ui";

type Point = EvolucaoPoint;
type Period = "6" | "12" | "24" | "all";
type AssetTypeFilter = "" | "STOCK" | "CRYPTO" | "REAL_ESTATE" | "FIXED_INCOME" | "FUND" | "OTHER";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "6", label: "6 MESES" },
  { value: "12", label: "12 MESES" },
  { value: "24", label: "24 MESES" },
  { value: "all", label: "TUDO" },
];

const TYPE_OPTIONS: { value: AssetTypeFilter; label: string }[] = [
  { value: "", label: "TODOS OS TIPOS" },
  { value: "STOCK", label: "AÇÕES" },
  { value: "CRYPTO", label: "CRIPTO" },
  { value: "REAL_ESTATE", label: "FIIs" },
  { value: "FIXED_INCOME", label: "RENDA FIXA" },
  { value: "FUND", label: "FUNDOS" },
  { value: "OTHER", label: "OUTROS" },
];

const W = 720;
const H = 300;
const PAD = { l: 56, r: 16, t: 16, b: 36 };

const COLOR_APLICADO = "#059669";
const COLOR_APLICADO_HOVER = "#047857";
const COLOR_GANHO = "#6EE7B7";
const COLOR_GANHO_HOVER = "#34D399";
const COLOR_PATRIMONIO_DOT = "#7c3aed";

// componente auto-suficiente: busca, filtra e exibe a evolução patrimonial
export function EvolucaoChart() {
  const [rawData, setRawData] = useState<Point[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("12");
  const [assetType, setAssetType] = useState<AssetTypeFilter>("");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  // re-busca quando o tipo de ativo muda (filtro server-side)
  useEffect(() => {
    setLoading(true);
    const params = assetType ? `?assetType=${assetType}` : "";
    api
      .get<Point[]>(`/patrimonio/evolucao${params}`)
      .then(setRawData)
      .catch(() => setRawData([]))
      .finally(() => setLoading(false));
  }, [assetType]);

  // filtro de período é puramente client-side (fatia o array)
  const data = period === "all" ? rawData : rawData.slice(-Number(period));

  if (loading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <span className="text-sm text-zinc-500">Carregando...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center gap-2 text-center">
        <span className="text-sm font-medium text-zinc-400">Sem dados de evolução</span>
        <span className="text-xs text-zinc-500">
          O histórico aparecerá aqui conforme os lançamentos forem registrados.
        </span>
      </div>
    );
  }

  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const max = Math.max(...data.map((d) => d.aplicado + d.ganho));
  const yMax = Math.ceil(max / 200000) * 200000 || 1;
  const yToPx = (v: number) => PAD.t + innerH - (v / yMax) * innerH;
  const sliceW = innerW / data.length;
  const barW = sliceW * 0.55;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((p) => yMax * p);

  const hovered = hoverIdx !== null ? data[hoverIdx] : null;
  const hoveredX = hoverIdx !== null ? PAD.l + hoverIdx * sliceW + sliceW / 2 : 0;
  const hoveredY = hovered !== null ? yToPx(hovered.aplicado + hovered.ganho) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* filtros funcionais */}
      <div className="flex items-center justify-end gap-2">
        <ChartSelect
          options={PERIOD_OPTIONS}
          value={period}
          onChange={(v) => setPeriod(v as Period)}
        />
        <ChartSelect
          options={TYPE_OPTIONS}
          value={assetType}
          onChange={(v) => setAssetType(v as AssetTypeFilter)}
        />
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-[300px] w-full">
          {yTicks.map((t, i) => (
            <g key={i}>
              <line
                x1={PAD.l}
                x2={W - PAD.r}
                y1={yToPx(t)}
                y2={yToPx(t)}
                stroke="#f4f4f5"
                strokeWidth="1"
                strokeDasharray={i === 0 ? undefined : "3 3"}
              />
              <text x={PAD.l - 8} y={yToPx(t) + 3} fontSize="10" fill="#a1a1aa" textAnchor="end">
                {fmtCompact(t)}
              </text>
            </g>
          ))}

          {data.map((d, i) => {
            const x = PAD.l + i * sliceW + (sliceW - barW) / 2;
            const aplicadoH = (d.aplicado / yMax) * innerH;
            const ganhoH = (d.ganho / yMax) * innerH;
            const yAplicado = PAD.t + innerH - aplicadoH;
            const yGanho = yAplicado - ganhoH;
            const isHover = hoverIdx === i;
            return (
              <g
                key={i}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
              >
                <rect
                  x={PAD.l + i * sliceW}
                  y={PAD.t}
                  width={sliceW}
                  height={innerH + 8}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                />
                <rect
                  x={x}
                  y={yAplicado}
                  width={barW}
                  height={aplicadoH}
                  fill={isHover ? COLOR_APLICADO_HOVER : COLOR_APLICADO}
                  rx="3"
                  style={{ transition: "fill 150ms ease-out" }}
                />
                <rect
                  x={x}
                  y={yGanho}
                  width={barW}
                  height={ganhoH}
                  fill={isHover ? COLOR_GANHO_HOVER : COLOR_GANHO}
                  rx="3"
                  style={{ transition: "fill 150ms ease-out" }}
                />
                <text
                  x={x + barW / 2}
                  y={H - 12}
                  fontSize="10"
                  fill={isHover ? "#18181b" : "#a1a1aa"}
                  textAnchor="middle"
                  fontWeight={isHover ? 600 : 400}
                  style={{ transition: "fill 150ms ease-out" }}
                >
                  {d.month}
                </text>
              </g>
            );
          })}
        </svg>

        {hovered && (
          <BarTooltip
            data={hovered}
            xPct={(hoveredX / W) * 100}
            yPct={(hoveredY / H) * 100}
          />
        )}
      </div>

      <div className="flex items-center gap-5 border-t border-white/10 pt-3 text-[11px]">
        <LegendDot color={COLOR_APLICADO} label="Valor aplicado" />
        <LegendDot color={COLOR_GANHO} label="Ganho de capital" />
      </div>
    </div>
  );
}

// dropdown genérico no estilo do design system (dark, borda sutil)
function ChartSelect({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // fecha ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((o) => o.value === value) ?? options[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-7 items-center gap-1.5 rounded-md border border-white/10 bg-zinc-800 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-300 transition-colors hover:border-white/20 hover:bg-zinc-700"
      >
        {selected.label}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-3 w-3 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 min-w-[140px] rounded-lg border border-white/10 bg-zinc-800 py-1 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full px-3 py-1.5 text-left text-[11px] font-medium uppercase tracking-wider transition-colors hover:bg-zinc-700 ${
                opt.value === value ? "text-white" : "text-zinc-400"
              }`}
            >
              {opt.value === value && (
                <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
              )}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BarTooltip({ data, xPct, yPct }: { data: Point; xPct: number; yPct: number }) {
  const total = data.aplicado + data.ganho;
  const isLeft = xPct < 18;
  const isRight = xPct > 82;
  const xTransform = isLeft ? "0%" : isRight ? "-100%" : "-50%";

  return (
    <div
      className="pointer-events-none absolute z-20 w-56 rounded-xl border border-white/10 bg-zinc-800 p-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
      style={{
        left: `${xPct}%`,
        top: `${yPct}%`,
        transform: `translate(${xTransform}, calc(-100% - 12px))`,
        animation: "tooltip-in 160ms ease-out",
      }}
    >
      <div className="mb-3 text-sm font-bold tracking-tight text-white">{data.month}</div>

      <div className="mb-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: COLOR_PATRIMONIO_DOT }} />
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Patrimônio
          </span>
        </div>
        <div className="mt-1 text-base font-semibold tabular-nums text-zinc-50">
          {fmtBRL(total)}
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        <li className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: COLOR_GANHO }} />
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Ganho de capital
            </span>
          </span>
          <span className="text-xs font-medium tabular-nums text-zinc-50">{fmtBRL(data.ganho)}</span>
        </li>
        <li className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: COLOR_APLICADO }} />
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Valor aplicado
            </span>
          </span>
          <span className="text-xs font-medium tabular-nums text-zinc-50">{fmtBRL(data.aplicado)}</span>
        </li>
      </ul>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-zinc-500">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function fmtCompact(n: number) {
  return n.toLocaleString("pt-BR", { notation: "compact", maximumFractionDigits: 1 });
}
