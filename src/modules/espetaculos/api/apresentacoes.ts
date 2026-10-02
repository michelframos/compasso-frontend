import api from '@/shared/lib/axios'
import type { Apresentacao, ApresentacaoAluno } from '../pages/Apresentacoes/types'
import type { PaginatedResponse } from '@/modules/academico'

export type ListApresentacoesParams = Record<string, unknown>

export async function listApresentacoes(params: ListApresentacoesParams = {}) {
  const { data } = await api.get<PaginatedResponse<Apresentacao>>('/apresentacoes', { params })
  return data
}

export async function getApresentacao(id: number | string) {
  const { data } = await api.get(`/apresentacoes/${id}`)
  return data
}

export async function createApresentacao(payload: Record<string, unknown>) {
  const { data } = await api.post('/apresentacoes', payload)
  return data
}

export async function updateApresentacao(id: number | string, payload: Record<string, unknown>) {
  const { data } = await api.put(`/apresentacoes/${id}`, payload)
  return data
}

export async function deleteApresentacao(id: number | string) {
  await api.delete(`/apresentacoes/${id}`)
}

export async function listParticipantes(params: Record<string, unknown> = {}) {
  const { data } = await api.get('/apresentacoes-alunos', { params })
  return data
}

export async function createParticipante(payload: Record<string, unknown>) {
  const { data } = await api.post('/apresentacoes-alunos', payload)
  return data as ApresentacaoAluno
}

export async function updateParticipante(id: number | string, payload: Record<string, unknown>) {
  const { data } = await api.put(`/apresentacoes-alunos/${id}`, payload)
  return data as ApresentacaoAluno
}

export async function deleteParticipante(id: number | string) {
  await api.delete(`/apresentacoes-alunos/${id}`)
}

export async function gerarCobrancasFigurino(
  apresentacaoId: number | string,
  payload: { participantes_ids: number[]; data_vencimento: string },
) {
  const { data } = await api.post(`/apresentacoes/${apresentacaoId}/gerar-cobrancas-figurino`, payload)
  return data as { message: string; contas_geradas: number }
}
