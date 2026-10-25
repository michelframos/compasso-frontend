import api from '@/shared/lib/axios'
import type { ApresentacaoDoProfessor, EnsaioAgendado, EnsaioPayload, SituacaoApresentacao } from '../types'

export async function listMinhasApresentacoes(situacao: SituacaoApresentacao) {
  const { data } = await api.get<{ data: ApresentacaoDoProfessor[] }>('/professor/me/apresentacoes', {
    params: { situacao },
  })
  return data.data
}

export async function getMinhaApresentacao(id: number | string) {
  const { data } = await api.get<{ data: ApresentacaoDoProfessor }>(`/professor/me/apresentacoes/${id}`)
  return data.data
}

export async function listEnsaios(params: { id_apresentacao?: number; data_inicio?: string; data_fim?: string }) {
  const { data } = await api.get<{ data: EnsaioAgendado[] }>('/ensaios', { params })
  return data.data
}

export async function createEnsaio(idApresentacao: number, payload: EnsaioPayload) {
  const { data } = await api.post<{ data: EnsaioAgendado }>('/ensaios', { ...payload, id_apresentacao: idApresentacao })
  return data.data
}

export async function updateEnsaio(id: number, payload: EnsaioPayload) {
  const { data } = await api.put<{ data: EnsaioAgendado }>(`/ensaios/${id}`, payload)
  return data.data
}

export async function deleteEnsaio(id: number) {
  await api.delete(`/ensaios/${id}`)
}
