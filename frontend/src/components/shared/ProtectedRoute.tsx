import { Navigate } from 'react-router-dom'
import { useAuth, type UserRole } from '../../context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  /** Allowed roles. If empty/undefined, any authenticated user can access. */
  allowedRoles?: UserRole[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to their own home if they try to access another role's page
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
