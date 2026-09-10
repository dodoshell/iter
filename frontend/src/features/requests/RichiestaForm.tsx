import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { TipoRichiesta } from '@/lib/types'
import { ETICHETTE_TIPO } from './labels'

export interface ValoriForm {
  tipo: TipoRichiesta
  dataInizio: string
  dataFine: string
  note: string
}

interface ErroriForm {
  dataInizio?: string
  dataFine?: string
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
const INPUT_BASE =
  'w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring'
const INPUT_VALIDO = 'border-input'
const INPUT_INVALIDO = 'border-destructive focus:ring-destructive'

function valida(valori: ValoriForm): ErroriForm {
  const errori: ErroriForm = {}
  if (!valori.dataInizio) errori.dataInizio = 'Indica una data di inizio'
  if (!valori.dataFine) errori.dataFine = 'Indica una data di fine'
  if (valori.dataInizio && valori.dataFine && valori.dataFine < valori.dataInizio) {
    errori.dataFine = 'Non può precedere la data di inizio'
  }
  return errori
}

export function RichiestaForm({ valoriIniziali, etichettaSubmit, inCorso, errore, onSubmit, onAnnulla }: RichiestaFormProps) {
  const [valori, setValori] = useState<ValoriForm>(valoriIniziali ?? VALORI_VUOTI)
  const [erroriCampo, setErroriCampo] = useState<ErroriForm>({})

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const errori = valida(valori)
    setErroriCampo(errori)
    if (Object.keys(errori).length === 0) {
      onSubmit(valori)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="tipo" className="text-sm font-medium text-foreground">
          Tipo
        </label>
        <select
          id="tipo"
          value={valori.tipo}
          onChange={(event) => setValori({ ...valori, tipo: event.target.value as TipoRichiesta })}
          className={cn(INPUT_BASE, INPUT_VALIDO)}
        >
          {Object.entries(ETICHETTE_TIPO).map(([valore, etichetta]) => (
            <option key={valore} value={valore}>
              {etichetta}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="dataInizio" className="text-sm font-medium text-foreground">
            Data inizio
          </label>
          <input
            id="dataInizio"
            type="date"
            value={valori.dataInizio}
            onChange={(event) => setValori({ ...valori, dataInizio: event.target.value })}
            aria-invalid={Boolean(erroriCampo.dataInizio)}
            aria-describedby={erroriCampo.dataInizio ? 'dataInizio-errore' : undefined}
            className={cn(INPUT_BASE, erroriCampo.dataInizio ? INPUT_INVALIDO : INPUT_VALIDO)}
          />
          {erroriCampo.dataInizio && (
            <p id="dataInizio-errore" className="text-xs text-destructive">
              {erroriCampo.dataInizio}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <label htmlFor="dataFine" className="text-sm font-medium text-foreground">
            Data fine
          </label>
          <input
            id="dataFine"
            type="date"
            value={valori.dataFine}
            onChange={(event) => setValori({ ...valori, dataFine: event.target.value })}
            aria-invalid={Boolean(erroriCampo.dataFine)}
            aria-describedby={erroriCampo.dataFine ? 'dataFine-errore' : undefined}
            className={cn(INPUT_BASE, erroriCampo.dataFine ? INPUT_INVALIDO : INPUT_VALIDO)}
          />
          {erroriCampo.dataFine && (
            <p id="dataFine-errore" className="text-xs text-destructive">
              {erroriCampo.dataFine}
            </p>
          )}
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
          className={cn(INPUT_BASE, INPUT_VALIDO)}
        />
      </div>

      {errore && (
        <p role="alert" className="text-sm text-destructive">
          {errore}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" isLoading={inCorso}>
          {etichettaSubmit}
        </Button>
        {onAnnulla && (
          <Button type="button" variant="outline" onClick={onAnnulla} disabled={inCorso}>
            Annulla
          </Button>
        )}
      </div>
    </form>
  )
}
