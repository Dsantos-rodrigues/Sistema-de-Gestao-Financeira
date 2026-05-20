"use client";

import { useState } from "react";
import { fmtBRL, fmtPct } from "./ui";

type Slice = {
  key: string;
  label: string;
  value: number;
  color: string;
};

type SliceFull = Slice & {
  start: number;
  end: number;
  mid: number;
  pct: number;
};

const VB = 320;
const CX = VB / 2;
const CY = VB / 2;
const R_OUTER = 92;
const R_INNER = 56;

export function AllocationDonut({ data }: { data: any }) {
  const total = data?.carteiras?.total ?? 1;

  const [hoverKey, setHoverKey] = useState<string | null>(null);

  // MOCK controlado (depois vamos ligar na API de verdade)
  const rawSlices: Slice[] = [
    {
      key: "carteiras",
      label: "Carteiras",
      value: total,
      color: "#c89b3c",
    },
  ];

  const slices: SliceFull[] = rawSlices.map((s) => ({
    ...s,
    start: -Math.PI / 2,
    end: Math.PI * 1.5,
    mid: 0,
    pct: 1,
  }));

  const hovered =
    slices.find((s) => s.key === hoverKey) ?? null;

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
            key={s.key}
            slice={s}
            faded={hoverKey !== null && hoverKey !== s.key}
          />
        ))}
      </svg>

      <CenterTooltip hovered={hovered} />
    </div>
  );
}

/* ---------------- LABEL ---------------- */

function SliceLabel({
  slice,
  faded,
}: {
  slice: SliceFull;
  faded: boolean;
}) {
  const x = CX;
  const y = CY;

  return (
    <g style={{ opacity: faded ? 0.3 : 1 }}>
      <text
        x={x}
        y={y}
        textAnchor="middle"
        fontSize="12"
        fill="#27272a"
      >
        {slice.label}
      </text>
    </g>
  );
}

/* ---------------- TOOLTIP ---------------- */

function CenterTooltip({
  hovered,
}: {
  hovered: SliceFull | null;
}) {
  const value = hovered?.value ?? 0;

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {hovered ? (
        <div className="flex w-44 flex-col items-center gap-2 rounded-2xl border border-zinc-200/80 bg-white px-4 py-3 text-center shadow">
          <span className="text-sm font-bold text-ink-900">
            {hovered.label}
          </span>

          <span className="text-sm font-semibold tabular-nums text-ink-900">
            {fmtBRL(value)}
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] uppercase text-zinc-400">
            total
          </span>
          <span className="text-base font-semibold text-ink-900">
            {fmtBRL(value, { compact: true })}
          </span>
        </div>
      )}
    </div>
  );
}

/* ---------------- ARC ---------------- */

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
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}