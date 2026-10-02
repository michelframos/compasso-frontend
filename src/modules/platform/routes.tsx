import type { RouteObject } from 'react-router-dom'
import { lazyRoute } from '@/shared/lib/lazyRoute'

export const platformRoutes: RouteObject[] = [
  {
    index: true,
    element: lazyRoute(() => import('./pages/Dashboard'), 'PlatformDashboardPage'),
    handle: { title: 'Plataforma' },
  },
  {
    path: 'instituicoes',
    element: lazyRoute(() => import('./pages/Instituicoes'), 'PlatformInstituicoesPage'),
    handle: { title: 'Escolas' },
  },
  {
    path: 'instituicoes/novo',
    element: lazyRoute(() => import('./pages/Instituicoes/InstituicaoFormPage'), 'InstituicaoFormPage'),
    handle: { title: 'Nova Escola' },
  },
  {
    path: 'instituicoes/:id/editar',
    element: lazyRoute(() => import('./pages/Instituicoes/InstituicaoFormPage'), 'InstituicaoFormPage'),
    handle: { title: 'Editar Escola' },
  },
  {
    path: 'instituicoes/:id',
    element: lazyRoute(() => import('./pages/Instituicoes/InstituicaoDetailPage'), 'InstituicaoDetailPage'),
    handle: { title: 'Detalhe da Escola' },
  },
  {
    path: 'planos',
    element: lazyRoute(() => import('./pages/Planos'), 'PlatformPlanosPage'),
    handle: { title: 'Planos' },
  },
  {
    path: 'planos/novo',
    element: lazyRoute(() => import('./pages/Planos/PlanoFormPage'), 'PlanoFormPage'),
    handle: { title: 'Novo Plano' },
  },
  {
    path: 'planos/:id/editar',
    element: lazyRoute(() => import('./pages/Planos/PlanoFormPage'), 'PlanoFormPage'),
    handle: { title: 'Editar Plano' },
  },
  {
    path: 'depoimentos',
    element: lazyRoute(() => import('./pages/Depoimentos'), 'PlatformDepoimentosPage'),
    handle: { title: 'Depoimentos' },
  },
  {
    path: 'depoimentos/novo',
    element: lazyRoute(() => import('./pages/Depoimentos/DepoimentoFormPage'), 'DepoimentoFormPage'),
    handle: { title: 'Novo Depoimento' },
  },
  {
    path: 'depoimentos/:id/editar',
    element: lazyRoute(() => import('./pages/Depoimentos/DepoimentoFormPage'), 'DepoimentoFormPage'),
    handle: { title: 'Editar Depoimento' },
  },
  {
    path: 'modulos',
    element: lazyRoute(() => import('./pages/Modulos'), 'PlatformModulosPage'),
    handle: { title: 'Módulos' },
  },
  {
    path: 'modulos/novo',
    element: lazyRoute(() => import('./pages/Modulos/SiteModuloFormPage'), 'SiteModuloFormPage'),
    handle: { title: 'Novo Módulo' },
  },
  {
    path: 'modulos/:id/editar',
    element: lazyRoute(() => import('./pages/Modulos/SiteModuloFormPage'), 'SiteModuloFormPage'),
    handle: { title: 'Editar Módulo' },
  },
  {
    path: 'solicitacoes',
    element: lazyRoute(() => import('./pages/Solicitacoes'), 'PlatformSolicitacoesPage'),
    handle: { title: 'Solicitações' },
  },
]
