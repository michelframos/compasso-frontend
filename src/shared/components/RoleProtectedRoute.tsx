import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { getHomePath } from '@/shared/lib/homePath'

interface RoleProtectedRouteProps {
  roles: string[]
  children: React.ReactNode
}

/** Diferente do menu, não libera admin automaticamente: só os papéis listados acessam. */
export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ roles, children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const role = useAuthStore((state) => state.user?.role)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!role || !roles.includes(role)) {
    return <Navigate to={getHomePath(role)} replace />
  }

  return <>{children}</>
}
