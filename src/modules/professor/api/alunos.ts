import api from '@/shared/lib/axios'
import type { AlunoDoProfessor, FichaAluno, ObservacaoAluno, ObservacaoPayload, TipoMatricula } from '../types'

export interface ListMeusAlunosParams {
  tipo?: TipoMatricula
  search?: string
}

export async function listMeusAlunos(params: ListMeusAlunosParams = {}) {
  const { data } = await api.get<{ data: AlunoDoProfessor[] }>('/professor/me/alunos', {
    params: { tipo: params.tipo || undefined, search: params.search || undefined },
  })
  return data.data
}

export async function getFichaAluno(id: number | string) {
  const { data } = await api.get<{ data: FichaAluno }>(`/professor/me/alunos/${id}`)
  return data.data
}

export async function createObservacao(idAluno: number, payload: ObservacaoPayload) {
  const { data } = await api.post<{ data: ObservacaoAluno }>('/professor/me/observacoes', {
    ...payload,
    id_aluno: idAluno,
  })
  return data.data
}

export async function updateObservacao(id: number, payload: Omit<ObservacaoPayload, 'id_turma'>) {
  const { data } = await api.put<{ data: ObservacaoAluno }>(`/professor/me/observacoes/${id}`, payload)
  return data.data
}

export async function deleteObservacao(id: number) {
  await api.delete(`/professor/me/observacoes/${id}`)
}
