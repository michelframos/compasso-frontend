import type { PaginationMeta } from '@/modules/academico';
import type { Contrato } from '@/modules/financeiro';

export interface Espetaculo {
  id: number;
  titulo: string;
  data_evento: string;
  local: string;
  status: string;
  contrato_id?: number | null;
  contrato?: Contrato;
}

export interface Apresentacao {
  id: number;
  id_espetaculo: number;
  espetaculo?: Espetaculo;
}

export interface AlunoContrato {
  id: number;
  aluno_id: number;
  contrato_id: number;
  contrato_gerado: string;
  created_at: string;
  updated_at: string;
  contrato?: Contrato;
}

export interface Aluno {
  id: number;
  id_usuario: number;
  id_lead: number | null;
  observacoes: string | null;
  usuario: {
    id: number;
    nome: string;
    email: string;
    cpf: string;
    telefone: string | null;
    whatsapp: string | null;
    role: string;
    data_aniversario: string | null;
    cep?: string | null;
    rua?: string | null;
    numero?: string | null;
    complemento?: string | null;
    bairro?: string | null;
    id_estado?: number | null;
    id_cidade?: number | null;
  };
  responsaveis?: {
    id: number;
    nome: string;
    email: string | null;
    cpf: string | null;
    telefone: string | null;
    whatsapp: string | null;
    data_aniversario: string | null;
    responsavel_observacoes?: string | null;
    cep?: string | null;
    rua?: string | null;
    numero?: string | null;
    complemento?: string | null;
    bairro?: string | null;
    id_estado?: number | null;
    id_cidade?: number | null;
  }[];
  matriculas?: Matricula[];
  contas?: Conta[];
  instrumentos?: Instrumento[];
  apresentacoes?: Apresentacao[];
  contratosAvulsos?: AlunoContrato[];
}

export interface Instrumento {
  id: number;
  nome: string;
  tipo: string;
  numero_serie: string | null;
  status: 'disponivel' | 'emprestado' | 'manutencao' | 'inativo';
  id_aluno: number | null;
  data_emprestimo: string | null;
  observacoes: string | null;
  contrato_gerado?: string | null;
}

export interface ProfessorBasico {
  id: number;
  usuario?: { id: number; nome: string };
}

export interface Matricula {
  id: number;
  id_aluno: number;
  tipo?: 'turma' | 'curso';
  id_turma: number | null;
  id_curso?: number | null;
  id_nivel?: number | null;
  id_professor?: number | null;
  data: string;
  status: string | null;
  observacoes: string | null;
  contrato_gerado?: string | null;
  turma?: Turma | null;
  curso?: { id: number; nome: string } | null;
  nivel?: { id: number; nome: string } | null;
  professor?: ProfessorBasico | null;
  aluno?: Aluno;
  contas?: Conta[];
}

export interface Conta {
  id: number;
  id_categoria: number;
  id_aluno: number | null;
  id_matricula: number | null;
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado';
  tipo: 'receita' | 'despesa';
  numero_parcela: number | null;
  quantidade_parcelas: number | null;
  mes_referencia: number | null;
  ano_referencia: number | null;
  saldo_devedor: number;
}

export interface Turma {
  id: number;
  id_curso: number;
  id_nivel: number;
  id_professor: number;
  maximo_alunos: number;
  descricao: string | null;
  status: string;
  curso?: { id: number; nome: string };
  nivel?: { id: number; nome: string };
  professor?: ProfessorBasico;
  horarios: TurmaHorario[];
}

export interface TurmaHorario {
  id: number;
  id_turma: number;
  dia_semana: number;
  hora_inicio: string;
  hora_termino: string;
}

export interface AlunoFormData {
  nome: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  cpf: string;
  data_nascimento?: string;
  telefone?: string;
  whatsapp?: string;
  observacoes?: string;
  responsavel_nome?: string;
  responsavel_email?: string;
  responsavel_cpf?: string;
  responsavel_telefone?: string;
  responsavel_whatsapp?: string;
  responsavel_observacoes?: string;
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  id_estado?: number;
  id_cidade?: number;
  responsavel_cep?: string;
  responsavel_rua?: string;
  responsavel_numero?: string;
  responsavel_complemento?: string;
  responsavel_bairro?: string;
  responsavel_id_estado?: number;
  responsavel_id_cidade?: number;
}

export interface AlunoPaginatedResponse {
  data: Aluno[];
  meta: PaginationMeta;
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}
