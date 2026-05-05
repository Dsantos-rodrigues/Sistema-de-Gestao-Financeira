// dashboard/assets/page.tsx — página de ativos financeiros

'use client'

import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

type Asset = {
  id: string; name: string; ticker?: string; type: string
  quantity: string; purchasePrice: string; currentPrice: string
  totalValue: number; totalCost: number; profitLoss: number
  purchasedAt: string
}

const tipoLabel: Record<string, string> = {
  STOCK: 'Ação', CRYPTO: 'Cripto', REAL_ESTATE: 'Imóvel',
  FIXED_INCOME: 'Renda Fixa', FUND: 'Fundo', OTHER: 'Outro',
}

function brl(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function AssetsPage() {
  const [ativos, setAtivos]   = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [erro, setErro]       = useState('')
  const [saving, setSaving]   = useState(false)

  // campos do formulário
  const [name, setName]                 = useState('')
  const [ticker, setTicker]             = useState('')
  const [type, setType]                 = useState('STOCK')
  const [quantity, setQuantity]         = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [currentPrice, setCurrentPrice] = useState('')
  const [purchasedAt, setPurchasedAt]   = useState(new Date().toISOString().split('T')[0])

  function loadAtivos() {
    setLoading(true)
    api.get<Asset[]>('/assets')
      .then(setAtivos)
      .catch((err: Error) => setErro(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadAtivos() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/assets', {
        name, ticker: ticker || undefined, type,
        quantity, purchasePrice, currentPrice,
        purchasedAt: new Date(purchasedAt).toISOString(),
      })
      setName(''); setTicker(''); setQuantity(''); setPurchasePrice(''); setCurrentPrice('')
      setShowForm(false); loadAtivos()
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Deletar este ativo?')) return
    await api.delete(`/assets/${id}`)
    loadAtivos()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Ativos</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          {showForm ? 'Cancelar' : '+ Novo ativo'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Petrobras" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Ticker (opcional)</label>
            <input value={ticker} onChange={(e) => setTicker(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="PETR4" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
              {Object.entries(tipoLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Quantidade</label>
            <input value={quantity} onChange={(e) => setQuantity(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="10" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Preço de compra (R$)</label>
            <input value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="35.50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Preço atual (R$)</label>
            <input value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="42.00" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Data da compra</label>
            <input type="date" value={purchasedAt} onChange={(e) => setPurchasedAt(e.target.value)} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="col-span-3">
            <button type="submit" disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
              {saving ? 'Salvando...' : 'Salvar ativo'}
            </button>
          </div>
        </form>
      )}

      {erro && <p className="text-red-500 text-sm mb-4">{erro}</p>}
      {loading ? <p className="text-gray-400">Carregando...</p> : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {ativos.length === 0 ? (
            <p className="text-center text-gray-400 py-10 text-sm">Nenhum ativo cadastrado</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Ativo</th>
                  <th className="text-left px-4 py-3">Tipo</th>
                  <th className="text-right px-4 py-3">Qtd</th>
                  <th className="text-right px-4 py-3">Valor atual</th>
                  <th className="text-right px-4 py-3">Lucro/Prej.</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {ativos.map((a) => (
                  <tr key={a.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{a.name}</p>
                      {a.ticker && <p className="text-xs text-gray-400">{a.ticker}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{tipoLabel[a.type] ?? a.type}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{a.quantity}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">{brl(a.totalValue)}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${a.profitLoss >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {a.profitLoss >= 0 ? '+' : ''}{brl(a.profitLoss)}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(a.id)} className="text-gray-300 hover:text-red-400 transition-colors">✕</button>
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
