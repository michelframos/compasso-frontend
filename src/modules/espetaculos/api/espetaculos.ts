import api from '@/shared/lib/axios'
import type { Espetaculo } from '../pages/Espetaculos/types'
import type { PaginatedResponse } from '@/modules/academico'

export type ListEspetaculosParams = Record<string, unknown>

export async function listEspetaculos(params: ListEspetaculosParams = {}) {
  const { data } = await api.get<PaginatedResponse<Espetaculo>>('/espetaculos', { params })
  return data
}

export async function getEspetaculo(id: number | string) {
  const { data } = await api.get(`/espetaculos/${id}`)
  return data
}

export async function createEspetaculo(payload: Record<string, unknown>) {
  const { data } = await api.post('/espetaculos', payload)
  return data
}

export async function updateEspetaculo(id: number | string, payload: Record<string, unknown>) {
  const { data } = await api.put(`/espetaculos/${id}`, payload)
  return data
}

export async function deleteEspetaculo(id: number | string) {
  await api.delete(`/espetaculos/${id}`)
}
