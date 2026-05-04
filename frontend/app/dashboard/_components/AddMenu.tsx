"use client";

import { useEffect, useRef, useState } from "react";
import { AssetModal, CategoryModal, TransactionModal } from "./AddForms";

type ModalKey = "asset" | "tx" | "cat";

const ITEMS: { key: ModalKey; label: string; description: string }[] = [
  {
    key: "asset",
    label: "Ativo",
    description: "Adicionar ação, FII, ETF ou cripto",
  },
  {
    key: "tx",
    label: "Transação",
    description: "Compra, venda, dividendo ou aporte",
  },
  {
    key: "cat",
    label: "Categoria",
    description: "Categoria personalizada de fluxo",
  },
];

export function AddMenu() {
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<ModalKey | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      document.addEventListener("keydown", handleKey);
    }
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function pick(k: ModalKey) {
    setOpen(false);
    setModal(k);
  }

  return (
    <>
      <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 items-center gap-1.5 rounded-md bg-ink-900 px-3 text-xs font-medium text-white transition-colors hover:bg-ink-800"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-3.5 w-3.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Adicionar
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-40 w-72 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_8px_28px_rgba(15,15,15,0.08)]">
          <div className="border-b border-zinc-100 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Cadastro manual
          </div>
          <ul className="p-1">
            {ITEMS.map((it) => (
              <li key={it.key}>
                <button
                  type="button"
                  onClick={() => pick(it.key)}
                  className="flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-zinc-50"
                >
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-gold-200/50 text-gold-600">
                    <Icon name={it.key} />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-medium text-ink-900">
                      {it.label}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {it.description}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      </div>

      {modal === "asset" && <AssetModal onClose={() => setModal(null)} />}
      {modal === "tx" && <TransactionModal onClose={() => setModal(null)} />}
      {modal === "cat" && <CategoryModal onClose={() => setModal(null)} />}
    </>
  );
}

function Icon({ name }: { name: "asset" | "tx" | "cat" }) {
  const cls = "h-3.5 w-3.5";
  if (name === "asset")
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={cls}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3v18h18" />
        <path d="m7 14 4-4 4 4 5-5" />
      </svg>
    );
  if (name === "tx")
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={cls}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 17 17 7" />
        <path d="M9 7h8v8" />
      </svg>
    );
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cls}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
