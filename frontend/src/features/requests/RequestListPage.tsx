import { useState } from 'react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/features/auth/auth-context'
import { cn } from '@/lib/utils'
import type { Richiesta, StatoRichiesta } from '@/lib/types'
import { useRichieste } from './api'
import { ETICHETTE_STATO, ETICHETTE_TIPO, VARIANTE_BADGE_STATO } from './labels'

const STATI: StatoRichiesta[] = ['BOZZA', 'INVIATA', 'IN_REVISIONE', 'APPROVATA', 'RESPINTA', 'RITIRATA']
const STATI_IN_ATTESA: StatoRichiesta[] = ['INVIATA', 'IN_REVISIONE']

export function RequestListPage() {
  const { user } = useAuth()
  if (!user) return null

  if (user.ruolo === 'RESPONSABILE') {
    return <ListaResponsabile />
  }
  if (user.ruolo === 'ADMIN') {
    return <ListaAdmin />
  }
  return <ListaDipendente />
}

function ListaDipendente() {
  const [stato, setStato] = useState<StatoRichiesta | ''>('')
  const richiesteQuery = useRichieste(stato ? { stato } : {})

  return (
    <main className="mx-auto max-w-3xl p-6">
      <PageHeader
        titolo="Le mie richieste"
        azioni={
          <Button asChild>
            <Link to="/richieste/nuova">Nuova richiesta</Link>
          </Button>
        }
      />
      <FiltroStato stato={stato} onChange={setStato} className="mt-4" />
      <TabellaRichieste className="mt-4" query={richiesteQuery} mostraProprietario={false} />
    </main>
  )
}

function ListaResponsabile() {
  const [tab, setTab] = useState<'attesa' | 'storico'>('attesa')
  const richiesteQuery = useRichieste()

  const richieste = richiesteQuery.data?.filter((r) =>
    tab === 'attesa' ? STATI_IN_ATTESA.includes(r.stato) : !STATI_IN_ATTESA.includes(r.stato),
  )

  return (
    <main className="mx-auto max-w-3xl p-6">
      <PageHeader titolo="Richieste del team" />
      <div className="mt-4 flex gap-2">
        <Button variant={tab === 'attesa' ? 'default' : 'outline'} size="sm" onClick={() => setTab('attesa')}>
          In attesa
        </Button>
        <Button variant={tab === 'storico' ? 'default' : 'outline'} size="sm" onClick={() => setTab('storico')}>
          Storico
        </Button>
      </div>
      <TabellaRichieste
        className="mt-4"
        query={{ ...richiesteQuery, data: richieste }}
        mostraProprietario
      />
    </main>
  )
}

function ListaAdmin() {
  const [stato, setStato] = useState<StatoRichiesta | ''>('')
  const [userId, setUserId] = useState('')
  const [dataDa, setDataDa] = useState('')
  const [dataA, setDataA] = useState('')

  const richiesteQuery = useRichieste({
    stato: stato || undefined,
    userId: userId ? Number(userId) : undefined,
    dataDa: dataDa || undefined,
    dataA: dataA || undefined,
  })

  return (
    <main className="mx-auto max-w-4xl p-6">
      <PageHeader titolo="Tutte le richieste" />
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <FiltroStato stato={stato} onChange={setStato} />
        <div className="space-y-1">
          <label htmlFor="userId" className="text-sm font-medium text-foreground">
            ID utente
          </label>
          <input
            id="userId"
            type="number"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="dataDa" className="text-sm font-medium text-foreground">
            Dal
          </label>
          <input
            id="dataDa"
            type="date"
            value={dataDa}
            onChange={(event) => setDataDa(event.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="dataA" className="text-sm font-medium text-foreground">
            Al
          </label>
          <input
            id="dataA"
            type="date"
            value={dataA}
            onChange={(event) => setDataA(event.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      <TabellaRichieste className="mt-4" query={richiesteQuery} mostraProprietario />
    </main>
  )
}

function FiltroStato({
  stato,
  onChange,
  className,
}: {
  stato: StatoRichiesta | ''
  onChange: (stato: StatoRichiesta | '') => void
  className?: string
}) {
  return (
    <div className={className}>
      <label htmlFor="stato" className="text-sm font-medium text-foreground">
        Stato
      </label>
      <select
        id="stato"
        value={stato}
        onChange={(event) => onChange(event.target.value as StatoRichiesta | '')}
        className="ml-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Tutti</option>
        {STATI.map((s) => (
          <option key={s} value={s}>
            {ETICHETTE_STATO[s]}
          </option>
        ))}
      </select>
    </div>
  )
}

interface TabellaRichiesteProps {
  className?: string
  query: { data?: Richiesta[]; isLoading: boolean; isError: boolean }
  mostraProprietario: boolean
}

function TabellaRichieste({ className, query, mostraProprietario }: TabellaRichiesteProps) {
  if (query.isLoading) {
    return <p className={cn(className, 'text-sm text-muted-foreground')}>Caricamento…</p>
  }
  if (query.isError) {
    return <p className={cn(className, 'text-sm text-destructive')}>Impossibile caricare le richieste.</p>
  }
  if (!query.data || query.data.length === 0) {
    return <p className={cn(className, 'text-sm text-muted-foreground')}>Nessuna richiesta da mostrare.</p>
  }

  return (
    <div className={cn(className, 'overflow-x-auto rounded-lg border border-border')}>
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-secondary/50 text-left text-secondary-foreground">
          <tr>
            {mostraProprietario && <th className="px-4 py-2 font-medium">Dipendente</th>}
            <th className="px-4 py-2 font-medium">Tipo</th>
            <th className="px-4 py-2 font-medium">Periodo</th>
            <th className="px-4 py-2 font-medium">Stato</th>
          </tr>
        </thead>
        <tbody>
          {query.data.map((richiesta) => (
            <tr key={richiesta.id} className="border-b border-border last:border-0 hover:bg-accent/50">
              {mostraProprietario && (
                <td className="p-0">
                  <Link to={`/richieste/${richiesta.id}`} className="block px-4 py-2 text-foreground">
                    {richiesta.userNomeCompleto}
                  </Link>
                </td>
              )}
              <td className="p-0">
                <Link to={`/richieste/${richiesta.id}`} className="block px-4 py-2 text-foreground">
                  {ETICHETTE_TIPO[richiesta.tipo]}
                </Link>
              </td>
              <td className="p-0">
                <Link to={`/richieste/${richiesta.id}`} className="block px-4 py-2 text-foreground">
                  {richiesta.dataInizio} → {richiesta.dataFine}
                </Link>
              </td>
              <td className="p-0">
                <Link to={`/richieste/${richiesta.id}`} className="block px-4 py-2">
                  <Badge variant={VARIANTE_BADGE_STATO[richiesta.stato]}>{ETICHETTE_STATO[richiesta.stato]}</Badge>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
