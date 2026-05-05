// page.tsx — página raiz: redireciona para /dashboard se logado, ou /login se não

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // verifica se há token salvo e redireciona para a página correta
    const token = localStorage.getItem('token')
    router.replace(token ? '/dashboard' : '/login')
  }, [router])

  // tela de loading enquanto o redirecionamento acontece
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Carregando...</p>
    </div>
  )
}
