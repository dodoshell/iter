import { Outlet } from 'react-router'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/auth-context'

export function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">Iter</h1>
          {user && (
            <p className="text-sm text-muted-foreground">
              {user.nome} {user.cognome} · {user.ruolo}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          Esci
        </Button>
      </header>
      <Outlet />
    </div>
  )
}
