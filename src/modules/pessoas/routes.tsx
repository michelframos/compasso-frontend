import type { RouteObject } from 'react-router-dom'
import { lazyRoute } from '@/shared/lib/lazyRoute'

export const pessoasRoutes: RouteObject[] = [
  { path: 'alunos', element: lazyRoute(() => import('./pages/Alunos'), 'AlunosPage'), handle: { title: 'Alunos' } },
  {
    path: 'alunos/novo',
    element: lazyRoute(() => import('./pages/Alunos/AlunoFormPage'), 'AlunoFormPage'),
    handle: { title: 'Novo Aluno' },
  },
  {
    path: 'alunos/:id',
    element: lazyRoute(() => import('./pages/Alunos/AlunoFormPage'), 'AlunoFormPage'),
    handle: { title: 'Editar Aluno' },
  },
  {
    path: 'professores',
    element: lazyRoute(() => import('./pages/Professores'), 'ProfessoresPage'),
    handle: { title: 'Professores' },
  },
  {
    path: 'professores/novo',
    element: lazyRoute(() => import('./pages/Professores/ProfessorFormPage'), 'ProfessorFormPage'),
    handle: { title: 'Novo Professor' },
  },
  {
    path: 'professores/:id',
    element: lazyRoute(() => import('./pages/Professores/ProfessorFormPage'), 'ProfessorFormPage'),
    handle: { title: 'Editar Professor' },
  },
]
