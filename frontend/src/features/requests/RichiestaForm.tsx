import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import type { TipoRichiesta } from '@/lib/types'
import { ETICHETTE_TIPO } from './labels'

export interface ValoriForm {
  tipo: TipoRichiesta
  dataInizio: string
  dataFine: string
  note: string
}

interface RichiestaFormProps {
  valoriIniziali?: ValoriForm
  etichettaSubmit: string
  inCorso: boolean
  errore: string | null
  onSubmit: (valori: ValoriForm) => void
  onAnnulla?: () => void
}

const VALORI_VUOTI: ValoriForm = { tipo: 'FERIE', dataInizio: '', dataFine: '', note: '' }

export function RichiestaForm({ valoriIniziali, etichettaSubmit, inCorso, errore, onSubmit, onAnnulla }: RichiestaFormProps) {
  const [valori, setValori] = useState<ValoriForm>(valoriIniziali ?? VALORI_VUOTI)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSubmit(valori)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="tipo" className="text-sm font-medium text-foreground">
          Tipo
        </label>
        <select
          id="tipo"
          value={valori.tipo}
          onChange={(event) => setValori({ ...valori, tipo: event.target.value as TipoRichiesta })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        >
          {Object.entries(ETICHETTE_TIPO).map(([valore, etichetta]) => (
            <option key={valore} value={valore}>
              {etichetta}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="dataInizio" className="text-sm font-medium text-foreground">
            Data inizio
          </label>
          <input
            id="dataInizio"
            type="date"
            required
            value={valori.dataInizio}
            onChange={(event) => setValori({ ...valori, dataInizio: event.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="dataFine" className="text-sm font-medium text-foreground">
            Data fine
          </label>
          <input
            id="dataFine"
            type="date"
            required
            value={valori.dataFine}
            onChange={(event) => setValori({ ...valori, dataFine: event.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="note" className="text-sm font-medium text-foreground">
          Note
        </label>
        <textarea
          id="note"
          rows={3}
          value={valori.note}
          onChange={(event) => setValori({ ...valori, note: event.target.value })}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {errore && <p className="text-sm text-destructive">{errore}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={inCorso}>
          {inCorso ? 'Salvataggio…' : etichettaSubmit}
        </Button>
        {onAnnulla && (
          <Button type="button" variant="outline" onClick={onAnnulla}>
            Annulla
          </Button>
        )}
      </div>
    </form>
  )
}
