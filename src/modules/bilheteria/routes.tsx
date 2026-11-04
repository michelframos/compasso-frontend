import type { RouteObject } from 'react-router-dom'
import { lazyRoute } from '@/shared/lib/lazyRoute'
import { ModuloProtectedRoute } from '@/shared/components/ModuloProtectedRoute'
import { RoleProtectedRoute } from '@/shared/components/RoleProtectedRoute'

function withBilheteria(element: RouteObject['element']): RouteObject['element'] {
  return (
    <RoleProtectedRoute roles={['secretaria', 'admin']} loginPath="/bilheteria/login">
      <ModuloProtectedRoute modulo="bilheteria">{element}</ModuloProtectedRoute>
    </RoleProtectedRoute>
  )
}

export const bilheteriaRoutes: RouteObject[] = [
  {
    path: 'bilheteria',
    element: withBilheteria(lazyRoute(() => import('./pages/HomePage'), 'BilheteriaHomePage')),
    handle: { title: 'Bilheteria' },
  },
  {
    path: 'bilheteria/espetaculos/:id',
    element: withBilheteria(lazyRoute(() => import('./pages/EspetaculoIngressosPage'), 'EspetaculoIngressosPage')),
    handle: { title: 'Ingressos do espetáculo' },
  },
  {
    path: 'bilheteria/validacao',
    element: withBilheteria(lazyRoute(() => import('./pages/ValidacaoPage'), 'ValidacaoPage')),
    handle: { title: 'Validação de ingressos' },
  },
  {
    path: 'bilheteria/cupons',
    element: withBilheteria(lazyRoute(() => import('./pages/CuponsPage'), 'CuponsPage')),
    handle: { title: 'Cupons de ingresso' },
  },
  {
    path: 'bilheteria/templates',
    element: withBilheteria(lazyRoute(() => import('./pages/TemplatesPage'), 'TemplatesPage')),
    handle: { title: 'Templates de ingresso' },
  },
  {
    path: 'bilheteria/templates/novo',
    element: withBilheteria(lazyRoute(() => import('./pages/TemplateFormPage'), 'TemplateFormPage')),
    handle: { title: 'Novo template de ingresso' },
  },
  {
    path: 'bilheteria/templates/:id',
    element: withBilheteria(lazyRoute(() => import('./pages/TemplateFormPage'), 'TemplateFormPage')),
    handle: { title: 'Editar template de ingresso' },
  },
  {
    path: 'bilheteria/relatorios',
    element: withBilheteria(lazyRoute(() => import('./pages/RelatoriosPage'), 'RelatoriosPage')),
    handle: { title: 'Relatórios de bilheteria' },
  },
]
