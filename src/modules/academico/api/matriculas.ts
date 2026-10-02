import api from '@/shared/lib/axios'
import type { Matricula, PaginatedResponse } from '../pages/Matriculas/types'

export type ListMatriculasParams = {
  page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  search?: string
  status?: string
  per_page?: number
}

export async function listMatriculas(params: ListMatriculasParams = {}) {
  const { data } = await api.get<PaginatedResponse<Matricula>>('/matriculas', { params })
  return data
}

export async function getMatricula(id: number | string) {
  const { data } = await api.get(`/matriculas/${id}`)
  return data
}

export async function createMatricula(payload: Record<string, unknown>) {
  const { data } = await api.post('/matriculas', payload)
  return data
}

export async function updateMatricula(id: number | string, payload: Record<string, unknown>) {
  const { data } = await api.put(`/matriculas/${id}`, payload)
  return data
}

export async function deleteMatricula(id: number | string) {
  await api.delete(`/matriculas/${id}`)
}

export async function getMatriculaHistorico(id: number | string) {
  const { data } = await api.get(`/matriculas/${id}/historico`)
  return data
}

export async function getMatriculaMensalidades(id: number | string) {
  const { data } = await api.get(`/matriculas/${id}/mensalidades`)
  return data
}

export async function gerarMensalidades(id: number | string, payload: Record<string, unknown>) {
  const { data } = await api.post(`/matriculas/${id}/gerar-mensalidades`, payload)
  return data
}

export async function getMatriculasByAluno(alunoId: number | string) {
  const { data } = await api.get(`/alunos/${alunoId}/matriculas`)
  return data
}

export async function getMatriculasByTurma(turmaId: number | string) {
  const { data } = await api.get(`/turmas/${turmaId}/matriculas`)
  return data
}
