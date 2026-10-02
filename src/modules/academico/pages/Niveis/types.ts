import type { PaginationMeta, PaginatedResponse, Curso } from '../Cursos/types';

export interface Nivel {
  id: number;
  nome: string;
  observacoes?: string;
  curso_id?: number | null;
  curso?: Curso | null;
  ordem?: number | null;
  idade_minima?: number | null;
  idade_maxima?: number | null;
  cor_identificacao?: string | null;
  expectativas_aprendizado?: string | null;
}

export type { PaginationMeta, PaginatedResponse };
