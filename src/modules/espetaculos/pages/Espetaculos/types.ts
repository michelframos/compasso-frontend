export interface Espetaculo {
  id: number;
  titulo: string;
  data_evento: string;
  hora_evento?: string | null;
  local: string;
  status: 'planejamento' | 'aberto' | 'concluido' | 'cancelado';
  observacoes?: string;
  contrato_id?: number | null;
  validade_ingresso_inicio?: string | null;
  validade_ingresso_fim?: string | null;
  id_template_ingresso?: number | null;
  valor_ingresso_padrao?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface EspetaculoFormData {
  titulo: string;
  data_evento: string;
  hora_evento?: string | null;
  local: string;
  status: string;
  observacoes?: string;
  contrato_id?: number | null;
  validade_ingresso_inicio?: string | null;
  validade_ingresso_fim?: string | null;
  id_template_ingresso?: number | null;
  valor_ingresso_padrao?: number | null;
}
