import { createContext, useContext } from 'react'
import type { Me } from '@/lib/types'

export interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  user: Me | undefined
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve essere usato dentro un AuthProvider')
  }
  return context
}
