import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState, type ReactNode } from 'react'
import { api } from '@/lib/api'
import { clearToken, getToken, setToken } from '@/lib/auth-storage'
import type { Me } from '@/lib/types'
import { AuthContext, type AuthContextValue } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [hasToken, setHasToken] = useState(() => Boolean(getToken()))
  const queryClient = useQueryClient()

  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get<Me>('/me'),
    enabled: hasToken,
    retry: false,
  })

  const login = useCallback(
    async (email: string, password: string) => {
      const { token } = await api.post<{ token: string }>('/auth/login', { email, password })
      setToken(token)
      setHasToken(true)
      await queryClient.invalidateQueries({ queryKey: ['me'] })
    },
    [queryClient],
  )

  const logout = useCallback(() => {
    clearToken()
    setHasToken(false)
    queryClient.removeQueries({ queryKey: ['me'] })
  }, [queryClient])

  // meQuery.isError copre sia le credenziali scadute (401 su /me) sia un token corrotto:
  // niente stato locale da tenere in sincronia, basta derivarlo qui.
  const value: AuthContextValue = {
    isAuthenticated: hasToken && !meQuery.isError,
    isLoading: hasToken && meQuery.isLoading,
    user: meQuery.data,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
