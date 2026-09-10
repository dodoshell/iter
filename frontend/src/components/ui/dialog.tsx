import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './button'

interface DialogProps {
  aperto: boolean
  onChiudi: () => void
  titolo: string
  descrizione?: string
  children?: ReactNode
  footer?: ReactNode
}

/**
 * Modale minimale e accessibile: niente libreria esterna, solo le basi che servono
 * per confermare un'azione critica (focus alla apertura, chiusura con Escape e overlay,
 * ruoli ARIA corretti).
 */
export function Dialog({ aperto, onChiudi, titolo, descrizione, children, footer }: DialogProps) {
  const contenutoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!aperto) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onChiudi()
    }

    document.addEventListener('keydown', onKeyDown)
    contenutoRef.current?.focus()
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [aperto, onChiudi])

  if (!aperto) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 animate-in fade-in bg-black/50 duration-150" aria-hidden="true" onClick={onChiudi} />
      <div
        ref={contenutoRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-titolo"
        aria-describedby={descrizione ? 'dialog-descrizione' : undefined}
        tabIndex={-1}
        className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 rounded-lg border border-border bg-card p-6 shadow-lg outline-none duration-150"
      >
        <h2 id="dialog-titolo" className="text-lg font-semibold text-foreground">
          {titolo}
        </h2>
        {descrizione && (
          <p id="dialog-descrizione" className="mt-1 text-sm text-muted-foreground">
            {descrizione}
          </p>
        )}
        {children && <div className="mt-4">{children}</div>}
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

interface ConfirmDialogProps {
  aperto: boolean
  titolo: string
  descrizione?: string
  etichettaConferma?: string
  distruttiva?: boolean
  inCorso?: boolean
  onConferma: () => void
  onAnnulla: () => void
}

/** Variante pronta di Dialog per il caso più comune: conferma/annulla su un'azione critica. */
export function ConfirmDialog({
  aperto,
  titolo,
  descrizione,
  etichettaConferma = 'Conferma',
  distruttiva = false,
  inCorso = false,
  onConferma,
  onAnnulla,
}: ConfirmDialogProps) {
  return (
    <Dialog
      aperto={aperto}
      onChiudi={onAnnulla}
      titolo={titolo}
      descrizione={descrizione}
      footer={
        <>
          <Button variant="outline" onClick={onAnnulla} disabled={inCorso}>
            Annulla
          </Button>
          <Button variant={distruttiva ? 'destructive' : 'default'} isLoading={inCorso} onClick={onConferma}>
            {etichettaConferma}
          </Button>
        </>
      }
    />
  )
}
