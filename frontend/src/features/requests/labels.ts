import type { Azione, StatoRichiesta, TipoRichiesta } from '@/lib/types'
import type { BadgeVariant } from '@/components/ui/badge'

export const ETICHETTE_STATO: Record<StatoRichiesta, string> = {
  BOZZA: 'Bozza',
  INVIATA: 'Inviata',
  IN_REVISIONE: 'In revisione',
  APPROVATA: 'Approvata',
  RESPINTA: 'Respinta',
  RITIRATA: 'Ritirata',
}

export const VARIANTE_BADGE_STATO: Record<StatoRichiesta, BadgeVariant> = {
  BOZZA: 'outline',
  INVIATA: 'info',
  IN_REVISIONE: 'warning',
  APPROVATA: 'success',
  RESPINTA: 'destructive',
  RITIRATA: 'muted',
}

export const ETICHETTE_TIPO: Record<TipoRichiesta, string> = {
  FERIE: 'Ferie',
  PERMESSO: 'Permesso',
  MALATTIA: 'Malattia',
}

export const MESSAGGIO_SUCCESSO_AZIONE: Record<Azione, string> = {
  INVIA: 'Richiesta inviata',
  RITIRA: 'Richiesta ritirata',
  PRENDI_IN_CARICO: 'Richiesta presa in carico',
  APPROVA: 'Richiesta approvata',
  RESPINGI: 'Richiesta respinta',
}
