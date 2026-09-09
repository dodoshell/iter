import { Route, Routes } from 'react-router'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { LoginPage } from '@/features/auth/LoginPage'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { AppLayout } from '@/features/layout/AppLayout'
import { NewRequestPage } from '@/features/requests/NewRequestPage'
import { RequestDetailPage } from '@/features/requests/RequestDetailPage'
import { RequestListPage } from '@/features/requests/RequestListPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<RequestListPage />} />
            <Route path="/richieste/nuova" element={<NewRequestPage />} />
            <Route path="/richieste/:id" element={<RequestDetailPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
