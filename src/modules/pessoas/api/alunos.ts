import api from '@/shared/lib/axios'
import type { Aluno, AlunoPaginatedResponse } from '../pages/Alunos/types'

export type ListAlunosParams = {
  page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  search?: string
  per_page?: number
}

export async function listAlunos(params: ListAlunosParams = {}) {
  const { data } = await api.get<AlunoPaginatedResponse>('/alunos', { params })
  return data
}

export async function listAlunosSimple() {
  const { data } = await api.get<Array<{ id: number; nome: string }>>('/alunos/list')
  return data
}

export async function getAluno(id: number | string) {
  const { data } = await api.get(`/alunos/${id}`)
  return data as Aluno | { data: Aluno }
}

export async function createAluno(payload: Record<string, unknown>) {
  const { data } = await api.post('/alunos', payload)
  return data as Aluno
}

export async function updateAluno(id: number | string, payload: Record<string, unknown>) {
  const { data } = await api.put(`/alunos/${id}`, payload)
  return data as Aluno
}

export async function deleteAluno(id: number | string) {
  await api.delete(`/alunos/${id}`)
}

export async function enviarAcessoAluno(id: number | string) {
  const { data } = await api.post<{ message: string }>(`/alunos/${id}/enviar-acesso`)
  return data
}

export async function createContratoAvulso(
  alunoId: number | string,
  payload: { contrato_id: number; contrato_gerado: string },
) {
  const { data } = await api.post(`/alunos/${alunoId}/contratos-avulsos`, payload)
  return data
}

export async function deleteContratoAvulso(alunoId: number | string, alunoContratoId: number | string) {
  await api.delete(`/alunos/${alunoId}/contratos-avulsos/${alunoContratoId}`)
}
