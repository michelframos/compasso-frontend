import api from '@/shared/lib/axios'
import type { PaginatedResponse, PlanoAssinatura, PlanoFormData } from '../types'

export interface ListPlanosParams {
  page?: number
  per_page?: number
  search?: string
  ativo?: boolean
}

export async function listPlanos(params: ListPlanosParams = {}) {
  const { data } = await api.get<PaginatedResponse<PlanoAssinatura>>('/platform/planos', { params })
  return data
}

export async function getPlano(id: number) {
  const { data } = await api.get<{ data: PlanoAssinatura }>(`/platform/planos/${id}`)
  return data.data
}

export async function createPlano(payload: PlanoFormData) {
  const { data } = await api.post<{ data: PlanoAssinatura }>('/platform/planos', payload)
  return data.data
}

export async function updatePlano(id: number, payload: Partial<PlanoFormData>) {
  const { data } = await api.put<{ data: PlanoAssinatura }>(`/platform/planos/${id}`, payload)
  return data.data
}

export async function deletePlano(id: number) {
  await api.delete(`/platform/planos/${id}`)
}
