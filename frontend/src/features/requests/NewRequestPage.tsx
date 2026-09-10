import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ApiError } from '@/lib/api'
import { PageHeader } from '@/components/PageHeader'
import { useToast } from '@/components/ui/toast-context'
import { useCreaRichiesta } from './api'
import { RichiestaForm, type ValoriForm } from './RichiestaForm'

export function NewRequestPage() {
  const navigate = useNavigate()
  const creaRichiesta = useCreaRichiesta()
  const { mostra } = useToast()
  const [errore, setErrore] = useState<string | null>(null)

  function handleSubmit(valori: ValoriForm) {
    setErrore(null)
    creaRichiesta.mutate(valori, {
      onSuccess: (richiesta) => {
        mostra('Richiesta creata come bozza')
        navigate(`/richieste/${richiesta.id}`)
      },
      onError: (err) => {
        const messaggio = err instanceof ApiError ? err.message : 'Errore imprevisto, riprova.'
        setErrore(messaggio)
        mostra(messaggio, 'error')
      },
    })
  }

  return (
    <main className="mx-auto max-w-lg p-4 sm:p-6">
      <PageHeader titolo="Nuova richiesta" backHref="/" />
      <div className="mt-4 rounded-lg border border-border bg-card p-6 shadow-sm">
        <RichiestaForm
          etichettaSubmit="Salva come bozza"
          inCorso={creaRichiesta.isPending}
          errore={errore}
          onSubmit={handleSubmit}
          onAnnulla={() => navigate(-1)}
        />
      </div>
    </main>
  )
}
