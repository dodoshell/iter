import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { typography } from '@/lib/theme'

interface PageHeaderProps {
  titolo: string
  azioni?: ReactNode
  backHref?: string
}

export function PageHeader({ titolo, azioni, backHref }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        {backHref && (
          <Link
            to={backHref}
            className="mb-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Indietro
          </Link>
        )}
        <h2 className={typography.h2}>{titolo}</h2>
      </div>
      {azioni}
    </div>
  )
}
