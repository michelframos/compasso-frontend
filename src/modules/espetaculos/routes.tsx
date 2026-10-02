import type { RouteObject } from 'react-router-dom'
import { lazyRoute } from '@/shared/lib/lazyRoute'
import { ModuloProtectedRoute } from '@/shared/components/ModuloProtectedRoute'

function withModulo(modulo: string, element: RouteObject['element']): RouteObject['element'] {
  return <ModuloProtectedRoute modulo={modulo}>{element}</ModuloProtectedRoute>
}

export const espetaculosRoutes: RouteObject[] = [
  {
    path: 'espetaculos',
    element: withModulo('espetaculos', lazyRoute(() => import('./pages/Espetaculos'), 'EspetaculosPage')),
    handle: { title: 'Espetáculos' },
  },
  {
    path: 'espetaculos/novo',
    element: withModulo('espetaculos', lazyRoute(() => import('./pages/Espetaculos/EspetaculoFormPage'), 'EspetaculoFormPage')),
    handle: { title: 'Novo Espetáculo' },
  },
  {
    path: 'espetaculos/:id',
    element: withModulo('espetaculos', lazyRoute(() => import('./pages/Espetaculos/EspetaculoFormPage'), 'EspetaculoFormPage')),
    handle: { title: 'Editar Espetáculo' },
  },
  {
    path: 'apresentacoes',
    element: withModulo('espetaculos', lazyRoute(() => import('./pages/Apresentacoes'), 'ApresentacoesPage')),
    handle: { title: 'Apresentações' },
  },
  {
    path: 'apresentacoes/novo',
    element: withModulo('espetaculos', lazyRoute(() => import('./pages/Apresentacoes/ApresentacaoFormPage'), 'ApresentacaoFormPage')),
    handle: { title: 'Nova Apresentação' },
  },
  {
    path: 'apresentacoes/:id',
    element: withModulo('espetaculos', lazyRoute(() => import('./pages/Apresentacoes/ApresentacaoFormPage'), 'ApresentacaoFormPage')),
    handle: { title: 'Editar Apresentação' },
  },
]
