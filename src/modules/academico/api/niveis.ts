import api from '@/shared/lib/axios'
import type { Nivel, PaginatedResponse } from '../pages/Niveis/types'

export type ListNiveisParams = {
  page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  search?: string
  per_page?: number
}

export async function listNiveis(params: ListNiveisParams = {}) {
  const { data } = await api.get<PaginatedResponse<Nivel>>('/niveis', { params })
  return data
}

export async function createNivel(payload: Record<string, unknown>) {
  const { data } = await api.post('/niveis', payload)
  return data as Nivel
}

export async function updateNivel(id: number | string, payload: Record<string, unknown>) {
  const { data } = await api.put(`/niveis/${id}`, payload)
  return data as Nivel
}

export async function deleteNivel(id: number | string) {
  await api.delete(`/niveis/${id}`)
}
