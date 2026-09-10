import { ArrowDown, ArrowUp, ArrowUpDown, Plus } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/features/auth/auth-context'
import { cn } from '@/lib/utils'
import type { Richiesta, StatoRichiesta } from '@/lib/types'
import { useRichieste } from './api'
import { ETICHETTE_STATO, ETICHETTE_TIPO } from './labels'
import { RequestCard } from './RequestCard'
import { StatoBadge } from './StatoBadge'

const STATI: StatoRichiesta[] = ['BOZZA', 'INVIATA', 'IN_REVISIONE', 'APPROVATA', 'RESPINTA', 'RITIRATA']
const STATI_IN_ATTESA: StatoRichiesta[] = ['INVIATA', 'IN_REVISIONE']
const DIMENSIONE_PAGINA = 8

type CampoOrdinamento = 'dipendente' | 'tipo' | 'periodo' | 'stato'

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
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <PageHeader
        titolo="Le mie richieste"
        azioni={
          <Button asChild>
            <Link to="/richieste/nuova">
              <Plus className="size-4" aria-hidden="true" />
              Nuova richiesta
            </Link>
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
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
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
    <main className="mx-auto max-w-4xl p-4 sm:p-6">
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

function confronta(campo: CampoOrdinamento, a: Richiesta, b: Richiesta): number {
  switch (campo) {
    case 'dipendente':
      return a.userNomeCompleto.localeCompare(b.userNomeCompleto)
    case 'tipo':
      return ETICHETTE_TIPO[a.tipo].localeCompare(ETICHETTE_TIPO[b.tipo])
    case 'periodo':
      return a.dataInizio.localeCompare(b.dataInizio)
    case 'stato':
      return ETICHETTE_STATO[a.stato].localeCompare(ETICHETTE_STATO[b.stato])
  }
}

interface TabellaRichiesteProps {
  className?: string
  query: { data?: Richiesta[]; isLoading: boolean; isError: boolean }
  mostraProprietario: boolean
}

function TabellaRichieste({ className, query, mostraProprietario }: TabellaRichiesteProps) {
  const [ordinamento, setOrdinamento] = useState<{ campo: CampoOrdinamento; direzione: 'asc' | 'desc' }>({
    campo: 'periodo',
    direzione: 'desc',
  })
  const [pagina, setPagina] = useState(1)

  const ordinati = useMemo(() => {
    if (!query.data) return []
    const segno = ordinamento.direzione === 'asc' ? 1 : -1
    return [...query.data].sort((a, b) => segno * confronta(ordinamento.campo, a, b))
  }, [query.data, ordinamento])

  const totalePagine = Math.max(1, Math.ceil(ordinati.length / DIMENSIONE_PAGINA))
  const paginaValida = Math.min(pagina, totalePagine)
  const paginati = ordinati.slice((paginaValida - 1) * DIMENSIONE_PAGINA, paginaValida * DIMENSIONE_PAGINA)

  function cambiaOrdinamento(campo: CampoOrdinamento) {
    setPagina(1)
    setOrdinamento((corrente) =>
      corrente.campo === campo
        ? { campo, direzione: corrente.direzione === 'asc' ? 'desc' : 'asc' }
        : { campo, direzione: 'asc' },
    )
  }

  if (query.isLoading) {
    return (
      <div className={cn(className, 'space-y-2')}>
        {Array.from({ length: 5 }).map((_, indice) => (
          <Skeleton key={indice} className="h-14 w-full" />
        ))}
      </div>
    )
  }
  if (query.isError) {
    return <p className={cn(className, 'text-sm text-destructive')}>Impossibile caricare le richieste.</p>
  }
  if (!query.data || query.data.length === 0) {
    return <p className={cn(className, 'text-sm text-muted-foreground')}>Nessuna richiesta da mostrare.</p>
  }

  return (
    <div className={className}>
      {/* Schermi stretti: card impilate. Da sm in su: tabella ordinabile. */}
      <div className="space-y-2 sm:hidden">
        {paginati.map((richiesta) => (
          <RequestCard key={richiesta.id} richiesta={richiesta} mostraProprietario={mostraProprietario} />
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-border sm:block">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/50 text-left text-secondary-foreground">
            <tr>
              {mostraProprietario && (
                <IntestazioneOrdinabile campo="dipendente" ordinamento={ordinamento} onClick={cambiaOrdinamento}>
                  Dipendente
                </IntestazioneOrdinabile>
              )}
              <IntestazioneOrdinabile campo="tipo" ordinamento={ordinamento} onClick={cambiaOrdinamento}>
                Tipo
              </IntestazioneOrdinabile>
              <IntestazioneOrdinabile campo="periodo" ordinamento={ordinamento} onClick={cambiaOrdinamento}>
                Periodo
              </IntestazioneOrdinabile>
              <IntestazioneOrdinabile campo="stato" ordinamento={ordinamento} onClick={cambiaOrdinamento}>
                Stato
              </IntestazioneOrdinabile>
            </tr>
          </thead>
          <tbody>
            {paginati.map((richiesta) => (
              <tr key={richiesta.id} className="border-b border-border transition-colors last:border-0 hover:bg-accent/50">
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
                    <StatoBadge stato={richiesta.stato} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalePagine > 1 && (
        <Pagination pagina={paginaValida} totalePagine={totalePagine} onCambiaPagina={setPagina} />
      )}
    </div>
  )
}

function IntestazioneOrdinabile({
  campo,
  ordinamento,
  onClick,
  children,
}: {
  campo: CampoOrdinamento
  ordinamento: { campo: CampoOrdinamento; direzione: 'asc' | 'desc' }
  onClick: (campo: CampoOrdinamento) => void
  children: ReactNode
}) {
  const attivo = ordinamento.campo === campo
  const Icona = attivo ? (ordinamento.direzione === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown

  return (
    <th className="p-0 font-medium">
      <button
        type="button"
        onClick={() => onClick(campo)}
        className="flex w-full items-center gap-1 px-4 py-2 text-left hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
      >
        {children}
        <Icona className={cn('size-3.5', attivo ? 'opacity-100' : 'opacity-40')} aria-hidden="true" />
      </button>
    </th>
  )
}
