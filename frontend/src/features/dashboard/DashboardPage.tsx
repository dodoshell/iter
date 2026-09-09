import { useAuth } from '@/features/auth/auth-context'

export function DashboardPage() {
  const { user, logout } = useAuth()

  return (
    <main className="min-h-screen bg-background p-6 text-foreground">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-lg font-semibold">Iter</h1>
          {user && (
            <p className="text-sm text-muted-foreground">
              {user.nome} {user.cognome} · {user.ruolo}
            </p>
          )}
        </div>
        <button onClick={logout} className="rounded-md border border-input px-3 py-1.5 text-sm text-foreground">
          Esci
        </button>
      </div>
    </main>
  )
}
