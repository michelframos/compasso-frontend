import { Navigate, type RouteObject } from 'react-router-dom'
import { lazyRoute } from '@/shared/lib/lazyRoute'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { RoleProtectedRoute } from '@/shared/components/RoleProtectedRoute'
import { ModuloProtectedRoute } from '@/shared/components/ModuloProtectedRoute'
import { AlunoLayout } from '@/shared/layouts/AlunoLayout'

export const alunoAreaRoute: RouteObject = {
  path: '/aluno',
  element: (
    <ProtectedRoute>
      <RoleProtectedRoute roles={['aluno', 'responsavel']}>
        <AlunoLayout />
      </RoleProtectedRoute>
    </ProtectedRoute>
  ),
  children: [
    { index: true, element: <Navigate to="inicio" replace /> },
    {
      path: 'inicio',
      element: lazyRoute(() => import('./pages/Inicio'), 'InicioPage'),
      handle: { title: 'Início' },
    },
    {
      path: 'agenda',
      element: lazyRoute(() => import('./pages/Agenda'), 'AgendaPage'),
      handle: { title: 'Agenda' },
    },
    {
      path: 'frequencia',
      element: lazyRoute(() => import('./pages/Frequencia'), 'FrequenciaPage'),
      handle: { title: 'Frequência' },
    },
    {
      path: 'boletim',
      element: lazyRoute(() => import('./pages/Boletim'), 'BoletimPage'),
      handle: { title: 'Boletim' },
    },
    {
      path: 'materiais',
      element: lazyRoute(() => import('./pages/Materiais'), 'MateriaisPage'),
      handle: { title: 'Materiais' },
    },
    {
      path: 'apresentacoes',
      element: (
        <ModuloProtectedRoute modulo="espetaculos">
          {lazyRoute(() => import('./pages/MinhasApresentacoes'), 'MinhasApresentacoesPage')}
        </ModuloProtectedRoute>
      ),
      handle: { title: 'Apresentações' },
    },
    {
      path: 'medidas',
      element: (
        <ModuloProtectedRoute modulo="espetaculos">
          {lazyRoute(() => import('./pages/MinhasMedidas'), 'MinhasMedidasPage')}
        </ModuloProtectedRoute>
      ),
      handle: { title: 'Medidas' },
    },
    {
      path: 'instrumentos',
      element: (
        <ModuloProtectedRoute modulo="instrumentos">
          {lazyRoute(() => import('./pages/MeusInstrumentos'), 'MeusInstrumentosPage')}
        </ModuloProtectedRoute>
      ),
      handle: { title: 'Instrumentos' },
    },
    {
      path: 'contratos',
      element: lazyRoute(() => import('./pages/MeusContratos'), 'MeusContratosPage'),
      handle: { title: 'Contratos' },
    },
    {
      path: 'certificados',
      element: lazyRoute(() => import('./pages/MeusCertificados'), 'MeusCertificadosPage'),
      handle: { title: 'Certificados' },
    },
    {
      path: 'financeiro',
      element: (
        <ModuloProtectedRoute modulo="financeiro">
          {lazyRoute(() => import('./pages/Financeiro'), 'FinanceiroPage')}
        </ModuloProtectedRoute>
      ),
      handle: { title: 'Financeiro' },
    },
    {
      path: 'matriculas',
      element: lazyRoute(() => import('./pages/MinhasMatriculas'), 'MinhasMatriculasPage'),
      handle: { title: 'Matrículas' },
    },
    {
      path: 'perfil',
      element: lazyRoute(() => import('@/modules/core/pages/MeuPerfil'), 'MeuPerfilPage'),
      handle: { title: 'Meu perfil' },
    },
    {
      path: 'matriculas/:id',
      element: lazyRoute(() => import('./pages/MatriculaDetalhe'), 'MatriculaDetalhePage'),
      handle: { title: 'Matrícula' },
    },
  ],
}
