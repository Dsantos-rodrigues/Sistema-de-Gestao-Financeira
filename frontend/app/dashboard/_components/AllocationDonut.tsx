"use client";

import { useState } from "react";
import { fmtBRL, fmtPct } from "./ui";

type Slice = {
  key: string;
  label: string;
  value: number;
  color: string;
};

// Mesmas categorias e totais usados no AssetsPanel — soma 1.247.382
const ALLOCATION: Slice[] = [
  { key: "acoes", label: "Ações", value: 399382, color: "#c89b3c" },
  { key: "exterior", label: "Exterior", value: 349267, color: "#10b981" },
  { key: "fii", label: "FIIs", value: 224529, color: "#64748b" },
  { key: "rf", label: "Renda Fixa", value: 174634, color: "#a1a1aa" },
  { key: "cripto", label: "Criptos", value: 99570, color: "#f59e0b" },
];

const TOTAL = ALLOCATION.reduce((s, a) => s + a.value, 0);

const VB = 320;
const CX = VB / 2;
const CY = VB / 2;
const R_OUTER = 92;
const R_INNER = 56;

export function AllocationDonut() {
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  const slices = ALLOCATION.reduce<
    (Slice & { start: number; end: number; mid: number; pct: number })[]
  >((acc, s) => {
    const last = acc[acc.length - 1];
    const start = last ? last.end : -Math.PI / 2;
    const angle = (s.value / TOTAL) * Math.PI * 2;
    const end = start + angle;
    acc.push({
      ...s,
      start,
      end,
      mid: (start + end) / 2,
      pct: s.value / TOTAL,
    });
    return acc;
  }, []);

  const hovered = slices.find((s) => s.key === hoverKey) ?? null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${VB} ${VB}`} className="mx-auto h-72 w-full">
        {slices.map((s) => {
          const isHover = hoverKey === s.key;
          return (
            <g
              key={s.key}
              onMouseEnter={() => setHoverKey(s.key)}
              onMouseLeave={() => setHoverKey(null)}
              style={{
                cursor: "pointer",
                transformOrigin: `${CX}px ${CY}px`,
                transform: isHover ? "scale(1.04)" : "scale(1)",
                transition: "transform 180ms ease-out",
              }}
            >
              <path
                d={arcPath(CX, CY, R_OUTER, R_INNER, s.start, s.end)}
                fill={s.color}
                style={{
                  filter: isHover
                    ? "brightness(1.1) drop-shadow(0 4px 8px rgba(0,0,0,0.08))"
                    : "none",
                  transition: "filter 180ms ease-out",
                }}
              />
            </g>
          );
        })}

        {slices.map((s) => (
          <SliceLabel
            key={s.key + "-label"}
            slice={s}
            faded={hoverKey !== null && hoverKey !== s.key}
          />
        ))}
      </svg>

      <CenterTooltip hovered={hovered} />
    </div>
  );
}

function SliceLabel({
  slice,
  faded,
}: {
  slice: Slice & { mid: number; pct: number };
  faded: boolean;
}) {
  if (slice.pct < 0.04) return null;

  const labelDist = R_OUTER + 18;
  const x = CX + labelDist * Math.cos(slice.mid);
  const y = CY + labelDist * Math.sin(slice.mid);
  const isRight = Math.cos(slice.mid) >= 0;
  const anchor = isRight ? "start" : "end";

  const lineStart = {
    x: CX + (R_OUTER + 2) * Math.cos(slice.mid),
    y: CY + (R_OUTER + 2) * Math.sin(slice.mid),
  };
  const lineEnd = {
    x: CX + (R_OUTER + 12) * Math.cos(slice.mid),
    y: CY + (R_OUTER + 12) * Math.sin(slice.mid),
  };

  return (
    <g
      style={{
        opacity: faded ? 0.35 : 1,
        transition: "opacity 180ms ease-out",
        pointerEvents: "none",
      }}
    >
      <line
        x1={lineStart.x}
        y1={lineStart.y}
        x2={lineEnd.x}
        y2={lineEnd.y}
        stroke={slice.color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <text
        x={x}
        y={y - 4}
        fontSize="10"
        fontWeight="600"
        fill="#27272a"
        textAnchor={anchor}
      >
        {slice.label}
      </text>
      <text
        x={x}
        y={y + 8}
        fontSize="10"
        fontWeight="500"
        fill={slice.color}
        textAnchor={anchor}
      >
        {fmtPct(slice.pct)}
      </text>
    </g>
  );
}

function CenterTooltip({
  hovered,
}: {
  hovered: (Slice & { pct: number }) | null;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-live="polite"
    >
      {hovered ? (
        <div
          key={hovered.key}
          className="flex w-44 flex-col items-center gap-2 rounded-2xl border border-zinc-200/80 bg-white px-4 py-3 text-center shadow-[0_10px_30px_rgba(15,15,15,0.12)]"
          style={{ animation: "tooltip-in 160ms ease-out" }}
        >
          <span className="text-sm font-bold tracking-tight text-ink-900">
            {hovered.label}: {fmtPct(hovered.pct)}
          </span>
          <div className="flex w-full items-center gap-2 border-t border-zinc-100 pt-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: hovered.color }}
            />
            <div className="flex flex-1 flex-col items-start">
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                {hovered.label}
              </span>
              <span className="text-sm font-semibold tabular-nums text-ink-900">
                {fmtBRL(hovered.value)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            Total
          </span>
          <span className="text-base font-semibold tabular-nums text-ink-900">
            {fmtBRL(TOTAL, { compact: true })}
          </span>
        </div>
      )}
    </div>
  );
}

function arcPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startAngle: number,
  endAngle: number
) {
  const startOuter = polar(cx, cy, rOuter, startAngle);
  const endOuter = polar(cx, cy, rOuter, endAngle);
  const startInner = polar(cx, cy, rInner, endAngle);
  const endInner = polar(cx, cy, rInner, startAngle);

  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ");
}

function polar(cx: number, cy: number, r: number, angle: number) {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}
