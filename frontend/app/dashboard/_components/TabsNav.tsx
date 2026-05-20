"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AddMenu } from "./AddMenu";

const TABS = [
  { href: "/dashboard/portfolio", label: "Portfólio" },
  { href: "/dashboard/performance", label: "Performance" },
  { href: "/dashboard/cashflow", label: "Fluxo de caixa" },
  { href: "/dashboard/reports", label: "Relatórios" },
  { href: "/dashboard/insights", label: "IA Insights" },
] as const;

export function TabsNav() {
  const pathname = usePathname();
  return (
    <div className="sticky top-14 z-30 border-b border-white/10 bg-ink-900">
      <div className="flex items-center justify-between gap-4 px-6">
        <nav className="scrollbar-none -mb-px flex overflow-x-auto">
          {TABS.map((t) => {
            const active =
              pathname === t.href || pathname.startsWith(t.href + "/");
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`relative flex h-11 items-center whitespace-nowrap px-3.5 text-sm transition-colors ${
                  active
                    ? "font-medium text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {t.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gold-400" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="py-2">
          <AddMenu />
        </div>
      </div>
    </div>
  );
}
