// dashboard/wallets/page.tsx — página de carteiras financeiras

'use client'

import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

type Wallet = {
  id: string; name: string; type: string; balance: string
  _count: { transactions: number }
}

// label legível para cada tipo de carteira
const tipoLabel: Record<string, string> = {
  CHECKING: 'Conta Corrente', SAVINGS: 'Poupança',
  CASH: 'Dinheiro', INVESTMENT: 'Investimento',
}

function brl(v: string) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function WalletsPage() {
  const [carteiras, setCarteiras] = useState<Wallet[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [name, setName]           = useState('')
  const [type, setType]           = useState('CHECKING')
  const [saving, setSaving]       = useState(false)
  const [erro, setErro]           = useState('')

  function loadCarteiras() {
    setLoading(true)
    api.get<Wallet[]>('/wallets')
      .then(setCarteiras)
      .catch((err: Error) => setErro(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadCarteiras() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/wallets', { name, type })
      setName(''); setShowForm(false)
      loadCarteiras()
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deletar esta carteira?')) return
    await api.delete(`/wallets/${id}`)
    loadCarteiras()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Carteiras</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          {showForm ? 'Cancelar' : '+ Nova carteira'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Ex: Conta Nubank" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="CHECKING">Conta Corrente</option>
              <option value="SAVINGS">Poupança</option>
              <option value="CASH">Dinheiro</option>
              <option value="INVESTMENT">Investimento</option>
            </select>
          </div>
          <button type="submit" disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      )}

      {erro && <p className="text-red-500 text-sm mb-4">{erro}</p>}
      {loading ? <p className="text-gray-400">Carregando...</p> : (
        <div className="grid grid-cols-2 gap-4">
          {carteiras.length === 0 ? (
            <p className="col-span-2 text-center text-gray-400 py-10 text-sm">Nenhuma carteira cadastrada</p>
          ) : carteiras.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{tipoLabel[c.type] ?? c.type}</p>
                </div>
                <button onClick={() => handleDelete(c.id)} className="text-gray-300 hover:text-red-400 transition-colors text-sm">✕</button>
              </div>
              <p className="text-2xl font-bold text-gray-800">{brl(c.balance)}</p>
              <p className="text-xs text-gray-400 mt-1">{c._count.transactions} transação(ões)</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
