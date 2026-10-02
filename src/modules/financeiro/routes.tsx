import type { RouteObject } from 'react-router-dom'
import { lazyRoute } from '@/shared/lib/lazyRoute'
import { ModuloProtectedRoute } from '@/shared/components/ModuloProtectedRoute'

function withModulo(modulo: string, element: RouteObject['element']): RouteObject['element'] {
  return <ModuloProtectedRoute modulo={modulo}>{element}</ModuloProtectedRoute>
}

export const financeiroRoutes: RouteObject[] = [
  {
    path: 'financeiro',
    element: withModulo('financeiro', lazyRoute(() => import('./pages/Financeiro'), 'FinanceiroPage')),
    handle: { title: 'Financeiro' },
  },
  {
    path: 'contratos',
    element: withModulo('financeiro', lazyRoute(() => import('./pages/Contratos'), 'ContratosPage')),
    handle: { title: 'Contratos' },
  },
  {
    path: 'contratos/novo',
    element: withModulo('financeiro', lazyRoute(() => import('./pages/Contratos/ContratoFormPage'), 'ContratoFormPage')),
    handle: { title: 'Novo Contrato' },
  },
  {
    path: 'contratos/:id',
    element: withModulo('financeiro', lazyRoute(() => import('./pages/Contratos/ContratoFormPage'), 'ContratoFormPage')),
    handle: { title: 'Editar Contrato' },
  },
]
