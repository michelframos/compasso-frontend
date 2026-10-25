import type { RouteObject } from 'react-router-dom'
import { lazyRoute } from '@/shared/lib/lazyRoute'
import { ModuloProtectedRoute } from '@/shared/components/ModuloProtectedRoute'
import { RoleProtectedRoute } from '@/shared/components/RoleProtectedRoute'

function withModulo(modulo: string, element: RouteObject['element']): RouteObject['element'] {
  return <ModuloProtectedRoute modulo={modulo}>{element}</ModuloProtectedRoute>
}

export const relatoriosRoutes: RouteObject[] = [
  {
    path: 'dashboard',
    element: lazyRoute(() => import('./pages/HomePage'), 'HomePage'),
    handle: { title: 'Início' },
  },
  {
    path: 'remuneracao',
    element: (
      <RoleProtectedRoute roles={['admin']}>
        {lazyRoute(() => import('./pages/RemuneracaoProfessores'), 'RemuneracaoProfessoresPage')}
      </RoleProtectedRoute>
    ),
    handle: { title: 'Remuneração dos professores' },
  },
  {
    path: 'remuneracao/:id',
    element: (
      <RoleProtectedRoute roles={['admin']}>
        {lazyRoute(() => import('./pages/RemuneracaoProfessores/ExtratoProfessor'), 'ExtratoProfessorAdminPage')}
      </RoleProtectedRoute>
    ),
    handle: { title: 'Extrato do professor' },
  },
  {
    path: 'relatorios',
    element: withModulo('relatorios', lazyRoute(() => import('./pages/Relatorios'))),
    handle: { title: 'Relatórios' },
  },
  {
    path: 'relatorios/financeiro/inadimplencia',
    element: withModulo('relatorios', lazyRoute(() => import('./pages/Relatorios/Financeiro/Inadimplencia'))),
    handle: { title: 'Relatório de Inadimplência' },
  },
  {
    path: 'relatorios/financeiro/fluxo-caixa',
    element: withModulo('relatorios', lazyRoute(() => import('./pages/Relatorios/Financeiro/FluxoCaixa'))),
    handle: { title: 'Fluxo de Caixa' },
  },
  {
    path: 'relatorios/academico/absenteismo',
    element: withModulo('relatorios', lazyRoute(() => import('./pages/Relatorios/Pedagogico/Absenteismo'))),
    handle: { title: 'Frequência e Absenteísmo' },
  },
  {
    path: 'relatorios/academico/diario-classe',
    element: withModulo('relatorios', lazyRoute(() => import('./pages/Relatorios/Pedagogico/DiarioClasse'))),
    handle: { title: 'Diário de Classe' },
  },
  {
    path: 'relatorios/comercial/funil',
    element: withModulo('relatorios', lazyRoute(() => import('./pages/Relatorios/Comercial/Funil'))),
    handle: { title: 'Funil de Vendas' },
  },
  {
    path: 'relatorios/comercial/aniversariantes',
    element: withModulo('relatorios', lazyRoute(() => import('./pages/Relatorios/Comercial/Aniversariantes'))),
    handle: { title: 'Aniversariantes do Mês' },
  },
  {
    path: 'relatorios/logistica/inventario-instrumentos',
    element: withModulo('relatorios', lazyRoute(() => import('./pages/Relatorios/Logistica/InventarioInstrumentos'))),
    handle: { title: 'Inventário de Instrumentos' },
  },
]
