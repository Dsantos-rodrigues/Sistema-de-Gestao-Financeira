// dashboard/layout.tsx — layout compartilhado por todas as páginas do dashboard
// Contém a sidebar de navegação e verifica se o usuário está autenticado

'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { clearToken } from '../lib/api'

// itens de navegação da sidebar
const navItems = [
  { href: '/dashboard',              label: 'Patrimônio',   icon: '💰' },
  { href: '/dashboard/transactions', label: 'Transações',   icon: '↕️'  },
  { href: '/dashboard/wallets',      label: 'Carteiras',    icon: '👛'  },
  { href: '/dashboard/assets',       label: 'Ativos',       icon: '📈'  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // redireciona para login se não houver token salvo
    if (!localStorage.getItem('token')) {
      router.replace('/login')
    }
  }, [router])

  function handleLogout() {
    clearToken() // remove o token do localStorage
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen">
      {/* sidebar de navegação */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        {/* logo / título */}
        <div className="px-5 py-5 border-b border-gray-100">
          <h1 className="text-sm font-bold text-gray-800">Gestão Financeira</h1>
        </div>

        {/* links de navegação */}
        <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === item.href
                  ? 'bg-blue-50 text-blue-700 font-medium'  // item ativo
                  : 'text-gray-600 hover:bg-gray-50'         // item inativo
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* botão de logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <span>🚪</span> Sair
          </button>
        </div>
      </aside>

      {/* conteúdo da página atual */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
