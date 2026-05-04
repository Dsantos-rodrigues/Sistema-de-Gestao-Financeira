"use client";

import { useState } from "react";
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
      title="Adicionar ativo"
      description="Cadastre uma posição manual no seu portfólio"
      size="lg"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
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
            <input
              name="ticker"
              required
              placeholder="VALE3, HGLG11, VOO, BTC…"
              className={`${inputCls} font-mono uppercase`}
            />
          </Field>

          <Field label="Nome do ativo" required>
            <input
              name="name"
              required
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

export function TransactionModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<TxType>("buy");
  const [submitting, setSubmitting] = useState(false);

  const showAsset = type === "buy" || type === "sell" || type === "div";
  const showQty = type === "buy" || type === "sell";

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
      title="Nova transação"
      description="Compra, venda, dividendo ou movimentação financeira"
      size="lg"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
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
