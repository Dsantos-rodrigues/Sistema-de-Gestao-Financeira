"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { MarketQuote, MarketSearchResult } from "../../lib/types";
import { Modal, ModalFooter } from "./Modal";
import {
  ColorPalette,
  Field,
  GhostButton,
  PrimaryButton,
  SegmentedControl,
  Select,
  inputCls,
} from "./forms";

const ASSET_CLASSES = [
  { value: "acoes", label: "Ações BR" },
  { value: "fii", label: "FII" },
  { value: "etf", label: "ETF Exterior" },
  { value: "cripto", label: "Cripto" },
  { value: "rf", label: "Renda fixa" },
] as const;

// mapeia as classes do formulário para os AssetType do backend
const CLASS_TO_TYPE: Record<string, string> = {
  acoes: "STOCK",
  fii:   "REAL_ESTATE",
  etf:   "FUND",
  cripto: "CRYPTO",
  rf:    "FIXED_INCOME",
};

// mapeia os tipos de transação do formulário para INCOME/EXPENSE
const TX_TO_TYPE: Record<string, string> = {
  buy:      "EXPENSE",
  sell:     "INCOME",
  div:      "INCOME",
  deposit:  "INCOME",
  withdraw: "EXPENSE",
};

const INSTITUTIONS = [
  { value: "itau", label: "Itaú" },
  { value: "clear", label: "Clear" },
  { value: "xp", label: "XP Investimentos" },
  { value: "nubank", label: "Nubank" },
  { value: "avenue", label: "Avenue" },
  { value: "binance", label: "Binance" },
  { value: "outra", label: "Outra" },
];

const TX_TYPES = [
  { value: "buy", label: "Compra" },
  { value: "sell", label: "Venda" },
  { value: "div", label: "Dividendo" },
  { value: "deposit", label: "Aporte" },
  { value: "withdraw", label: "Saque" },
] as const;

const CATEGORY_KIND = [
  { value: "expense", label: "Despesa" },
  { value: "income", label: "Receita" },
] as const;

const CATEGORY_COLORS = [
  { value: "#c89b3c", label: "Dourado" },
  { value: "#18181b", label: "Tinta" },
  { value: "#475569", label: "Ardósia" },
  { value: "#92400e", label: "Cobre" },
  { value: "#a1a1aa", label: "Cinza" },
  { value: "#047857", label: "Esmeralda" },
  { value: "#9f1239", label: "Carmim" },
  { value: "#1d4ed8", label: "Índigo" },
];

type AssetClass = (typeof ASSET_CLASSES)[number]["value"];
type TxType = (typeof TX_TYPES)[number]["value"];
type CategoryKind = (typeof CATEGORY_KIND)[number]["value"];

