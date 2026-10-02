import type { PaginationMeta, PaginatedResponse } from '../Cursos/types';

export interface Aluno {
  id: number;
  id_usuario: number;
  id_lead: number | null;
  usuario: {
    id: number;
    nome: string;
    email: string;
    telefone: string | null;
    cpf: string;
  };
}

export interface Turma {
  id: number;
  id_curso: number;
  id_nivel: number;
  id_professor?: number | null;
  maximo_alunos: number;
  status: string;
  valor_mensalidade?: number;
  curso: {
    id: number;
    nome: string;
  };
  nivel: {
    id: number;
    nome: string;
  };
  descricao: string | null;
}

export interface Curso {
  id: number;
  nome: string;
  descricao: string | null;
}

export interface Nivel {
  id: number;
  nome: string;
  curso_id: number | null;
}

export interface Professor {
  id: number;
  id_usuario: number;
  usuario: {
    id: number;
    nome: string;
  };
}

export interface Matricula {
  id: number;
  id_aluno: number;
  tipo: 'turma' | 'curso';
  id_turma: number | null;
  id_curso: number | null;
  id_nivel: number | null;
  id_professor: number | null;
  data: string;
  status: 'ativa' | 'pausada' | 'cancelada' | 'completada' | 'transferida';
  observacoes: string | null;
  contrato_id?: number | null;
  id_lead?: number | null;
  contrato_gerado?: string | null;
  aluno: Aluno;
  turma?: Turma;
  curso?: Curso;
  nivel?: Nivel;
  professor?: Professor;
}

export interface MatriculaFormData {
  id_aluno: string;
  tipo: 'turma' | 'curso';
  id_turma: string;
  id_curso: string;
  id_nivel: string;
  id_professor: string;
  data: string;
  status: string;
  observacoes: string;
  contrato_id?: number | null;
  id_lead?: number | null;
  contrato_gerado?: string | null;
}

export interface MatriculaHistorico {
  id: number;
  id_matricula: number;
  id_turma_origem: number | null;
  id_turma_destino: number;
  data_transferencia: string;
  motivo: string | null;
  created_at: string;
  turma_origem: { id: number; nome: string } | null;
  turma_destino: { id: number; nome: string };
}

export type { PaginationMeta, PaginatedResponse };
