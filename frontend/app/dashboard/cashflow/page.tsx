"use client";

import { useEffect, useState } from "react";
import { Chip, KpiCard, PageHeader, Section, fmtBRL } from "../_components/ui";
import { api } from "../../lib/api";
import type { TransactionResponse, WalletResponse } from "../../lib/types";

// Formata "2026-04-25T00:00:00.000Z" → "25 abr"
function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
}

export default function CashflowPage() {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [wallets, setWallets]           = useState<WalletResponse[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<TransactionResponse[]>("/transactions"),
      api.get<WalletResponse[]>("/wallets"),
    ])
      .then(([t, w]) => { setTransactions(t); setWallets(w); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="text-sm text-zinc-500">Carregando fluxo de caixa...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="text-sm text-rose-500">{error}</span>
      </div>
    );
  }

  // Totais
  const totalIn  = transactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalOut = transactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + parseFloat(t.amount), 0);
  const savingsRate = totalIn > 0 ? ((totalIn - totalOut) / totalIn) * 100 : null;

  // Agrupa despesas por categoria
  const categoryMap: Record<string, number> = {};
  for (const t of transactions.filter((t) => t.type === "EXPENSE")) {
    const cat = t.category ?? "Outros";
    categoryMap[cat] = (categoryMap[cat] ?? 0) + parseFloat(t.amount);
  }
  const categories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], i) => {
      const colors = ["#c89b3c", "#18181b", "#475569", "#92400e", "#a1a1aa", "#d4a574"];
      return { key: label, label, value, color: colors[i % colors.length] };
    });
  const totalCategories = categories.reduce((s, c) => s + c.value, 0);

  // Contagem de transações por carteira
  const txCountByWallet: Record<string, number> = {};
  for (const t of transactions) {
    if (t.walletId) txCountByWallet[t.walletId] = (txCountByWallet[t.walletId] ?? 0) + 1;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Fluxo de caixa"
        description="Entradas, saídas e categorias"
        action={<Chip tone="info">{wallets.length} carteiras conectadas</Chip>}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Entradas no mês"  value={fmtBRL(totalIn)} />
        <KpiCard label="Saídas no mês"    value={fmtBRL(totalOut)} />
        <KpiCard label="Saldo do mês"     value={fmtBRL(totalIn - totalOut)} delta={{ value: fmtBRL(totalIn - totalOut, { compact: true }), positive: totalIn >= totalOut }} />
        <KpiCard label="Taxa de poupança" value={savingsRate !== null ? `${savingsRate.toFixed(1).replace(".", ",")}%` : "—"} hint="da renda líquida" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Section title="Despesas por categoria" description="Distribuição acumulada" className="lg:col-span-3">
          <ul className="flex flex-col gap-4">
            {categories.length === 0 ? (
              <li className="flex h-24 items-center justify-center">
                <span className="text-sm font-medium text-zinc-400">Nenhuma categoria registrada</span>
              </li>
            ) : (
              categories.map((c) => {
                const pct = c.value / totalCategories;
                return (
                  <li key={c.key} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                        <span className="text-zinc-300">{c.label}</span>
                      </span>
                      <span className="flex items-baseline gap-2 tabular-nums">
                        <span className="font-medium text-zinc-50">{fmtBRL(c.value)}</span>
                        <span className="text-xs text-zinc-500">{(pct * 100).toFixed(1).replace(".", ",")}%</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: c.color }} />
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </Section>

        <Section title="Por carteira" description="Saldo e atividade" className="lg:col-span-2">
          <ul className="flex flex-col divide-y divide-white/5">
            {wallets.length === 0 ? (
              <li className="flex h-24 items-center justify-center">
                <span className="text-sm font-medium text-zinc-400">Nenhuma carteira conectada</span>
              </li>
            ) : (
              wallets.map((w) => (
                <li key={w.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-zinc-700 text-[10px] font-bold text-zinc-300">
                      {w.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-zinc-50">{w.name}</span>
                      <span className="text-xs text-zinc-500">{txCountByWallet[w.id] ?? 0} transações</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium tabular-nums text-zinc-50">{fmtBRL(w.balance, { compact: true })}</span>
                </li>
              ))
            )}
          </ul>
        </Section>
      </div>

      <Section
        title="Transações recentes"
        description="Últimos lançamentos consolidados"
        bodyPadding={false}
      >
        <ul className="divide-y divide-white/5">
          {transactions.length === 0 ? (
            <li className="flex flex-col items-center gap-2 px-6 py-12 text-center">
              <span className="text-sm font-medium text-zinc-400">Nenhuma transação encontrada</span>
              <span className="text-xs text-zinc-500">As transações aparecerão aqui conforme forem lançadas.</span>
            </li>
          ) : (
            transactions.slice(0, 20).map((t) => {
              const isIn  = t.type === "INCOME";
              const value = parseFloat(t.amount) * (isIn ? 1 : -1);
              return (
                <li key={t.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/5">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${isIn ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {isIn ? <path d="M12 19V5m-7 7 7-7 7 7" /> : <path d="M12 5v14m-7-7 7 7 7-7" />}
                    </svg>
                  </span>
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-medium text-zinc-50">{t.description}</span>
                    <span className="text-xs text-zinc-500">{t.wallet?.name ?? "—"} · {t.category ?? "—"}</span>
                  </div>
                  <span className="text-xs text-zinc-400">{fmtDate(t.date)}</span>
                  <span className={`w-32 text-right text-sm font-medium tabular-nums ${value >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {value >= 0 ? "+" : ""}{fmtBRL(value)}
                  </span>
                </li>
              );
            })
          )}
        </ul>
      </Section>
    </div>
  );
}
