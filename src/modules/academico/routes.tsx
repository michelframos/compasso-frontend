import type { RouteObject } from 'react-router-dom'
import { lazyRoute } from '@/shared/lib/lazyRoute'

export const academicoRoutes: RouteObject[] = [
  { path: 'agenda', element: lazyRoute(() => import('./pages/Agenda'), 'AgendaPage'), handle: { title: 'Agenda' } },
  { path: 'cursos', element: lazyRoute(() => import('./pages/Cursos'), 'CursosPage'), handle: { title: 'Cursos' } },
  { path: 'niveis', element: lazyRoute(() => import('./pages/Niveis'), 'NiveisPage'), handle: { title: 'Níveis' } },
  { path: 'turmas', element: lazyRoute(() => import('./pages/Turmas'), 'TurmasPage'), handle: { title: 'Turmas' } },
  {
    path: 'turmas/novo',
    element: lazyRoute(() => import('./pages/Turmas/TurmaFormPage'), 'TurmaFormPage'),
    handle: { title: 'Nova Turma' },
  },
  {
    path: 'turmas/:id',
    element: lazyRoute(() => import('./pages/Turmas/TurmaFormPage'), 'TurmaFormPage'),
    handle: { title: 'Editar Turma' },
  },
  {
    path: 'matriculas',
    element: lazyRoute(() => import('./pages/Matriculas'), 'MatriculasPage'),
    handle: { title: 'Matrículas' },
  },
  {
    path: 'matriculas/novo',
    element: lazyRoute(() => import('./pages/Matriculas/MatriculaFormPage'), 'MatriculaFormPage'),
    handle: { title: 'Nova Matrícula' },
  },
  {
    path: 'matriculas/:id',
    element: lazyRoute(() => import('./pages/Matriculas/MatriculaFormPage'), 'MatriculaFormPage'),
    handle: { title: 'Editar Matrícula' },
  },
]
