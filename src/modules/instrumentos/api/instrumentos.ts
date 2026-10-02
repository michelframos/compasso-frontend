import api from '@/shared/lib/axios'
import type { Instrumento } from '../store/useInstrumentoStore'

export type ListInstrumentosParams = {
  page?: number
  status?: string
  per_page?: number
}

export async function listInstrumentos(params: ListInstrumentosParams = {}) {
  const { data } = await api.get('/instrumentos', { params })
  return data as {
    data: Instrumento[]
    current_page: number
    last_page: number
    total: number
  }
}

export async function getInstrumento(id: number | string) {
  const { data } = await api.get(`/instrumentos/${id}`)
  return data
}

export async function createInstrumento(payload: Partial<Instrumento>) {
  const { data } = await api.post('/instrumentos', payload)
  return data
}

export async function updateInstrumento(id: number | string, payload: Partial<Instrumento>) {
  const { data } = await api.put(`/instrumentos/${id}`, payload)
  return data
}

export async function deleteInstrumento(id: number | string) {
  await api.delete(`/instrumentos/${id}`)
}

export async function emprestarInstrumento(
  id: number | string,
  payload: Record<string, unknown>,
) {
  const { data } = await api.post(`/instrumentos/${id}/emprestar`, payload)
  return data
}

export async function devolverInstrumento(id: number | string) {
  const { data } = await api.post(`/instrumentos/${id}/devolver`)
  return data
}

export async function getHistorico(id: number | string) {
  const { data } = await api.get(`/instrumentos/${id}/historico`)
  return data
}
