import { useState } from 'react'
import { useParams } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/features/auth/auth-context'
import { ApiError } from '@/lib/api'
import type { Azione } from '@/lib/types'
import { useApplicaTransizione, useModificaRichiesta, useRichiestaDettaglio } from './api'
import { azioniDisponibili, puoModificare, type AzioneDisponibile } from './azioni'
import { ETICHETTE_STATO, ETICHETTE_TIPO, VARIANTE_BADGE_STATO } from './labels'
import { RichiestaForm, type ValoriForm } from './RichiestaForm'

export function RequestDetailPage() {
  const { id } = useParams()
  const richiestaId = Number(id)
  const { user } = useAuth()
  const dettaglioQuery = useRichiestaDettaglio(richiestaId)
  const [inModifica, setInModifica] = useState(false)

  if (!user) return null

  if (dettaglioQuery.isLoading) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p className="text-sm text-muted-foreground">Caricamento…</p>
      </main>
    )
  }

  if (dettaglioQuery.isError || !dettaglioQuery.data) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <PageHeader titolo="Richiesta" backHref="/" />
        <p className="mt-4 text-sm text-destructive">Impossibile trovare questa richiesta, o non sei autorizzato a vederla.</p>
      </main>
    )
  }

  const { richiesta, cronologia } = dettaglioQuery.data
  const azioni = azioniDisponibili(richiesta, user)

  return (
    <main className="mx-auto max-w-2xl p-6">
      <PageHeader
        titolo={`Richiesta di ${richiesta.userNomeCompleto}`}
        backHref="/"
        azioni={<Badge variant={VARIANTE_BADGE_STATO[richiesta.stato]}>{ETICHETTE_STATO[richiesta.stato]}</Badge>}
      />

      <section className="mt-4 rounded-lg border border-border bg-card p-6">
        {inModifica ? (
          <FormModifica
            richiestaId={richiesta.id}
            valoriIniziali={{
              tipo: richiesta.tipo,
              dataInizio: richiesta.dataInizio,
              dataFine: richiesta.dataFine,
              note: richiesta.note ?? '',
            }}
            onAnnulla={() => setInModifica(false)}
            onSalvato={() => setInModifica(false)}
          />
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Tipo</dt>
              <dd className="text-foreground">{ETICHETTE_TIPO[richiesta.tipo]}</dd>
              <dt className="text-muted-foreground">Periodo</dt>
              <dd className="text-foreground">
                {richiesta.dataInizio} → {richiesta.dataFine}
              </dd>
              <dt className="text-muted-foreground">Note</dt>
              <dd className="text-foreground">{richiesta.note || '—'}</dd>
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
              {puoModificare(richiesta, user) && (
                <Button variant="outline" size="sm" onClick={() => setInModifica(true)}>
                  Modifica
                </Button>
              )}
              {azioni.map((azione) => (
                <AzioneButton key={azione.azione} richiestaId={richiesta.id} azione={azione} />
              ))}
            </div>
          </>
        )}
      </section>

      <section className="mt-6">
        <h3 className="text-sm font-semibold text-foreground">Cronologia</h3>
        <ol className="mt-2 space-y-2">
          {cronologia.length === 0 && <li className="text-sm text-muted-foreground">Ancora nessun passaggio di stato.</li>}
          {cronologia.map((evento) => (
            <li key={evento.id} className="rounded-md border border-border p-3 text-sm">
              <p className="text-foreground">
                {evento.statoPrecedente ? `${ETICHETTE_STATO[evento.statoPrecedente]} → ` : ''}
                {ETICHETTE_STATO[evento.statoNuovo]}
                <span className="text-muted-foreground"> — {evento.autoreNomeCompleto}</span>
              </p>
              {evento.motivazione && <p className="mt-1 text-muted-foreground">"{evento.motivazione}"</p>}
              <p className="mt-1 text-xs text-muted-foreground">{new Date(evento.createdAt).toLocaleString('it-IT')}</p>
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}

function FormModifica({
  richiestaId,
  valoriIniziali,
  onAnnulla,
  onSalvato,
}: {
  richiestaId: number
  valoriIniziali: ValoriForm
  onAnnulla: () => void
  onSalvato: () => void
}) {
  const modificaRichiesta = useModificaRichiesta(richiestaId)
  const [errore, setErrore] = useState<string | null>(null)

  function handleSubmit(valori: ValoriForm) {
    setErrore(null)
    modificaRichiesta.mutate(valori, {
      onSuccess: onSalvato,
      onError: (err) => setErrore(err instanceof ApiError ? err.message : 'Errore imprevisto, riprova.'),
    })
  }

  return (
    <RichiestaForm
      valoriIniziali={valoriIniziali}
      etichettaSubmit="Salva modifiche"
      inCorso={modificaRichiesta.isPending}
      errore={errore}
      onSubmit={handleSubmit}
      onAnnulla={onAnnulla}
    />
  )
}

function AzioneButton({ richiestaId, azione }: { richiestaId: number; azione: AzioneDisponibile }) {
  const applicaTransizione = useApplicaTransizione(richiestaId)
  const [mostraMotivazione, setMostraMotivazione] = useState(false)
  const [motivazione, setMotivazione] = useState('')
  const [errore, setErrore] = useState<string | null>(null)

  function esegui(azioneNome: Azione, motivazioneTesto?: string) {
    setErrore(null)
    applicaTransizione.mutate(
      { azione: azioneNome, motivazione: motivazioneTesto },
      {
        onError: (err) => setErrore(err instanceof ApiError ? err.message : 'Errore imprevisto, riprova.'),
      },
    )
  }

  if (azione.richiedeMotivazione && mostraMotivazione) {
    return (
      <div className="w-full space-y-2 rounded-md border border-border p-3">
        <label htmlFor={`motivazione-${azione.azione}`} className="text-sm font-medium text-foreground">
          Motivazione
        </label>
        <textarea
          id={`motivazione-${azione.azione}`}
          rows={2}
          value={motivazione}
          onChange={(event) => setMotivazione(event.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
        {errore && <p className="text-sm text-destructive">{errore}</p>}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            disabled={applicaTransizione.isPending || !motivazione.trim()}
            onClick={() => esegui(azione.azione, motivazione)}
          >
            Conferma
          </Button>
          <Button size="sm" variant="outline" onClick={() => setMostraMotivazione(false)}>
            Annulla
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <Button
        size="sm"
        variant={azione.distruttiva ? 'destructive' : 'default'}
        disabled={applicaTransizione.isPending}
        onClick={() => (azione.richiedeMotivazione ? setMostraMotivazione(true) : esegui(azione.azione))}
      >
        {azione.etichetta}
      </Button>
      {!mostraMotivazione && errore && <p className="text-sm text-destructive">{errore}</p>}
    </div>
  )
}
