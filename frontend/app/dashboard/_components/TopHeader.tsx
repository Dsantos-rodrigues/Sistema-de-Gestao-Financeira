"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api, clearToken } from "../../lib/api";
import type { MarketQuote, MarketSearchResult } from "../../lib/types";

export function TopHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-ink-900 px-6">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-gold-400 text-ink-900">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17l6-6 4 4 8-8" />
              <path d="M14 7h7v7" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-white">FinFlow</span>
        </Link>

        <MarketSearch />
      </div>

      <div className="flex items-center gap-1">
        <IconButton aria-label="Notificacoes" hasIndicator>
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        </IconButton>
        <IconButton aria-label="Configuracoes">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </IconButton>
        <UserMenu />
      </div>
    </header>
  );
}

function MarketSearch() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MarketQuote[]>([]);
  const [suggestions, setSuggestions] = useState<MarketSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }

    function handleClick(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClick);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  useEffect(() => {
    const raw = query.trim();
    if (raw.length < 2) {
      setResults([]);
      setSuggestions([]);
      setError("");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");
    setOpen(true);

    const timer = window.setTimeout(async () => {
      const symbols = normalizeSearch(raw);

      try {
        const found = await fetchQuotes(symbols);
        if (cancelled) return;

        setResults(found);

        if (found.length > 0) {
          setSuggestions([]);
          return;
        }

        const assets = await api.get<MarketSearchResult[]>(
          `/market/search?q=${encodeURIComponent(raw)}`,
        );
        if (cancelled) return;

        const quotedAssets = assets.length
          ? await fetchQuotes(assets.map((asset) => asset.symbol).join(","))
          : [];
        if (cancelled) return;

        const quotedSymbols = new Set(
          quotedAssets.map((quote) => (quote.resolvedSymbol ?? quote.symbol).toUpperCase()),
        );

        setResults(quotedAssets);
        setSuggestions(
          assets.filter((asset) => !quotedSymbols.has(asset.symbol.toUpperCase())),
        );
        if (assets.length === 0) setError("Nenhum ativo encontrado.");
      } catch (err) {
        if (cancelled) return;
        setResults([]);
        setSuggestions([]);
        setError(err instanceof Error ? err.message : "Erro ao buscar cotacao.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const raw = query.trim();
    const symbols = normalizeSearch(raw);
    if (!symbols) {
      setOpen(true);
      return;
    }

    setLoading(true);
    setError("");
    setOpen(true);

    try {
      const found = await fetchQuotes(symbols);
      setResults(found);

      if (found.length > 0) {
        setSuggestions([]);
        return;
      }

      const assets = await api.get<MarketSearchResult[]>(
        `/market/search?q=${encodeURIComponent(raw)}`,
      );

      const quotedAssets = assets.length
        ? await fetchQuotes(assets.map((asset) => asset.symbol).join(","))
        : [];
      const quotedSymbols = new Set(
        quotedAssets.map((quote) => (quote.resolvedSymbol ?? quote.symbol).toUpperCase()),
      );

      setResults(quotedAssets);
      setSuggestions(
        assets.filter((asset) => !quotedSymbols.has(asset.symbol.toUpperCase())),
      );
      if (assets.length === 0) setError("Nenhum ativo encontrado.");
    } catch (err) {
      setResults([]);
      setSuggestions([]);
      setError(err instanceof Error ? err.message : "Erro ao buscar cotacao.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSuggestionClick(asset: MarketSearchResult) {
    setQuery(asset.symbol);
    setLoading(true);
    setError("");
    setOpen(true);

    try {
      const found = await fetchQuotes(asset.symbol);
      setResults(found);
      setSuggestions(found.length > 0 ? [] : [asset]);
      if (found.length === 0) {
        setError(`Ativo ${asset.symbol} encontrado, mas sem cotacao ao vivo agora.`);
      }
    } catch (err) {
      setResults([]);
      setSuggestions([asset]);
      setError(err instanceof Error ? err.message : "Erro ao buscar cotacao.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative hidden md:block">
      <form onSubmit={handleSubmit} className="flex h-8 w-[300px] items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2.5 text-xs text-zinc-400 transition-colors focus-within:border-gold-400/50 focus-within:ring-4 focus-within:ring-gold-400/10">
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3-3" />
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Buscar VALE3, dolar, BTC..."
          className="min-w-0 flex-1 bg-transparent text-xs text-zinc-200 outline-none placeholder:text-zinc-500"
        />
        <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
          Ctrl K
        </kbd>
      </form>

      {open && (
        <div className="absolute left-0 top-10 z-50 w-[430px] overflow-hidden rounded-xl border border-white/10 bg-ink-900 shadow-2xl shadow-black/30">
          <div className="border-b border-white/10 px-3 py-2 text-[11px] text-zinc-500">
            Busque por ticker ou termo: VALE3, PETR4, dolar, euro, bitcoin
          </div>
          {loading ? (
            <SearchState>Buscando cotacao...</SearchState>
          ) : results.length > 0 ? (
            <ul className="max-h-80 overflow-auto p-1.5">
              {results.map((quote) => (
                <SearchResult key={`${quote.kind}-${quote.symbol}`} quote={quote} />
              ))}
            </ul>
          ) : suggestions.length > 0 ? (
            <ul className="max-h-80 overflow-auto p-1.5">
              {suggestions.map((asset) => (
                <SearchAssetResult
                  key={`${asset.kind}-${asset.symbol}`}
                  asset={asset}
                  onClick={() => handleSuggestionClick(asset)}
                />
              ))}
            </ul>
          ) : error ? (
            <SearchState>{error}</SearchState>
          ) : (
            <SearchState>Digite um ativo para pesquisar.</SearchState>
          )}
        </div>
      )}
    </div>
  );
}

async function fetchQuotes(symbols: string) {
  const data = await api.get<MarketQuote[]>(
    `/market/quotes?symbols=${encodeURIComponent(symbols)}`,
  );
  return data.filter((quote) => quote.price > 0);
}

function SearchResult({ quote }: { quote: MarketQuote }) {
  const change = quote.changePercent;
  const positive = (change ?? 0) >= 0;

  return (
    <li>
      <button type="button" className="flex w-full items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/5">
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-zinc-100">{quote.name}</span>
          <span className="mt-0.5 block font-mono text-[11px] text-zinc-500">
            {quote.symbol} - {quote.source}
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block text-sm font-semibold text-zinc-50">{formatMarketPrice(quote)}</span>
          {change !== null && change !== undefined && (
            <span className={`text-xs font-medium ${positive ? "text-emerald-400" : "text-rose-400"}`}>
              {positive ? "+" : ""}
              {change.toFixed(2).replace(".", ",")}%
            </span>
          )}
        </span>
      </button>
    </li>
  );
}

function SearchAssetResult({
  asset,
  onClick,
}: {
  asset: MarketSearchResult;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/5"
      >
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-zinc-100">{asset.name}</span>
          <span className="mt-0.5 block font-mono text-[11px] text-zinc-500">
            {asset.symbol} - catalogo
          </span>
        </span>
        <span className="shrink-0 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[11px] font-medium text-amber-300">
          sem cotacao
        </span>
      </button>
    </li>
  );
}

function SearchState({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-6 text-center text-sm text-zinc-500">{children}</div>;
}

function normalizeSearch(value: string) {
  const raw = value.trim().toUpperCase();
  if (!raw) return "";

  const aliases: Record<string, string> = {
    DOLAR: "USD-BRL",
    USD: "USD-BRL",
    EURO: "EUR-BRL",
    EUR: "EUR-BRL",
    BITCOIN: "BTC",
    BTC: "BTC",
    ETHEREUM: "ETH",
    ETH: "ETH",
    IBOVESPA: "^BVSP",
    IBOV: "^BVSP",
  };

  const parts = raw
    .split(/[,\s]+/)
    .map((part) => aliases[part] ?? part)
    .filter(Boolean);

  return Array.from(new Set(parts)).join(",");
}

function formatMarketPrice(quote: MarketQuote) {
  if (quote.currency === "%") return `${quote.price.toFixed(2).replace(".", ",")}%`;
  if (quote.currency === "USD") {
    return `US$ ${quote.price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return quote.price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function IconButton({
  children,
  hasIndicator,
  ...props
}: {
  children: React.ReactNode;
  hasIndicator?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className="relative grid h-8 w-8 place-items-center rounded-md text-zinc-400 transition-colors hover:bg-white/10 hover:text-white" {...props}>
      {children}
      {hasIndicator && (
        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-gold-400 ring-2 ring-ink-900" />
      )}
    </button>
  );
}

function UserMenu() {
  const router = useRouter();

  function handleLogout() {
    clearToken();
    router.push("/");
  }

  const name =
    typeof window !== "undefined"
      ? (localStorage.getItem("userName") ?? "Usuario")
      : "Usuario";
  const initial = name.charAt(0).toUpperCase();

  return (
    <button type="button" onClick={handleLogout} title="Clique para sair" className="ml-1 flex items-center gap-2 rounded-full border border-white/10 py-1 pl-1 pr-2.5 text-xs font-medium text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-[10px] font-bold text-ink-900">
        {initial}
      </span>
      {name}
      <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 text-zinc-500" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}
