import { clearToken, getToken } from './auth-storage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

interface ErrorePayload {
  codice?: string
  messaggio?: string
  campo?: string
}

export class ApiError extends Error {
  readonly codice: string
  readonly campo: string | undefined
  readonly status: number

  constructor(codice: string, message: string, campo: string | undefined, status: number) {
    super(message)
    this.codice = codice
    this.campo = campo
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })

  if (response.status === 401) {
    // Token mancante, scaduto o non più valido: non ha senso tenerlo in giro.
    clearToken()
  }

  if (!response.ok) {
    const payload: ErrorePayload = await response.json().catch(() => ({}))
    throw new ApiError(
      payload.codice ?? 'ERRORE_SCONOSCIUTO',
      payload.messaggio ?? 'Si è verificato un errore imprevisto',
      payload.campo,
      response.status,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
}