export function AssetModal({ onClose }: { onClose: () => void }) {
  const [cls, setCls] = useState<AssetClass>("acoes");
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState("");
  const [ticker, setTicker] = useState("");
  const [assetName, setAssetName] = useState("");
  const [avgPrice, setAvgPrice] = useState("");
  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<MarketSearchResult | null>(null);
  const [suggestions, setSuggestions] = useState<MarketSearchResult[]>([]);
  const [searchStatus, setSearchStatus] = useState<
    "idle" | "loading" | "found" | "not-found" | "error"
  >("idle");
  const [quoteStatus, setQuoteStatus] = useState<
    "idle" | "loading" | "found" | "not-found" | "error"
  >("idle");

  useEffect(() => {
    const symbol = ticker.trim().toUpperCase();
    const isSelectedTicker = selectedAsset?.symbol === symbol;

    if (isSelectedTicker) return;

    setQuote(null);
    setSelectedAsset(null);
    setSuggestions([]);

    if (symbol.length < 2) {
      setSearchStatus("idle");
      return;
    }

    let cancelled = false;
    setSearchStatus("loading");

    const timer = window.setTimeout(async () => {
      try {
        const data = await api.get<MarketSearchResult[]>(
          `/market/search?q=${encodeURIComponent(symbol)}&kind=${encodeURIComponent(cls)}`,
        );
        if (cancelled) return;

        setSuggestions(data);
        setSearchStatus(data.length ? "found" : "not-found");
      } catch {
        if (!cancelled) {
          setSearchStatus("error");
        }
      }
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [cls, selectedAsset?.symbol, ticker]);

  useEffect(() => {
    if (!selectedAsset) {
      setQuoteStatus("idle");
      return;
    }

    let cancelled = false;
    setQuote(null);
    setQuoteStatus("loading");

    api
      .get<MarketQuote[]>(`/market/quotes?symbols=${encodeURIComponent(selectedAsset.symbol)}`)
      .then((data) => {
        if (cancelled) return;
        const nextQuote = data.find((item) => isUsableAssetQuote(item, cls)) ?? null;
        setQuote(nextQuote);
        setQuoteStatus(nextQuote ? "found" : "not-found");
      })
      .catch(() => {
        if (!cancelled) setQuoteStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [cls, selectedAsset]);

  function handleSelectAsset(asset: MarketSearchResult) {
    setSelectedAsset(asset);
    setTicker(asset.symbol);
    setAssetName(asset.name);
    setSuggestions([]);
    setSearchStatus("idle");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      await api.post("/assets", {
        name:          assetName,
        ticker:        ticker || undefined,
        type:          CLASS_TO_TYPE[cls],
        quantity:      fd.get("qty") as string,
        purchasePrice: avgPrice,
        currentPrice:  quote && isUsableAssetQuote(quote, cls) ? String(quote.price) : avgPrice,
        purchasedAt:   new Date(fd.get("date") as string).toISOString(),
      });
      onClose();
      window.location.reload(); // recarrega para atualizar patrimônio
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar ativo");
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title="Adicionar ativo"
      description="Cadastre uma posição manual no seu portfólio"
      size="lg"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        {erro && (
          <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {erro}
          </div>
        )}
        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          <Field
            label="Classe do ativo"
            required
            className="sm:col-span-2"
          >
            <SegmentedControl
              options={[...ASSET_CLASSES]}
              value={cls}
              onChange={setCls}
              ariaLabel="Classe do ativo"
            />
          </Field>

          <Field label="Ticker / Símbolo" required>
            <div className="flex flex-col gap-2">
              <input
                name="ticker"
                required
                value={ticker}
                onChange={(event) => {
                  setTicker(event.target.value.toUpperCase());
                  setQuote(null);
                  setSelectedAsset(null);
                }}
                placeholder="VALE3, HGLG11, VOO, BTC..."
                className={`${inputCls} font-mono uppercase`}
              />
              <AssetSearchSuggestions
                status={searchStatus}
                suggestions={suggestions}
                onSelect={handleSelectAsset}
              />
              <QuoteLookupStatus
                assetClass={cls}
                selectedAsset={selectedAsset}
                quote={quote}
                status={quoteStatus}
                onUsePrice={() => setAvgPrice(String(quote?.price ?? ""))}
              />
            </div>
          </Field>

          <Field label="Nome do ativo" required>
            <input
              name="name"
              required
              value={assetName}
              onChange={(event) => setAssetName(event.target.value)}
              placeholder="Ex.: Vale ON"
              className={inputCls}
            />
          </Field>

          <Field label="Quantidade" required>
            <input
              name="qty"
              type="number"
              step="any"
              min="0"
              required
              placeholder="0"
              className={`${inputCls} tabular-nums`}
            />
          </Field>

          <Field label="Preço médio (R$)" required>
            <input
              name="avgPrice"
              type="number"
              step="0.01"
              min="0"
              required
              value={avgPrice}
              onChange={(event) => setAvgPrice(event.target.value)}
              placeholder="0,00"
              className={`${inputCls} tabular-nums`}
            />
          </Field>

          <Field label="Data da compra" required>
            <input
              name="date"
              type="date"
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
              className={inputCls}
            />
          </Field>

          <Field label="Instituição" required>
            <Select name="institution" options={INSTITUTIONS} />
          </Field>

          <Field
            label="Observações"
            hint="Opcional"
            className="sm:col-span-2"
          >
            <textarea
              name="notes"
              rows={2}
              placeholder="Tese de investimento, lembretes…"
              className={`${inputCls} resize-none`}
            />
          </Field>
        </div>

        <ModalFooter>
          <GhostButton type="button" onClick={onClose}>
            Cancelar
          </GhostButton>
          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? "Salvando…" : "Adicionar ativo"}
          </PrimaryButton>
        </ModalFooter>
      </form>
    </Modal>
  );
}

function isCompleteFiiTicker(symbol: string) {
  return /^[A-Z]{4,5}11$/.test(symbol);
}

function isUsableAssetQuote(quote: MarketQuote, assetClass: AssetClass) {
  if (quote.source === "indisponivel") return false;
  if (!Number.isFinite(quote.price) || quote.price <= 0) return false;
  if (assetClass === "fii") return isCompleteFiiTicker(quote.resolvedSymbol ?? quote.symbol);
  return true;
}

function AssetSearchSuggestions({
  status,
  suggestions,
  onSelect,
}: {
  status: "idle" | "loading" | "found" | "not-found" | "error";
  suggestions: MarketSearchResult[];
  onSelect: (asset: MarketSearchResult) => void;
}) {
  if (status === "idle") return null;

  if (status === "loading") {
    return <p className="text-[11px] text-zinc-500">Buscando ativos...</p>;
  }

  if (status === "not-found") {
    return (
      <p className="text-[11px] text-amber-700">
        Nenhum ativo encontrado. Confira o ticker ou cadastre manualmente.
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="text-[11px] text-rose-600">
        Nao foi possivel buscar sugestoes agora.
      </p>
    );
  }

  return (
    <div className="max-h-44 overflow-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
      {suggestions.map((asset) => (
        <button
          key={asset.symbol}
          type="button"
          onClick={() => onSelect(asset)}
          className="flex w-full items-center justify-between gap-3 border-b border-zinc-100 px-3 py-2 text-left last:border-b-0 hover:bg-zinc-50"
        >
          <span className="min-w-0">
            <span className="block font-mono text-xs font-semibold text-zinc-900">
              {asset.symbol}
            </span>
            <span className="block truncate text-[11px] text-zinc-500">{asset.name}</span>
          </span>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium uppercase text-zinc-600">
            {asset.kind}
          </span>
        </button>
      ))}
    </div>
  );
}

function QuoteLookupStatus({
  assetClass,
  selectedAsset,
  quote,
  status,
  onUsePrice,
}: {
  assetClass: AssetClass;
  selectedAsset: MarketSearchResult | null;
  quote: MarketQuote | null;
  status: "idle" | "loading" | "found" | "not-found" | "error";
  onUsePrice: () => void;
}) {
  void assetClass;

  if (status === "idle") {
    if (selectedAsset) {
      return (
        <p className="text-[11px] text-zinc-500">
          Ativo selecionado. A cotacao sera buscada automaticamente.
        </p>
      );
    }

    return (
      <p className="text-[11px] text-zinc-500">
        Digite o ticker para buscar a cotação atual.
      </p>
    );
  }

  if (status === "loading") {
    return <p className="text-[11px] text-zinc-500">Buscando na API...</p>;
  }

  if (status === "not-found") {
    return (
      <p className="text-[11px] text-amber-700">
        Ativo não encontrado. O cadastro seguirá com preço manual.
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="text-[11px] text-rose-600">
        Não foi possível consultar a cotação agora.
      </p>
    );
  }

  if (!quote) return null;

  const variation = quote.changePercent ?? quote.change;
  const positive = (variation ?? 0) >= 0;

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-emerald-950">
            {quote.resolvedSymbol ?? quote.symbol} · {quote.name}
          </p>
          <p className="mt-0.5 text-[11px] text-emerald-700">
            Cotação atual:{" "}
            <span className="font-semibold">{formatQuotePrice(quote)}</span>
            {variation != null && (
              <span className={positive ? "text-emerald-700" : "text-rose-600"}>
                {" "}
                ({positive ? "+" : ""}
                {variation.toFixed(2).replace(".", ",")}%)
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={onUsePrice}
          className="shrink-0 rounded-md border border-emerald-300 bg-white px-2 py-1 text-[11px] font-medium text-emerald-800 hover:bg-emerald-100"
        >
          Usar preço
        </button>
      </div>
    </div>
  );
}

function formatQuotePrice(quote: MarketQuote) {
  if (quote.currency === "%") {
    return `${quote.price.toFixed(2).replace(".", ",")}%`;
  }

  return quote.price.toLocaleString("pt-BR", {
    style: "currency",
    currency: quote.currency,
    minimumFractionDigits: 2,
  });
}

export function TransactionModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<TxType>("buy");
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState("");

  const showAsset = type === "buy" || type === "sell" || type === "div";
  const showQty = type === "buy" || type === "sell";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const ticker = fd.get("ticker") as string | null;
    const qty = fd.get("qty") as string | null;

    // monta a descrição a partir do tipo + ativo
    const descMap: Record<TxType, string> = {
      buy: `Compra${ticker ? " " + ticker : ""}${qty ? " × " + qty : ""}`,
      sell: `Venda${ticker ? " " + ticker : ""}${qty ? " × " + qty : ""}`,
      div: `Dividendo${ticker ? " " + ticker : ""}`,
      deposit: "Aporte",
      withdraw: "Saque",
    };

    try {
      await api.post("/transactions", {
        description: descMap[type],
        amount:      fd.get("value") as string,
        type:        TX_TO_TYPE[type],
        date:        new Date(fd.get("date") as string).toISOString(),
      });
      onClose();
      window.location.reload();
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar transação");
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title="Nova transação"
      description="Compra, venda, dividendo ou movimentação financeira"
      size="lg"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        {erro && (
          <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {erro}
          </div>
        )}
        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          <Field
            label="Tipo de transação"
            required
            className="sm:col-span-2"
          >
            <SegmentedControl
              options={[...TX_TYPES]}
              value={type}
              onChange={setType}
              ariaLabel="Tipo de transação"
            />
          </Field>

          {showAsset && (
            <Field
              label="Ativo"
              required
              className={showQty ? "" : "sm:col-span-2"}
            >
              <input
                name="ticker"
                required
                placeholder="VALE3, HGLG11, BTC…"
                className={`${inputCls} font-mono uppercase`}
              />
            </Field>
          )}

          {showQty && (
            <Field label="Quantidade" required>
              <input
                name="qty"
                type="number"
                step="any"
                min="0"
                required
                placeholder="0"
                className={`${inputCls} tabular-nums`}
              />
            </Field>
          )}

          <Field
            label={
              type === "buy" || type === "sell"
                ? "Preço por unidade (R$)"
                : "Valor total (R$)"
            }
            required
          >
            <input
              name="value"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0,00"
              className={`${inputCls} tabular-nums`}
            />
          </Field>

          <Field label="Data" required>
            <input
              name="date"
              type="date"
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
              className={inputCls}
            />
          </Field>

          <Field label="Instituição" required>
            <Select name="institution" options={INSTITUTIONS} />
          </Field>

          <Field
            label="Observações"
            hint="Opcional"
            className="sm:col-span-2"
          >
            <textarea
              name="notes"
              rows={2}
              placeholder="Detalhes da operação…"
              className={`${inputCls} resize-none`}
            />
          </Field>
        </div>

        <ModalFooter>
          <GhostButton type="button" onClick={onClose}>
            Cancelar
          </GhostButton>
          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? "Salvando…" : "Registrar transação"}
          </PrimaryButton>
        </ModalFooter>
      </form>
    </Modal>
  );
}

export function CategoryModal({ onClose }: { onClose: () => void }) {
  const [kind, setKind] = useState<CategoryKind>("expense");
  const [color, setColor] = useState(CATEGORY_COLORS[0].value);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onClose();
    }, 400);
  }

  return (
    <Modal
      title="Nova categoria"
      description="Personalize a classificação do seu fluxo de caixa"
      size="md"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 px-6 py-5">
          <Field label="Tipo" required>
            <SegmentedControl
              options={[...CATEGORY_KIND]}
              value={kind}
              onChange={setKind}
              ariaLabel="Tipo de categoria"
            />
          </Field>

          <Field label="Nome da categoria" required>
            <input
              name="name"
              required
              placeholder={
                kind === "expense"
                  ? "Ex.: Educação, Pets, Assinaturas…"
                  : "Ex.: Aluguéis, Freelas…"
              }
              className={inputCls}
            />
          </Field>

          <Field label="Cor" required>
            <ColorPalette
              value={color}
              onChange={setColor}
              colors={CATEGORY_COLORS}
            />
          </Field>

          {kind === "expense" && (
            <Field
              label="Limite mensal (R$)"
              hint="Opcional · usado para alertas"
            >
              <input
                name="limit"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                className={`${inputCls} tabular-nums`}
              />
            </Field>
          )}
        </div>

        <ModalFooter>
          <GhostButton type="button" onClick={onClose}>
            Cancelar
          </GhostButton>
          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? "Salvando…" : "Criar categoria"}
          </PrimaryButton>
        </ModalFooter>
      </form>
    </Modal>
  );
}
