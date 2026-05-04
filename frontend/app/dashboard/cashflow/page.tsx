import {
  Chip,
  KpiCard,
  PageHeader,
  Section,
  fmtBRL,
} from "../_components/ui";

const CATEGORIES = [
  { key: "moradia", label: "Moradia", value: 4800, color: "#c89b3c" },
  { key: "alimentacao", label: "Alimentação", value: 2900, color: "#18181b" },
  { key: "transporte", label: "Transporte", value: 1200, color: "#475569" },
  { key: "lazer", label: "Lazer", value: 1850, color: "#92400e" },
  { key: "saude", label: "Saúde", value: 980, color: "#a1a1aa" },
  { key: "outros", label: "Outros", value: 1470, color: "#d4a574" },
];

const TRANSACTIONS = [
  {
    date: "02 mai",
    description: "Aporte mensal",
    institution: "XP Investimentos",
    category: "Aporte",
    value: 12000,
    type: "in",
  },
  {
    date: "01 mai",
    description: "Aluguel",
    institution: "Itaú",
    category: "Moradia",
    value: -3200,
    type: "out",
  },
  {
    date: "30 abr",
    description: "Dividendo HGLG11",
    institution: "Clear",
    category: "Renda passiva",
    value: 642,
    type: "in",
  },
  {
    date: "28 abr",
    description: "Supermercado Pão de Açúcar",
    institution: "Nubank",
    category: "Alimentação",
    value: -485,
    type: "out",
  },
  {
    date: "26 abr",
    description: "Compra ITUB4 (200)",
    institution: "Clear",
    category: "Investimento",
    value: -7782,
    type: "out",
  },
  {
    date: "25 abr",
    description: "Salário",
    institution: "Itaú",
    category: "Renda",
    value: 18500,
    type: "in",
  },
  {
    date: "22 abr",
    description: "Uber",
    institution: "Nubank",
    category: "Transporte",
    value: -78,
    type: "out",
  },
  {
    date: "20 abr",
    description: "Plano de saúde",
    institution: "Itaú",
    category: "Saúde",
    value: -890,
    type: "out",
  },
];

const INSTITUTIONS = [
  { name: "Itaú", count: 14, balance: 24820 },
  { name: "XP Investimentos", count: 8, balance: 348920 },
  { name: "Clear", count: 22, balance: 178432 },
  { name: "Nubank", count: 31, balance: 8740 },
];

export default function CashflowPage() {
  const totalIn = TRANSACTIONS.filter((t) => t.value > 0).reduce(
    (s, t) => s + t.value,
    0
  );
  const totalOut = TRANSACTIONS.filter((t) => t.value < 0).reduce(
    (s, t) => s + Math.abs(t.value),
    0
  );
  const totalCategories = CATEGORIES.reduce((s, c) => s + c.value, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Fluxo de caixa"
        description="Entradas, saídas e categorias · maio/2025"
        action={
          <Chip tone="info">
            {INSTITUTIONS.length} instituições conectadas
          </Chip>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Entradas no mês"
          value={fmtBRL(totalIn)}
          delta={{ value: "+8,2%", positive: true }}
        />
        <KpiCard
          label="Saídas no mês"
          value={fmtBRL(totalOut)}
          delta={{ value: "-3,1%", positive: true }}
          hint="vs mês anterior"
        />
        <KpiCard
          label="Saldo do mês"
          value={fmtBRL(totalIn - totalOut)}
          delta={{ value: "+12,7%", positive: true }}
        />
        <KpiCard
          label="Taxa de poupança"
          value="38,4%"
          hint="da renda líquida"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Section
          title="Despesas por categoria"
          description="Distribuição do mês"
          className="lg:col-span-3"
        >
          <ul className="flex flex-col gap-4">
            {CATEGORIES.map((c) => {
              const pct = c.value / totalCategories;
              return (
                <li key={c.key} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: c.color }}
                      />
                      <span className="text-zinc-700">{c.label}</span>
                    </span>
                    <span className="flex items-baseline gap-2 tabular-nums">
                      <span className="font-medium text-ink-900">
                        {fmtBRL(c.value)}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {(pct * 100).toFixed(1).replace(".", ",")}%
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct * 100}%`,
                        background: c.color,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Section>

        <Section
          title="Por instituição"
          description="Saldo e atividade"
          className="lg:col-span-2"
        >
          <ul className="flex flex-col divide-y divide-zinc-100">
            {INSTITUTIONS.map((i) => (
              <li
                key={i.name}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-100 text-[10px] font-bold text-zinc-700">
                    {i.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-ink-900">
                      {i.name}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {i.count} transações no mês
                    </span>
                  </div>
                </div>
                <span className="text-sm font-medium tabular-nums text-ink-900">
                  {fmtBRL(i.balance, { compact: true })}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section
        title="Transações recentes"
        description="Últimos lançamentos consolidados"
        action={
          <button
            type="button"
            className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900"
          >
            Ver todas
          </button>
        }
        bodyPadding={false}
      >
        <ul className="divide-y divide-zinc-50">
          {TRANSACTIONS.map((t, i) => (
            <li
              key={i}
              className="flex items-center gap-4 px-6 py-3.5 hover:bg-zinc-50/60"
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                  t.type === "in"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-3.5 w-3.5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {t.type === "in" ? (
                    <path d="M12 19V5m-7 7 7-7 7 7" />
                  ) : (
                    <path d="M12 5v14m-7-7 7 7 7-7" />
                  )}
                </svg>
              </span>
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-medium text-ink-900">
                  {t.description}
                </span>
                <span className="text-xs text-zinc-500">
                  {t.institution} · {t.category}
                </span>
              </div>
              <span className="text-xs text-zinc-400">{t.date}</span>
              <span
                className={`w-32 text-right text-sm font-medium tabular-nums ${
                  t.value >= 0 ? "text-emerald-700" : "text-ink-900"
                }`}
              >
                {t.value >= 0 ? "+" : ""}
                {fmtBRL(t.value)}
              </span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
