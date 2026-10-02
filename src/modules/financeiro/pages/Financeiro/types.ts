export interface ConfiguracaoPix {
  id: number;
  chave_pix: string;
  tipo_chave: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'evp';
  nome_beneficiario: string;
  cidade: string;
  exibir_qrcode: boolean;
}

export interface ConfiguracaoPixFormData {
  chave_pix: string;
  tipo_chave: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'evp';
  nome_beneficiario: string;
  cidade: string;
  exibir_qrcode: boolean;
}

export type { ConfiguracaoEmpresa, ConfiguracaoEmpresaFormData } from '@/modules/core';

export interface CategoriaConta {
  id: number;
  nome: string;
  tipo: 'receita' | 'despesa';
  descricao: string | null;
}

export interface CategoriaContaFormData {
  nome: string;
  tipo: 'receita' | 'despesa';
  descricao?: string;
}

export interface ContaPagamento {
  id: number;
  id_conta: number;
  valor_pago: number;
  data_pagamento: string;
  forma_pagamento: string;
  comprovante_url: string | null;
  observacoes: string | null;
}

export interface Conta {
  id: number;
  id_categoria: number;
  id_aluno: number | null;
  id_professor: number | null;
  id_matricula: number | null;
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: 'pendente' | 'pago' | 'cancelado' | 'atrasado';
  tipo: 'receita' | 'despesa';
  observacoes: string | null;
  numero_parcela: number | null;
  quantidade_parcelas: number | null;
  mes_referencia: number | null;
  ano_referencia: number | null;
  saldo_devedor: number;
  notificar: boolean;
  pagamentos?: ContaPagamento[];
  categoria?: CategoriaConta;
  aluno?: {
    id: number;
    nome: string | null;
  } | null;
  professor?: {
    id: number;
    nome: string | null;
  } | null;
}

export interface ContaFormData {
  id_categoria: number;
  id_aluno?: number;
  id_professor?: number;
  id_matricula?: number;
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: 'pendente' | 'pago' | 'cancelado' | 'atrasado';
  tipo: 'receita' | 'despesa';
  observacoes?: string;
  numero_parcela?: number;
  quantidade_parcelas?: number;
  mes_referencia?: number;
  ano_referencia?: number;
  notificar?: boolean;
}

export interface PagamentoFormData {
  valor_pago: number;
  data_pagamento: string;
  forma_pagamento: string;
  observacoes?: string;
}

export interface PagamentoLoteFormData {
  conta_ids: number[];
  data_pagamento: string;
  forma_pagamento: string;
  observacoes?: string;
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
