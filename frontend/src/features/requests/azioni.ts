import type { Azione, Me, Richiesta } from '@/lib/types'

export interface AzioneDisponibile {
  azione: Azione
  etichetta: string
  richiedeMotivazione: boolean
  distruttiva?: boolean
}

// Specchia le transizioni ammesse dalla state machine del backend, che resta
// l'unica autorità reale: qui si decide solo quali pulsanti mostrare.
export function azioniDisponibili(richiesta: Richiesta, utente: Me): AzioneDisponibile[] {
  const proprietario = richiesta.userId === utente.id

  if (proprietario) {
    switch (richiesta.stato) {
      case 'BOZZA':
        return [{ azione: 'INVIA', etichetta: 'Invia', richiedeMotivazione: false }]
      case 'INVIATA':
      case 'IN_REVISIONE':
        return [{ azione: 'RITIRA', etichetta: 'Ritira', richiedeMotivazione: false, distruttiva: true }]
      default:
        return []
    }
  }

  if (utente.ruolo === 'RESPONSABILE') {
    switch (richiesta.stato) {
      case 'INVIATA':
        return [{ azione: 'PRENDI_IN_CARICO', etichetta: 'Prendi in carico', richiedeMotivazione: false }]
      case 'IN_REVISIONE':
        return [
          { azione: 'APPROVA', etichetta: 'Approva', richiedeMotivazione: false },
          { azione: 'RESPINGI', etichetta: 'Respingi', richiedeMotivazione: true, distruttiva: true },
        ]
      default:
        return []
    }
  }

  return []
}

export function puoModificare(richiesta: Richiesta, utente: Me): boolean {
  return richiesta.userId === utente.id && richiesta.stato === 'BOZZA'
}
