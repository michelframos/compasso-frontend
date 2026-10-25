import { Navigate, type RouteObject } from 'react-router-dom'
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
    path: '/trocar-senha',
    element: lazyRoute(() => import('./pages/TrocarSenha'), 'TrocarSenhaPage'),
    handle: { title: 'Definir nova senha' },
  },
  {
    path: '/login',
    element: lazyRoute(() => import('./pages/Login'), 'LoginPage'),
    handle: { title: 'Login' },
  },
  {
    path: '/professor/login',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/criar-conta',
    element: lazyRoute(() => import('./pages/CriarConta'), 'CriarContaPage'),
    handle: { title: 'Criar nova conta' },
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

/** Deve ficar por último entre as rotas do RootLayout. */
export const coreNotFoundRoute: RouteObject = {
  path: '*',
  element: lazyRoute(() => import('./pages/NotFound'), 'NotFoundPage'),
  handle: { title: 'Página não encontrada' },
}

/** Rotas autenticadas do Core. */
export const coreRoutes: RouteObject[] = [
  {
    path: 'meu-perfil',
    element: lazyRoute(() => import('./pages/MeuPerfil'), 'MeuPerfilPage'),
    handle: { title: 'Meu perfil' },
  },
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
