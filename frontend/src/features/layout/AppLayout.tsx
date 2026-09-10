import { Outlet } from 'react-router'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/auth-context'

export function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/85 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="" className="h-7 w-7" />
          <div>
            <h1 className="text-lg font-semibold">Iter</h1>
            {user && (
              <p className="text-sm text-muted-foreground">
                {user.nome} {user.cognome} · {user.ruolo}
              </p>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          Esci
        </Button>
      </header>
      <Outlet />
    </div>
  )
}
