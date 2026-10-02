import api from '@/shared/lib/axios'
import type { Contrato } from '../store/useContratoStore'

export type ListContratosParams = {
  page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  search?: string
}

export async function listContratos(params: ListContratosParams = {}) {
  const { data } = await api.get('/contratos', { params })
  return data as { data: Contrato[]; meta: { current_page: number; last_page: number; total: number } }
}

export async function getContrato(id: number | string) {
  const { data } = await api.get(`/contratos/${id}`)
  return data
}

export async function createContrato(payload: Partial<Contrato>) {
  const { data } = await api.post('/contratos', payload)
  return data
}

export async function updateContrato(id: number | string, payload: Partial<Contrato>) {
  const { data } = await api.put(`/contratos/${id}`, payload)
  return data
}

export async function deleteContrato(id: number | string) {
  await api.delete(`/contratos/${id}`)
}
