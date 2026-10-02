import api from '@/shared/lib/axios'
import type { Turma, PaginatedResponse, TurmaStatus } from '../pages/Turmas/types'

export type ListTurmasParams = {
  page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  search?: string
  per_page?: number
}

export async function listTurmas(params: ListTurmasParams = {}) {
  const { data } = await api.get<PaginatedResponse<Turma>>('/turmas', { params })
  return data
}

export async function getTurma(id: number | string) {
  const { data } = await api.get(`/turmas/${id}`)
  return data
}

export async function createTurma(payload: Record<string, unknown>) {
  const { data } = await api.post('/turmas', payload)
  return data
}

export async function updateTurma(id: number | string, payload: Record<string, unknown>) {
  const { data } = await api.put(`/turmas/${id}`, payload)
  return data
}

export async function updateTurmaStatus(id: number | string, status: TurmaStatus) {
  await api.patch(`/turmas/${id}/status`, { status })
}

export async function deleteTurma(id: number | string) {
  await api.delete(`/turmas/${id}`)
}
