import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/useAuthStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const tenant = useAuthStore((state) => state.tenant)
  const tenants = useAuthStore((state) => state.tenants)
  const user = useAuthStore((state) => state.user)
  const impersonation = useAuthStore((state) => state.impersonation)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.deve_trocar_senha) {
    return <Navigate to="/trocar-senha" replace />
  }

  if (!tenant && tenants.length > 1) {
    return <Navigate to="/selecionar-instituicao" replace />
  }

  if (!tenant && user?.is_super_admin && !impersonation?.active) {
    return <Navigate to="/platform" replace />
  }

  return <>{children}</>
}
