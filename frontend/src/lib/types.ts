export type Ruolo = 'DIPENDENTE' | 'RESPONSABILE' | 'ADMIN'

export type TipoRichiesta = 'FERIE' | 'PERMESSO' | 'MALATTIA'

export type StatoRichiesta = 'BOZZA' | 'INVIATA' | 'IN_REVISIONE' | 'APPROVATA' | 'RESPINTA' | 'RITIRATA'

export interface Me {
  id: number
  email: string
  nome: string
  cognome: string
  ruolo: Ruolo
  managerId: number | null
}

export interface Richiesta {
  id: number
  userId: number
  userNomeCompleto: string
  tipo: TipoRichiesta
  dataInizio: string
  dataFine: string
  note: string | null
  stato: StatoRichiesta
  createdAt: string
  updatedAt: string
}

export interface RichiestaEvento {
  id: number
  statoPrecedente: StatoRichiesta | null
  statoNuovo: StatoRichiesta
  autoreId: number
  autoreNomeCompleto: string
  motivazione: string | null
  createdAt: string
}

export interface RichiestaDettaglio {
  richiesta: Richiesta
  cronologia: RichiestaEvento[]
}
