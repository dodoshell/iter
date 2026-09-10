import { CheckCircle2, Eye, FileEdit, Send, Undo2, XCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RichiestaEvento, StatoRichiesta } from '@/lib/types'
import { ETICHETTE_STATO } from './labels'

const ICONA_STATO: Record<StatoRichiesta, LucideIcon> = {
  BOZZA: FileEdit,
  INVIATA: Send,
  IN_REVISIONE: Eye,
  APPROVATA: CheckCircle2,
  RESPINTA: XCircle,
  RITIRATA: Undo2,
}

const COLORE_STATO: Record<StatoRichiesta, string> = {
  BOZZA: 'bg-secondary text-secondary-foreground',
  INVIATA: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  IN_REVISIONE: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  APPROVATA: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  RESPINTA: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  RITIRATA: 'bg-secondary text-secondary-foreground',
}

/** Cronologia della richiesta come timeline verticale: un nodo per ogni evento del registro. */
export function Timeline({ eventi }: { eventi: RichiestaEvento[] }) {
  if (eventi.length === 0) {
    return <p className="text-sm text-muted-foreground">Ancora nessun passaggio di stato.</p>
  }

  return (
    <ol className="relative space-y-6">
      {eventi.map((evento, indice) => {
        const Icona = ICONA_STATO[evento.statoNuovo]
        const ultimo = indice === eventi.length - 1
        return (
          <li key={evento.id} className="relative flex gap-3">
            {!ultimo && <span className="absolute top-8 left-[15px] h-[calc(100%-8px)] w-px bg-border" aria-hidden="true" />}
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full ring-4 ring-background',
                COLORE_STATO[evento.statoNuovo],
              )}
              aria-hidden="true"
            >
              <Icona className="size-4" />
            </span>
            <div className="min-w-0 flex-1 pb-1">
              <p className="text-sm text-foreground">
                {evento.statoPrecedente ? `${ETICHETTE_STATO[evento.statoPrecedente]} → ` : ''}
                <span className="font-medium">{ETICHETTE_STATO[evento.statoNuovo]}</span>
                <span className="text-muted-foreground"> — {evento.autoreNomeCompleto}</span>
              </p>
              {evento.motivazione && (
                <p className="mt-1 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">"{evento.motivazione}"</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">{new Date(evento.createdAt).toLocaleString('it-IT')}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
