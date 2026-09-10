import { createContext, useContext } from 'react'

export type ToastVariant = 'success' | 'error'

export interface ToastContextValue {
  mostra: (messaggio: string, variante?: ToastVariant) => void
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast deve essere usato dentro un ToastProvider')
  }
  return context
}
