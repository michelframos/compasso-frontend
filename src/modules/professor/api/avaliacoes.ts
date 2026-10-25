import api from '@/shared/lib/axios'
import type { AvaliacaoAluno, AvaliacaoPayload, NivelOpcao, SugestaoProgressao } from '../types'

export async function listAvaliacoes(filtro: { id_turma: number } | { id_aluno: number }) {
  const { data } = await api.get<{ data: AvaliacaoAluno[] }>('/professor/me/avaliacoes', { params: filtro })
  return data.data
}

export async function createAvaliacao(payload: AvaliacaoPayload & { id_aluno: number }) {
  const { data } = await api.post<{ data: AvaliacaoAluno }>('/professor/me/avaliacoes', payload)
  return data.data
}

export async function updateAvaliacao(id: number, payload: Omit<AvaliacaoPayload, 'id_aluno' | 'id_turma'>) {
  const { data } = await api.put<{ data: AvaliacaoAluno }>(`/professor/me/avaliacoes/${id}`, payload)
  return data.data
}

export async function deleteAvaliacao(id: number) {
  await api.delete(`/professor/me/avaliacoes/${id}`)
}

export async function listNiveis() {
  const { data } = await api.get<{ data: NivelOpcao[] }>('/professor/me/niveis')
  return data.data
}

export async function createSugestaoProgressao(payload: { id_matricula: number; id_nivel_sugerido: number; justificativa: string }) {
  const { data } = await api.post<{ data: SugestaoProgressao }>('/professor/me/progressoes', payload)
  return data.data
}

export async function cancelarSugestaoProgressao(id: number) {
  await api.delete(`/professor/me/progressoes/${id}`)
}
