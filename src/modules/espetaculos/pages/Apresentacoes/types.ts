import type { Espetaculo } from '../Espetaculos/types';
import type { Turma } from '@/modules/academico';

export interface ApresentacaoAluno {
  id: number;
  id_apresentacao: number;
  id_aluno: number;
  papel: string | null;
  tamanho_figurino: string | null;
  valor_figurino: number | null;
  pago_figurino: boolean;
  recebeu_figurino: boolean;
  fatura_gerada: boolean;
  presenca_ensaio_geral: boolean;
  aluno?: {
    id: number;
    nome: string;
    cpf?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface Apresentacao {
  id: number;
  id_espetaculo: number;
  id_turma: number;
  titulo_musica: string;
  ordem_entrada: number;
  duracao_estimada: string;
  created_at?: string;
  updated_at?: string;
  espetaculo?: Espetaculo;
  turma?: Turma;
  participantes?: ApresentacaoAluno[];
}

export interface ApresentacaoFormData {
  id_espetaculo: number;
  id_turma: number;
  titulo_musica: string;
  ordem_entrada: number;
  duracao_estimada: string;
}
