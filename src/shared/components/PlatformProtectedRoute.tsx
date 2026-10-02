import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/useAuthStore'

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

  if (impersonation?.active) {
    return <Navigate to="/dashboard" replace />
  }

  if (!user?.is_super_admin) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
