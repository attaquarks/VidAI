import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import { PageLoading } from './ui.jsx'

export default function RequireRole({ role, children }) {
  const { user, booting } = useAuth()
  if (booting) return <PageLoading />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to="/" replace />
  return children ?? <Outlet />
}
