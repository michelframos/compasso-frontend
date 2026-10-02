import type { RouteObject } from 'react-router-dom'
import { lazyRoute } from '@/shared/lib/lazyRoute'
import { ModuloProtectedRoute } from '@/shared/components/ModuloProtectedRoute'

function withModulo(modulo: string, element: RouteObject['element']): RouteObject['element'] {
  return <ModuloProtectedRoute modulo={modulo}>{element}</ModuloProtectedRoute>
}

export const comercialRoutes: RouteObject[] = [
  {
    path: 'leads',
    element: withModulo('leads', lazyRoute(() => import('./pages/Leads'), 'LeadsPage')),
    handle: { title: 'Leads' },
  },
]
