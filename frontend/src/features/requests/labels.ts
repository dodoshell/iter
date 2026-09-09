import type { StatoRichiesta, TipoRichiesta } from '@/lib/types'

export const ETICHETTE_STATO: Record<StatoRichiesta, string> = {
  BOZZA: 'Bozza',
  INVIATA: 'Inviata',
  IN_REVISIONE: 'In revisione',
  APPROVATA: 'Approvata',
  RESPINTA: 'Respinta',
  RITIRATA: 'Ritirata',
}

export const VARIANTE_BADGE_STATO: Record<StatoRichiesta, 'default' | 'outline' | 'success' | 'warning' | 'destructive'> = {
  BOZZA: 'outline',
  INVIATA: 'default',
  IN_REVISIONE: 'warning',
  APPROVATA: 'success',
  RESPINTA: 'destructive',
  RITIRATA: 'outline',
}

export const ETICHETTE_TIPO: Record<TipoRichiesta, string> = {
  FERIE: 'Ferie',
  PERMESSO: 'Permesso',
  MALATTIA: 'Malattia',
}
