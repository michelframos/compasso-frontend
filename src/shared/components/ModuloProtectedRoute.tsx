import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/useAuthStore'

interface ModuloProtectedRouteProps {
  modulo: string
  children: React.ReactNode
}

export const ModuloProtectedRoute: React.FC<ModuloProtectedRouteProps> = ({ modulo, children }) => {
  const tenant = useAuthStore((state) => state.tenant)
  const allowed = tenant?.modulos ?? []

  if (!allowed.includes(modulo)) {
    const desligadoPelaEscola = tenant?.modulos_contratados?.includes(modulo) ?? false
    return <Navigate to={desligadoPelaEscola ? '/' : '/assinatura'} replace />
  }

  return <>{children}</>
}
