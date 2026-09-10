import { Link } from 'react-router'
import { cn } from '@/lib/utils'
import type { Richiesta } from '@/lib/types'
import { ETICHETTE_TIPO } from './labels'
import { StatoBadge } from './StatoBadge'

interface RequestCardProps {
  richiesta: Richiesta
  mostraProprietario: boolean
}

/** Rappresentazione a card di una richiesta, usata su schermi stretti al posto della tabella. */
export function RequestCard({ richiesta, mostraProprietario }: RequestCardProps) {
  return (
    <Link
      to={`/richieste/${richiesta.id}`}
      className="block rounded-lg border border-border bg-card p-4 shadow-sm transition hover:border-ring hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {mostraProprietario && (
            <p className="truncate text-sm font-medium text-foreground">{richiesta.userNomeCompleto}</p>
          )}
          <p className={cn('text-sm', mostraProprietario ? 'text-muted-foreground' : 'font-medium text-foreground')}>
            {ETICHETTE_TIPO[richiesta.tipo]}
          </p>
        </div>
        <StatoBadge stato={richiesta.stato} />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {richiesta.dataInizio} → {richiesta.dataFine}
      </p>
    </Link>
  )
}
