import { useState } from 'react'
import { useParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast-context'
import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/features/auth/auth-context'
import { ApiError } from '@/lib/api'
import { useApplicaTransizione, useModificaRichiesta, useRichiestaDettaglio } from './api'
import { azioniDisponibili, puoModificare, type AzioneDisponibile } from './azioni'
import { ETICHETTE_TIPO, MESSAGGIO_SUCCESSO_AZIONE } from './labels'
import { RichiestaForm, type ValoriForm } from './RichiestaForm'
import { StatoBadge } from './StatoBadge'
import { Timeline } from './Timeline'

export function RequestDetailPage() {
  const { id } = useParams()
  const richiestaId = Number(id)
  const { user } = useAuth()
  const dettaglioQuery = useRichiestaDettaglio(richiestaId)
  const [inModifica, setInModifica] = useState(false)

  if (!user) return null

  if (dettaglioQuery.isLoading) {
    return (
      <main className="mx-auto max-w-2xl p-4 sm:p-6">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="mt-4 h-40 w-full" />
        <Skeleton className="mt-6 h-32 w-full" />
      </main>
    )
  }

  if (dettaglioQuery.isError || !dettaglioQuery.data) {
    return (
      <main className="mx-auto max-w-2xl p-4 sm:p-6">
        <PageHeader titolo="Richiesta" backHref="/" />
        <p className="mt-4 text-sm text-destructive">Impossibile trovare questa richiesta, o non sei autorizzato a vederla.</p>
      </main>
    )
  }

  const { richiesta, cronologia } = dettaglioQuery.data
  const azioni = azioniDisponibili(richiesta, user)

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6">
      <PageHeader
        titolo={`Richiesta di ${richiesta.userNomeCompleto}`}
        backHref="/"
        azioni={<StatoBadge stato={richiesta.stato} />}
      />

      <section className="mt-4 rounded-lg border border-border bg-card p-6 shadow-sm">
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
            <dl className="grid grid-cols-1 gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Tipo</dt>
                <dd className="mt-0.5 font-medium text-foreground">{ETICHETTE_TIPO[richiesta.tipo]}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Periodo</dt>
                <dd className="mt-0.5 font-medium text-foreground">
                  {richiesta.dataInizio} → {richiesta.dataFine}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Note</dt>
                <dd className="mt-0.5 text-foreground">{richiesta.note || '—'}</dd>
              </div>
            </dl>

            <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-5">
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
        <div className="mt-3">
          <Timeline eventi={cronologia} />
        </div>
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
  const { mostra } = useToast()
  const [errore, setErrore] = useState<string | null>(null)

  function handleSubmit(valori: ValoriForm) {
    setErrore(null)
    modificaRichiesta.mutate(valori, {
      onSuccess: () => {
        mostra('Modifiche salvate')
        onSalvato()
      },
      onError: (err) => {
        const messaggio = err instanceof ApiError ? err.message : 'Errore imprevisto, riprova.'
        setErrore(messaggio)
        mostra(messaggio, 'error')
      },
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

// Le azioni senza motivazione ma "distruttive" (ritira) e l'approvazione passano comunque
// da un dialog di conferma: sono transizioni difficili da annullare per chi le subisce.
function richiedeConferma(azione: AzioneDisponibile): boolean {
  return azione.richiedeMotivazione || azione.distruttiva === true || azione.azione === 'APPROVA'
}

function AzioneButton({ richiestaId, azione }: { richiestaId: number; azione: AzioneDisponibile }) {
  const applicaTransizione = useApplicaTransizione(richiestaId)
  const { mostra } = useToast()
  const [dialogAperto, setDialogAperto] = useState(false)
  const [motivazione, setMotivazione] = useState('')
  const [erroreDialog, setErroreDialog] = useState<string | null>(null)

  function esegui(motivazioneTesto?: string) {
    setErroreDialog(null)
    applicaTransizione.mutate(
      { azione: azione.azione, motivazione: motivazioneTesto },
      {
        onSuccess: () => {
          setDialogAperto(false)
          setMotivazione('')
          mostra(MESSAGGIO_SUCCESSO_AZIONE[azione.azione])
        },
        onError: (err) => {
          const messaggio = err instanceof ApiError ? err.message : 'Errore imprevisto, riprova.'
          setErroreDialog(messaggio)
          mostra(messaggio, 'error')
        },
      },
    )
  }

  if (!richiedeConferma(azione)) {
    return (
      <Button size="sm" isLoading={applicaTransizione.isPending} onClick={() => esegui()}>
        {azione.etichetta}
      </Button>
    )
  }

  return (
    <>
      <Button size="sm" variant={azione.distruttiva ? 'destructive' : 'default'} onClick={() => setDialogAperto(true)}>
        {azione.etichetta}
      </Button>
      <Dialog
        aperto={dialogAperto}
        onChiudi={() => {
          setDialogAperto(false)
          setErroreDialog(null)
        }}
        titolo={`Conferma: ${azione.etichetta.toLowerCase()}`}
        descrizione={
          azione.richiedeMotivazione
            ? 'Questa azione richiede una motivazione visibile nella cronologia.'
            : 'Questa azione non può essere annullata.'
        }
        footer={
          <>
            <Button variant="outline" onClick={() => setDialogAperto(false)} disabled={applicaTransizione.isPending}>
              Annulla
            </Button>
            <Button
              variant={azione.distruttiva ? 'destructive' : 'default'}
              isLoading={applicaTransizione.isPending}
              disabled={azione.richiedeMotivazione && !motivazione.trim()}
              onClick={() => esegui(azione.richiedeMotivazione ? motivazione : undefined)}
            >
              {azione.etichetta}
            </Button>
          </>
        }
      >
        {azione.richiedeMotivazione && (
          <div className="space-y-1">
            <label htmlFor={`motivazione-${azione.azione}`} className="text-sm font-medium text-foreground">
              Motivazione
            </label>
            <textarea
              id={`motivazione-${azione.azione}`}
              rows={3}
              value={motivazione}
              onChange={(event) => setMotivazione(event.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}
        {erroreDialog && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {erroreDialog}
          </p>
        )}
      </Dialog>
    </>
  )
}
