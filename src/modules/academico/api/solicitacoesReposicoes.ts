import api from '@/shared/lib/axios'

export type StatusReposicao = 'pendente' | 'aprovada' | 'recusada'

export interface AulaReposicaoStaff {
  id: number
  data: string
  hora_inicio: string
  hora_termino: string
  turma: string | null
}

export interface SolicitacaoReposicao {
  id: number
  motivo: string
  status: StatusReposicao
  id_aula_turma_destino: number | null
  aluno: { id: number; nome: string | null }
  perdida: AulaReposicaoStaff | null
  destino: AulaReposicaoStaff | null
}

export async function listarSolicitacoesReposicao(status: StatusReposicao) {
  const { data } = await api.get<{ data: SolicitacaoReposicao[] }>('/solicitacoes-reposicoes', { params: { status } })
  return data.data
}

export async function listarOpcoesDaReposicao(id: number) {
  const { data } = await api.get<{ data: AulaReposicaoStaff[] }>(`/solicitacoes-reposicoes/${id}/opcoes`)
  return data.data
}

export async function decidirReposicao(id: number, decisao: 'aprovada' | 'recusada', idAulaDestino?: number | null) {
  const { data } = await api.post<{ data: SolicitacaoReposicao }>(`/solicitacoes-reposicoes/${id}/decisao`, {
    decisao,
    id_aula_turma_destino: idAulaDestino ?? null,
  })
  return data.data
}
