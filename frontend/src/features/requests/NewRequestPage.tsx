import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ApiError } from '@/lib/api'
import { PageHeader } from '@/components/PageHeader'
import { useCreaRichiesta } from './api'
import { RichiestaForm, type ValoriForm } from './RichiestaForm'

export function NewRequestPage() {
  const navigate = useNavigate()
  const creaRichiesta = useCreaRichiesta()
  const [errore, setErrore] = useState<string | null>(null)

  function handleSubmit(valori: ValoriForm) {
    setErrore(null)
    creaRichiesta.mutate(valori, {
      onSuccess: (richiesta) => navigate(`/richieste/${richiesta.id}`),
      onError: (err) => setErrore(err instanceof ApiError ? err.message : 'Errore imprevisto, riprova.'),
    })
  }

  return (
    <main className="mx-auto max-w-lg p-6">
      <PageHeader titolo="Nuova richiesta" />
      <div className="mt-4 rounded-lg border border-border bg-card p-6">
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
