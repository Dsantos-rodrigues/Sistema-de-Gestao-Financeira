// lib/api.ts — cliente HTTP centralizado para comunicar com o backend
// Adiciona automaticamente o token JWT em todas as requisições autenticadas

const BASE_URL = 'http://localhost:3000/api'

// lê o token JWT salvo no localStorage
function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

// salva o token JWT no localStorage após login/registro
export function saveToken(token: string) {
  localStorage.setItem('token', token)
}

// remove o token JWT do localStorage ao fazer logout
export function clearToken() {
  localStorage.removeItem('token')
}

// função base de fetch — adiciona o token e trata erros automaticamente
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // adiciona o header de autorização apenas se houver token
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  // se a resposta for 204 (No Content), retorna null sem tentar parsear JSON
  if (response.status === 204) return null as T

  const data = await response.json()

  // lança erro com a mensagem do backend se a requisição falhar
  if (!response.ok) {
    throw new Error(data.message ?? 'Erro na requisição')
  }

  return data as T
}

// métodos HTTP exportados para uso nas páginas
export const api = {
  get:    <T>(path: string)                       => request<T>(path),
  post:   <T>(path: string, body: unknown)        => request<T>(path, { method: 'POST',  body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown)        => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string)                       => request<T>(path, { method: 'DELETE' }),
}
