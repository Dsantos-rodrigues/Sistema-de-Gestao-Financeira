"use client";

import { useState } from "react";
import { fmtBRL } from "./ui";

type Point = { month: string; aplicado: number; ganho: number };

const W = 720;
const H = 300;
const PAD = { l: 56, r: 16, t: 16, b: 36 };

const COLOR_APLICADO = "#059669";
const COLOR_APLICADO_HOVER = "#047857";
const COLOR_GANHO = "#6EE7B7";
const COLOR_GANHO_HOVER = "#34D399";
const COLOR_PATRIMONIO_DOT = "#7c3aed";

export function EvolucaoChart({ data }: { data: any }) {
  const history = data?.history ?? [];

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const max = Math.max(
    ...history.map((d: any) => d.aplicado + d.ganho),
    0
  );
  const yMax = Math.ceil(max / 200000) * 200000;
  const yToPx = (v: number) => PAD.t + innerH - (v / yMax) * innerH;
  const sliceW = innerW / (history.length || 1);
  const barW = sliceW * 0.55;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((p) => yMax * p);

  const hovered = hoverIdx !== null ? history[hoverIdx] ?? null : null;
  const hoveredX =
    hoverIdx !== null
      ? PAD.l + hoverIdx * sliceW + sliceW / 2
      : 0;
  const hoveredY =
    hovered !== null ? yToPx(hovered.aplicado + hovered.ganho) : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2">
        <MockSelect label="12 MESES" />
        <MockSelect label="TODOS OS TIPOS" />
      </div>

      <div className="relative">
        {history.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center rounded-2xl border border-zinc-200 text-sm text-zinc-500">
            Nenhum histórico disponível
          </div>
        ) : (
          <>
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
                  <text
                    x={PAD.l - 8}
                    y={yToPx(t) + 3}
                    fontSize="10"
                    fill="#a1a1aa"
                    textAnchor="end"
                  >
                    {fmtCompact(t)}
                  </text>
                </g>
              ))}

              {history.map((d: any, i: number) => {
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
                    />

                    <rect
                      x={x}
                      y={yGanho}
                      width={barW}
                      height={ganhoH}
                      fill={isHover ? COLOR_GANHO_HOVER : COLOR_GANHO}
                      rx="3"
                    />

                    <text
                      x={x + barW / 2}
                      y={H - 12}
                      fontSize="10"
                      fill={isHover ? "#18181b" : "#a1a1aa"}
                      textAnchor="middle"
                      fontWeight={isHover ? 600 : 400}
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
          </>
        )}
      </div>

      <div className="flex items-center gap-5 border-t border-zinc-100 pt-3 text-[11px]">
        <LegendDot color={COLOR_APLICADO} label="Valor aplicado" />
        <LegendDot color={COLOR_GANHO} label="Ganho de capital" />
      </div>
    </div>
  );
}

function BarTooltip({
  data,
  xPct,
  yPct,
}: {
  data: Point;
  xPct: number;
  yPct: number;
}) {
  const total = data.aplicado + data.ganho;

  // Mantém o tooltip dentro da área visível, evitando vazar nas bordas
  const isLeft = xPct < 18;
  const isRight = xPct > 82;
  const xTransform = isLeft ? "0%" : isRight ? "-100%" : "-50%";

  return (
    <div
      className="pointer-events-none absolute z-20 w-56 rounded-xl border border-zinc-200/80 bg-white p-3.5 shadow-[0_10px_30px_rgba(15,15,15,0.12)]"
      style={{
        left: `${xPct}%`,
        top: `${yPct}%`,
        transform: `translate(${xTransform}, calc(-100% - 12px))`,
        animation: "tooltip-in 160ms ease-out",
      }}
    >
      <div className="mb-3 text-sm font-bold tracking-tight text-ink-900">
        {data.month}
      </div>

      <div className="mb-3 border-b border-zinc-100 pb-3">
        <div className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: COLOR_PATRIMONIO_DOT }}
          />
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Patrimônio
          </span>
        </div>
        <div className="mt-1 text-base font-semibold tabular-nums text-ink-900">
          {fmtBRL(total)}
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        <li className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: COLOR_GANHO }}
            />
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Ganho de capital
            </span>
          </span>
          <span className="text-xs font-medium tabular-nums text-ink-900">
            {fmtBRL(data.ganho)}
          </span>
        </li>
        <li className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: COLOR_APLICADO }}
            />
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Valor aplicado
            </span>
          </span>
          <span className="text-xs font-medium tabular-nums text-ink-900">
            {fmtBRL(data.aplicado)}
          </span>
        </li>
      </ul>
    </div>
  );
}

function MockSelect({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex h-7 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
    >
      {label}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3 w-3 text-zinc-400"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
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

function fmtCompact(n: number) {
  return n.toLocaleString("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  });
}
