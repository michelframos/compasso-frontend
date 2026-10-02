import type { RouteObject } from 'react-router-dom'
import { lazyRoute } from '@/shared/lib/lazyRoute'

/** Rotas públicas de autenticação (fora do MainLayout). */
export const corePublicRoutes: RouteObject[] = [
  {
    path: '/auth/callback',
    element: lazyRoute(() => import('./pages/AuthCallback'), 'AuthCallbackPage'),
    handle: { title: 'Acessando...' },
  },
  {
    path: '/selecionar-instituicao',
    element: lazyRoute(() => import('./pages/SelecionarInstituicao'), 'SelecionarInstituicaoPage'),
    handle: { title: 'Selecionar instituição' },
  },
  {
    path: '/login',
    element: lazyRoute(() => import('./pages/Login'), 'LoginPage'),
    handle: { title: 'Login' },
  },
  {
    path: '/platform/login',
    element: lazyRoute(() => import('./pages/Login'), 'PlatformLoginPage'),
    handle: { title: 'Login da plataforma' },
  },
  {
    path: '/esqueci-minha-senha',
    element: lazyRoute(() => import('./pages/ForgotPassword'), 'ForgotPasswordPage'),
    handle: { title: 'Esqueci minha senha' },
  },
  {
    path: '/redefinir-senha',
    element: lazyRoute(() => import('./pages/ResetPassword'), 'ResetPasswordPage'),
    handle: { title: 'Redefinir senha' },
  },
]

/** Rotas autenticadas do Core. */
export const coreRoutes: RouteObject[] = [
  {
    path: 'configuracoes',
    element: lazyRoute(() => import('./pages/Configuracoes'), 'ConfiguracoesPage'),
    handle: { title: 'Configurações' },
  },
  {
    path: 'assinatura',
    element: lazyRoute(() => import('./pages/Assinatura'), 'AssinaturaPage'),
    handle: { title: 'Assinatura' },
  },
]
