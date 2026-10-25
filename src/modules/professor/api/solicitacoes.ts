import api from '@/shared/lib/axios'
import type {
  Disponibilidade,
  OpcoesSolicitacao,
  ProfessorLivre,
  SolicitacaoAula,
  SolicitacaoAulaPayload,
  StatusSolicitacaoAula,
} from '../types'

export interface PaginaSolicitacoes {
  data: SolicitacaoAula[]
  meta: { current_page: number; last_page: number; total: number }
}

export async function listMinhasSolicitacoes(params: { page?: number; status?: StatusSolicitacaoAula | 'todas' } = {}) {
  const { data } = await api.get<PaginaSolicitacoes>('/professor/me/solicitacoes', { params })
  return data
}

export async function criarSolicitacao(payload: SolicitacaoAulaPayload) {
  const { data } = await api.post<{ data: SolicitacaoAula }>('/professor/me/solicitacoes', payload)
  return data.data
}

export async function cancelarSolicitacao(id: number) {
  await api.delete(`/professor/me/solicitacoes/${id}`)
}

export async function getOpcoesSolicitacao(idAula: number) {
  const { data } = await api.get<{ data: OpcoesSolicitacao }>(`/professor/me/aulas/${idAula}/opcoes-solicitacao`)
  return data.data
}

export async function listProfessoresLivres(params: { data: string; hora_inicio: string; hora_termino: string; ignorar_aula?: number }) {
  const { data } = await api.get<{ data: ProfessorLivre[] }>('/agenda/professores-livres', { params })
  return data.data
}

export async function getMinhaDisponibilidade() {
  const { data } = await api.get<{ data: Disponibilidade[] }>('/professor/me/disponibilidades')
  return data.data
}

export async function salvarMinhaDisponibilidade(disponibilidades: Disponibilidade[]) {
  const { data } = await api.put<{ data: Disponibilidade[] }>('/professor/me/disponibilidades', { disponibilidades })
  return data.data
}
