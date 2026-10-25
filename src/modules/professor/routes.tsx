import { Navigate, Outlet, type RouteObject } from 'react-router-dom'
import { lazyRoute } from '@/shared/lib/lazyRoute'
import { RoleProtectedRoute } from '@/shared/components/RoleProtectedRoute'
import { ModuloProtectedRoute } from '@/shared/components/ModuloProtectedRoute'

export const professorRoutes: RouteObject[] = [
  {
    path: 'professor',
    element: (
      <RoleProtectedRoute roles={['professor']}>
        <Outlet />
      </RoleProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="inicio" replace /> },
      {
        path: 'inicio',
        element: lazyRoute(() => import('./pages/Inicio'), 'InicioPage'),
        handle: { title: 'Início' },
      },
      {
        path: 'turmas',
        element: lazyRoute(() => import('./pages/MinhasTurmas'), 'MinhasTurmasPage'),
        handle: { title: 'Minhas turmas' },
      },
      {
        path: 'turmas/:id',
        element: lazyRoute(() => import('./pages/TurmaDetalhe'), 'TurmaDetalhePage'),
        handle: { title: 'Turma' },
      },
      {
        path: 'turmas/:id/diario',
        element: lazyRoute(() => import('./pages/Diario'), 'DiarioPage'),
        handle: { title: 'Diário de classe' },
      },
      {
        path: 'alunos',
        element: lazyRoute(() => import('./pages/MeusAlunos'), 'MeusAlunosPage'),
        handle: { title: 'Meus alunos' },
      },
      {
        path: 'alunos/:id',
        element: lazyRoute(() => import('./pages/FichaAluno'), 'FichaAlunoPage'),
        handle: { title: 'Ficha do aluno' },
      },
      {
        path: 'frequencia',
        element: lazyRoute(() => import('./pages/Frequencia'), 'FrequenciaPage'),
        handle: { title: 'Frequência' },
      },
      {
        path: 'ganhos',
        element: lazyRoute(() => import('./pages/MeusGanhos'), 'MeusGanhosPage'),
        handle: { title: 'Meus ganhos' },
      },
      {
        path: 'solicitacoes',
        element: lazyRoute(() => import('./pages/Solicitacoes'), 'SolicitacoesPage'),
        handle: { title: 'Solicitações' },
      },
      {
        path: 'avisos',
        element: lazyRoute(() => import('./pages/Avisos'), 'AvisosPage'),
        handle: { title: 'Avisos' },
      },
      {
        path: 'apresentacoes',
        element: (
          <ModuloProtectedRoute modulo="espetaculos">
            {lazyRoute(() => import('./pages/MinhasApresentacoes'), 'MinhasApresentacoesPage')}
          </ModuloProtectedRoute>
        ),
        handle: { title: 'Minhas apresentações' },
      },
      {
        path: 'apresentacoes/:id',
        element: (
          <ModuloProtectedRoute modulo="espetaculos">
            {lazyRoute(() => import('./pages/ApresentacaoDetalhe'), 'ApresentacaoDetalhePage')}
          </ModuloProtectedRoute>
        ),
        handle: { title: 'Apresentação' },
      },
      {
        path: 'aulas/:id/chamada',
        element: lazyRoute(() => import('./pages/Chamada'), 'ChamadaPage'),
        handle: { title: 'Chamada' },
      },
    ],
  },
]
