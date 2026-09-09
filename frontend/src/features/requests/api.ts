import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Azione, Richiesta, RichiestaDettaglio, StatoRichiesta, TipoRichiesta } from '@/lib/types'

export interface FiltroRichieste {
  stato?: StatoRichiesta
  userId?: number
  dataDa?: string
  dataA?: string
}

function toQueryString(filtro: FiltroRichieste): string {
  const params = new URLSearchParams()
  if (filtro.stato) params.set('stato', filtro.stato)
  if (filtro.userId) params.set('userId', String(filtro.userId))
  if (filtro.dataDa) params.set('dataDa', filtro.dataDa)
  if (filtro.dataA) params.set('dataA', filtro.dataA)
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function useRichieste(filtro: FiltroRichieste = {}) {
  return useQuery({
    queryKey: ['richieste', filtro],
    queryFn: () => api.get<Richiesta[]>(`/requests${toQueryString(filtro)}`),
  })
}

export function useRichiestaDettaglio(id: number) {
  return useQuery({
    queryKey: ['richieste', id],
    queryFn: () => api.get<RichiestaDettaglio>(`/requests/${id}`),
  })
}

interface DatiRichiesta {
  tipo: TipoRichiesta
  dataInizio: string
  dataFine: string
  note: string
}

function useInvalidazioneRichieste() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['richieste'] })
}

export function useCreaRichiesta() {
  const invalida = useInvalidazioneRichieste()
  return useMutation({
    mutationFn: (dati: DatiRichiesta) => api.post<Richiesta>('/requests', dati),
    onSuccess: invalida,
  })
}

export function useModificaRichiesta(id: number) {
  const invalida = useInvalidazioneRichieste()
  return useMutation({
    mutationFn: (dati: DatiRichiesta) => api.patch<Richiesta>(`/requests/${id}`, dati),
    onSuccess: invalida,
  })
}

export function useApplicaTransizione(id: number) {
  const invalida = useInvalidazioneRichieste()
  return useMutation({
    mutationFn: (dati: { azione: Azione; motivazione?: string }) =>
      api.post<Richiesta>(`/requests/${id}/transitions`, dati),
    onSuccess: invalida,
  })
}
