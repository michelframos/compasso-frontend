export type TurmaStatus = 'planejamento' | 'aberta' | 'em_andamento' | 'pausada' | 'concluida' | 'cancelada';

export interface Turma {
  id: number;
  id_curso: number;
  id_nivel: number;
  id_professor: number | null;
  maximo_alunos: number;
  descricao: string | null;
  observacoes: string | null;
  status: TurmaStatus;
  tipo_agendamento: 'datas' | 'quantidade';
  data_inicio: string | null;
  data_fim: string | null;
  quantidade_aulas: number | null;
  valor_mensalidade: number | null;
  percentual_comissao_especifico: number | null;
  valor_hora_aula_especifico: number | null;
  contrato_id: number | null;
  matriculas_count?: number;
  curso?: {
    id: number;
    nome: string;
  };
  nivel?: {
    id: number;
    nome: string;
  };
  professor?: {
    id: number;
    usuario: {
      nome: string;
      email: string;
      telefone?: string | null;
    };
  };
  horarios?: {
    id: number;
    id_turma: number;
    dia_semana: string;
    hora_inicio: string;
    hora_termino: string;
  }[];
  matriculas?: {
    id: number;
    id_aluno: number;
    id_turma: number;
    status: string;
    data?: string;
    contrato_gerado?: string | null;
    aluno?: {
      id: number;
      usuario: {
        nome: string;
        email: string;
        telefone?: string | null;
      };
    };
  }[];

}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export interface AulaPresenca {
  id: number;
  id_aula_turma: number;
  id_aluno: number;
  status: 'presente' | 'falta' | 'falta_justificada';
  observacao?: string | null;
  aluno?: {
    id: number;
    usuario?: {
      nome: string;
    };
  };
}

export interface SyncAulaPresencasPayload {
  conteudo_dado?: string | null;
  presencas: {
    id_aluno: number;
    status: 'presente' | 'falta' | 'falta_justificada';
    observacao?: string | null;
  }[];
}
