// lib/api.ts — cliente HTTP centralizado para comunicar com o backend

// BASE_URL aponta para o backend. Em Docker: http://localhost:3000
// Para rodar o frontend fora do Docker, crie frontend/.env.local com:
//   NEXT_PUBLIC_API_URL=http://localhost:3000
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000') + '/api'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export function saveToken(token: string) {
  localStorage.setItem('token', token)
  document.cookie = `token=${token}; path=/; SameSite=Lax`
}

export function clearToken() {
  localStorage.removeItem('token')
  localStorage.removeItem('userName')
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  // token expirado ou inválido — redireciona para login
  if (response.status === 401) {
    clearToken()
    window.location.href = '/'
    throw new Error('Sessão expirada')
  }

  if (response.status === 204) return null as T

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message ?? 'Erro na requisição')
  }

  return data as T
}

export const api = {
  get:    <T>(path: string)                 => request<T>(path),
  post:   <T>(path: string, body: unknown)  => request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown)  => request<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: <T>(path: string)                 => request<T>(path, { method: 'DELETE' }),
}
