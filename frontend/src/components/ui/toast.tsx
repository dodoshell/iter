import { CheckCircle2, X, XCircle } from 'lucide-react'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { ToastContext, type ToastVariant } from './toast-context'

interface ToastItem {
  id: number
  messaggio: string
  variante: ToastVariant
}

const DURATA_MS = 4000

let prossimoId = 0

/**
 * Notifiche non invasive per esiti di operazioni (creazione, transizioni di stato, ecc.).
 * Non sostituiscono gli errori di validazione inline nei form: quelli restano accanto al campo.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const rimuovi = useCallback((id: number) => {
    setToasts((correnti) => correnti.filter((toast) => toast.id !== id))
  }, [])

  const mostra = useCallback(
    (messaggio: string, variante: ToastVariant = 'success') => {
      const id = prossimoId++
      setToasts((correnti) => [...correnti, { id, messaggio, variante }])
      setTimeout(() => rimuovi(id), DURATA_MS)
    },
    [rimuovi],
  )

  const value = useMemo(() => ({ mostra }), [mostra])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={cn(
              'pointer-events-auto flex w-full max-w-sm animate-in fade-in slide-in-from-bottom-2 items-start gap-2 rounded-lg border p-3 text-sm shadow-md duration-200',
              toast.variante === 'success'
                ? 'border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-200'
                : 'border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200',
            )}
          >
            {toast.variante === 'success' ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            ) : (
              <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            )}
            <p className="flex-1">{toast.messaggio}</p>
            <button
              type="button"
              onClick={() => rimuovi(toast.id)}
              aria-label="Chiudi notifica"
              className="shrink-0 rounded text-current/60 hover:text-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
