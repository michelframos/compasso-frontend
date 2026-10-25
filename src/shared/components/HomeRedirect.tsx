import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { getHomePath } from '@/shared/lib/homePath'

export function HomeRedirect() {
  const role = useAuthStore((state) => state.user?.role)
  return <Navigate to={getHomePath(role)} replace />
}
