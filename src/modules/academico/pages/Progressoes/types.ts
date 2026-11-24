export type StatusProgressao = 'pendente' | 'aprovada' | 'rejeitada'

export type FiltroStatusProgressao = StatusProgressao | 'todas'

export interface TurmaDestinoOpcao {
  id: number
  descricao: string | null
  curso: string | null
  nivel: string | null
  professor: string | null
  alunos_vigentes: number
  maximo_alunos: number
  valor_mensalidade?: number | null
  dia_vencimento_mensalidade?: number | null
  quantidade_parcelas_mensalidade?: number | null
}

export interface SugestaoProgressao {
  id: number
  status: StatusProgressao
  justificativa: string
  motivo_decisao: string | null
  decidido_em: string | null
  created_at: string
  aluno: { id: number; nome: string | null } | null
  matricula: {
    id: number
    tipo: 'turma' | 'curso'
    status: string | null
    curso: { nome: string } | null
    turma: { id: number; descricao: string | null } | null
  } | null
  nivel_atual: { id: number; nome: string } | null
  nivel_sugerido: { id: number; nome: string } | null
  professor: { id: number; nome: string | null } | null
  turma_destino: { id: number; descricao: string | null } | null
  decisor: { nome: string | null } | null
  /** Presente apenas nas sugestões pendentes da listagem. */
  turmas_destino?: TurmaDestinoOpcao[]
}

export interface DecisaoProgressaoPayload {
  decisao: 'aprovada' | 'rejeitada'
  id_turma_destino?: number | null
  motivo_decisao?: string | null
  reajustar_mensalidades?: boolean
  gerar_novas_mensalidades?: boolean
  valor_mensalidade_geracao?: number
  quantidade_parcelas?: number
  dia_vencimento?: number
  data_inicio_mensalidades?: string
}
