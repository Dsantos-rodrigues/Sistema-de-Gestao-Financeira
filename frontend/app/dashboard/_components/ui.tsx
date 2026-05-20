import { ReactNode } from "react";

export function Section({
  title,
  description,
  action,
  children,
  className = "",
  bodyPadding = true,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyPadding?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl border border-white/10 bg-zinc-800 ${className}`}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 px-6 py-5">
          <div className="flex flex-col gap-0.5">
            {title && (
              <h2 className="text-sm font-semibold text-white">{title}</h2>
            )}
            {description && (
              <p className="text-xs text-zinc-400">{description}</p>
            )}
          </div>
          {action}
        </header>
      )}
      <div
        className={`${title ? "border-t border-white/5" : ""} ${
          bodyPadding ? "p-6" : ""
        }`}
      >
        {children}
      </div>
    </section>
  );
}

export function KpiCard({
  label,
  value,
  delta,
  hint,
}: {
  label: string;
  value: string;
  delta?: { value: string; positive?: boolean };
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-zinc-800 p-5">
      <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-white">
          {value}
        </span>
        {delta && (
          <span
            className={`text-xs font-medium ${
              delta.positive === false ? "text-rose-400" : "text-emerald-400"
            }`}
          >
            {delta.value}
          </span>
        )}
      </div>
      {hint && <span className="text-xs text-zinc-400">{hint}</span>}
    </div>
  );
}

export function Chip({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "gold" | "positive" | "negative" | "info" | "ink";
}) {
  const tones = {
    neutral: "bg-zinc-700 text-zinc-300 ring-white/10",
    gold: "bg-gold-500/20 text-gold-400 ring-gold-400/30",
    positive: "bg-emerald-500/20 text-emerald-400 ring-emerald-400/30",
    negative: "bg-rose-500/20 text-rose-400 ring-rose-400/30",
    info: "bg-sky-500/20 text-sky-400 ring-sky-400/30",
    ink: "bg-ink-900 text-zinc-50 ring-white/10",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4 pb-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          {title}
        </h1>
        {description && <p className="text-sm text-zinc-400">{description}</p>}
      </div>
      {action}
    </header>
  );
}

export function fmtBRL(n: number, opts?: { compact?: boolean }) {
  if (opts?.compact) {
    return n.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
      maximumFractionDigits: 1,
    });
  }
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export function fmtPct(n: number, opts?: { withSign?: boolean }) {
  const formatted = (n * 100).toFixed(2).replace(".", ",") + "%";
  if (opts?.withSign && n > 0) return "+" + formatted;
  return formatted;
}
