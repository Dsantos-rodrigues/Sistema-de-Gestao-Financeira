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
      className={`rounded-2xl border border-zinc-200/80 bg-white ${className}`}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 px-6 py-5">
          <div className="flex flex-col gap-0.5">
            {title && (
              <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
            )}
            {description && (
              <p className="text-xs text-zinc-500">{description}</p>
            )}
          </div>
          {action}
        </header>
      )}
      <div
        className={`${title ? "border-t border-zinc-100" : ""} ${
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
    <div className="flex flex-col gap-2 rounded-2xl border border-zinc-200/80 bg-white p-5">
      <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-ink-900">
          {value}
        </span>
        {delta && (
          <span
            className={`text-xs font-medium ${
              delta.positive === false ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            {delta.value}
          </span>
        )}
      </div>
      {hint && <span className="text-xs text-zinc-500">{hint}</span>}
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
    neutral: "bg-zinc-100 text-zinc-700 ring-zinc-200/80",
    gold: "bg-gold-200/40 text-gold-600 ring-gold-300/50",
    positive: "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
    negative: "bg-rose-50 text-rose-700 ring-rose-200/60",
    info: "bg-sky-50 text-sky-700 ring-sky-200/60",
    ink: "bg-ink-900 text-zinc-50 ring-ink-900",
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
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
          {title}
        </h1>
        {description && <p className="text-sm text-zinc-500">{description}</p>}
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
