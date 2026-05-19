// layout.tsx — layout raiz da aplicação Next.js
// Envolve todas as páginas com fontes e estilos globais

import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

// fonte principal da aplicação
const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Sistema de Gestão Financeira',
  description: 'Gerencie suas finanças, carteiras e investimentos',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={geist.variable}>
      <body className="min-h-screen bg-gray-50 font-sans">{children}</body>
    </html>
  )
}
