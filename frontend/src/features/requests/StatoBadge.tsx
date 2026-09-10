import { CheckCircle2, Eye, FileEdit, Send, Undo2, XCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { StatoRichiesta } from '@/lib/types'
import { ETICHETTE_STATO, VARIANTE_BADGE_STATO } from './labels'

const ICONA_STATO: Record<StatoRichiesta, LucideIcon> = {
  BOZZA: FileEdit,
  INVIATA: Send,
  IN_REVISIONE: Eye,
  APPROVATA: CheckCircle2,
  RESPINTA: XCircle,
  RITIRATA: Undo2,
}

export function StatoBadge({ stato }: { stato: StatoRichiesta }) {
  const Icona = ICONA_STATO[stato]
  return (
    <Badge variant={VARIANTE_BADGE_STATO[stato]}>
      <Icona className="size-3" aria-hidden="true" />
      {ETICHETTE_STATO[stato]}
    </Badge>
  )
}
