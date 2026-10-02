import type { RouteObject } from 'react-router-dom'
import { lazyRoute } from '@/shared/lib/lazyRoute'
import { ModuloProtectedRoute } from '@/shared/components/ModuloProtectedRoute'

function withModulo(modulo: string, element: RouteObject['element']): RouteObject['element'] {
  return <ModuloProtectedRoute modulo={modulo}>{element}</ModuloProtectedRoute>
}

export const instrumentosRoutes: RouteObject[] = [
  {
    path: 'instrumentos',
    element: withModulo('instrumentos', lazyRoute(() => import('./pages/Instrumentos'), 'InstrumentosPage')),
    handle: { title: 'Instrumentos' },
  },
]
