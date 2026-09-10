import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'

interface PaginationProps {
  pagina: number
  totalePagine: number
  onCambiaPagina: (pagina: number) => void
}

export function Pagination({ pagina, totalePagine, onCambiaPagina }: PaginationProps) {
  if (totalePagine <= 1) return null

  return (
    <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
      <span>
        Pagina {pagina} di {totalePagine}
      </span>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pagina <= 1}
          onClick={() => onCambiaPagina(pagina - 1)}
          aria-label="Pagina precedente"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Indietro
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pagina >= totalePagine}
          onClick={() => onCambiaPagina(pagina + 1)}
          aria-label="Pagina successiva"
        >
          Avanti
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
