// dashboard/transactions/page.tsx — página de transações financeiras

'use client'

import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

// estrutura de uma transação retornada pelo backend
type Transaction = {
  id: string
  description: string
  amount: string
  type: 'INCOME' | 'EXPENSE'
  category?: string
  date: string
  wallet?: { id: string; name: string } | null
}

// estrutura simplificada de carteira para preencher o seletor
type WalletOption = {
  id: string
  name: string
}

// formata número como moeda brasileira
function brl(v: string) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// formata data ISO para exibição no formato dd/mm/aaaa
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

export default function TransactionsPage() {
  const [transacoes, setTransacoes] = useState<Transaction[]>([])
  const [carteiras, setCarteiras]   = useState<WalletOption[]>([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [erro, setErro]             = useState('')

  // campos do formulário de nova transação
  const [description, setDescription] = useState('')
  const [amount, setAmount]           = useState('')
  const [type, setType]               = useState<'INCOME' | 'EXPENSE'>('INCOME')
  const [category, setCategory]       = useState('')
  const [date, setDate]               = useState(new Date().toISOString().split('T')[0])
  const [walletId, setWalletId]       = useState('')  // carteira vinculada (opcional)
  const [saving, setSaving]           = useState(false)

  // carrega transações e carteiras ao entrar na página
  function loadTransacoes() {
    setLoading(true)
    api.get<Transaction[]>('/transactions')
      .then(setTransacoes)
      .catch((err: Error) => setErro(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadTransacoes()
    // carrega as carteiras para preencher o seletor no formulário
    api.get<WalletOption[]>('/wallets').then(setCarteiras).catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/transactions', {
        description,
        amount,
        type,
        category: category || undefined,
        date: new Date(date).toISOString(),
        // envia walletId apenas se o usuário selecionou uma carteira
        walletId: walletId || undefined,
      })
      // limpa o formulário e recarrega a lista
      setDescription(''); setAmount(''); setCategory(''); setWalletId(''); setShowForm(false)
      loadTransacoes()
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deletar esta transação?')) return
    await api.delete(`/transactions/${id}`)
    loadTransacoes()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Transações</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Nova transação'}
        </button>
      </div>

      {/* formulário de nova transação */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Descrição</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Ex: Salário" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Valor (R$)</label>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="5000.00" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value as 'INCOME' | 'EXPENSE')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="INCOME">Entrada (INCOME)</option>
              <option value="EXPENSE">Saída (EXPENSE)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Categoria (opcional)</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Ex: Alimentação" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Data</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          {/* seletor de carteira — vincula a transação a uma carteira para afetar seu saldo */}
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Carteira (opcional — afeta o saldo da carteira selecionada)
            </label>
            <select value={walletId} onChange={(e) => setWalletId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">— Sem carteira —</option>
              {carteiras.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <button type="submit" disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
              {saving ? 'Salvando...' : 'Salvar transação'}
            </button>
          </div>
        </form>
      )}

      {erro && <p className="text-red-500 text-sm mb-4">{erro}</p>}
      {loading ? <p className="text-gray-400">Carregando...</p> : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {transacoes.length === 0 ? (
            <p className="text-center text-gray-400 py-10 text-sm">Nenhuma transação cadastrada</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Descrição</th>
                  <th className="text-left px-4 py-3">Categoria</th>
                  <th className="text-left px-4 py-3">Carteira</th>
                  <th className="text-left px-4 py-3">Data</th>
                  <th className="text-right px-4 py-3">Valor</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {transacoes.map((t) => (
                  <tr key={t.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{t.description}</td>
                    <td className="px-4 py-3 text-gray-400">{t.category ?? '—'}</td>
                    {/* exibe o nome da carteira vinculada ou um traço se não houver */}
                    <td className="px-4 py-3 text-gray-400">{t.wallet?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(t.date)}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                      {t.type === 'INCOME' ? '+' : '-'} {brl(t.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(t.id)} className="text-gray-300 hover:text-red-400 transition-colors">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
