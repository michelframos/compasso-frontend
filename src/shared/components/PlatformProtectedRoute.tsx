import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { getHomePath } from '@/shared/lib/homePath'

interface PlatformProtectedRouteProps {
  children: React.ReactNode
}

export const PlatformProtectedRoute: React.FC<PlatformProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const impersonation = useAuthStore((state) => state.impersonation)

  if (!isAuthenticated) {
    return <Navigate to="/platform/login" replace />
  }

  if (impersonation?.active || !user?.is_super_admin) {
    return <Navigate to={getHomePath(user?.role)} replace />
  }

  return <>{children}</>
}
