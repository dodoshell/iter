import { Link } from 'react-router'

interface PageHeaderProps {
  titolo: string
  azioni?: React.ReactNode
  backHref?: string
}

export function PageHeader({ titolo, azioni, backHref }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        {backHref && (
          <Link to={backHref} className="text-sm text-muted-foreground hover:text-foreground">
            ← Indietro
          </Link>
        )}
        <h2 className="text-xl font-semibold text-foreground">{titolo}</h2>
      </div>
      {azioni}
    </div>
  )
}
