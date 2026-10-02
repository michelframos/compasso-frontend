import api from '@/shared/lib/axios'
import type { Curso, PaginatedResponse } from '../pages/Cursos/types'

export type ListCursosParams = {
  page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  search?: string
  per_page?: number
}

export async function listCursos(params: ListCursosParams = {}) {
  const { data } = await api.get<PaginatedResponse<Curso>>('/cursos', { params })
  return data
}

export async function getCurso(id: number | string) {
  const { data } = await api.get(`/cursos/${id}`)
  return data
}

export async function createCurso(payload: Record<string, unknown>) {
  const { data } = await api.post('/cursos', payload)
  return data as Curso
}

export async function updateCurso(id: number | string, payload: Record<string, unknown>) {
  const { data } = await api.put(`/cursos/${id}`, payload)
  return data as Curso
}

export async function deleteCurso(id: number | string) {
  await api.delete(`/cursos/${id}`)
}
