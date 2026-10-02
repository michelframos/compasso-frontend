import api from '@/shared/lib/axios'
import type { Depoimento, DepoimentoFormData, PaginatedResponse } from '../types'

export interface ListDepoimentosParams {
  page?: number
  per_page?: number
  search?: string
  aprovado?: boolean
}

export async function listDepoimentos(params: ListDepoimentosParams = {}) {
  const { data } = await api.get<PaginatedResponse<Depoimento>>('/platform/depoimentos', { params })
  return data
}

export async function getDepoimento(id: number) {
  const { data } = await api.get<{ data: Depoimento }>(`/platform/depoimentos/${id}`)
  return data.data
}

export async function createDepoimento(payload: DepoimentoFormData) {
  const { data } = await api.post<{ data: Depoimento }>('/platform/depoimentos', payload)
  return data.data
}

export async function updateDepoimento(id: number, payload: Partial<DepoimentoFormData>) {
  const { data } = await api.put<{ data: Depoimento }>(`/platform/depoimentos/${id}`, payload)
  return data.data
}

export async function deleteDepoimento(id: number) {
  await api.delete(`/platform/depoimentos/${id}`)
}

export async function aprovarDepoimento(id: number) {
  const { data } = await api.post<{ data: Depoimento }>(`/platform/depoimentos/${id}/aprovar`)
  return data.data
}

export async function ocultarDepoimento(id: number) {
  const { data } = await api.post<{ data: Depoimento }>(`/platform/depoimentos/${id}/ocultar`)
  return data.data
}
