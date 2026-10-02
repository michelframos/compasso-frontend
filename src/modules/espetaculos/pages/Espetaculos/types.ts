export interface Espetaculo {
  id: number;
  titulo: string;
  data_evento: string;
  local: string;
  status: 'planejamento' | 'aberto' | 'concluido' | 'cancelado';
  observacoes?: string;
  contrato_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface EspetaculoFormData {
  titulo: string;
  data_evento: string;
  local: string;
  status: string;
  observacoes?: string;
  contrato_id?: number | null;
}
