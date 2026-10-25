import api from '@/shared/lib/axios'
import type { SolicitacaoAula, StatusSolicitacaoAula, TipoSolicitacaoAula } from '@/modules/professor'
import type { PaginatedResponse } from '../pages/Cursos/types'

export type FiltroStatusSolicitacao = StatusSolicitacaoAula | 'todas'

export interface ListSolicitacoesAulasParams {
  page?: number
  status?: FiltroStatusSolicitacao
  tipo?: TipoSolicitacaoAula
  search?: string
}

export interface DecisaoSolicitacaoPayload {
  decisao: 'aprovada' | 'rejeitada'
  motivo_decisao?: string | null
  data_sugerida?: string
  hora_inicio_sugerida?: string
  hora_termino_sugerida?: string
  id_professor_substituto?: number | null
  destino_cobranca?: 'proxima_aula' | 'cancelar'
  avisar_alunos?: boolean
}

export async function listSolicitacoesAulas(params: ListSolicitacoesAulasParams = {}) {
  const { data } = await api.get<PaginatedResponse<SolicitacaoAula>>('/solicitacoes-aulas', { params })
  return data
}

export async function decidirSolicitacaoAula(id: number, payload: DecisaoSolicitacaoPayload) {
  const { data } = await api.post<{ data: SolicitacaoAula }>(`/solicitacoes-aulas/${id}/decisao`, payload)
  return data.data
}
