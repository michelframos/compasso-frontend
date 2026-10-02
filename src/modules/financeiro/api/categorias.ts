import api from '@/shared/lib/axios'
import type { CategoriaConta, PaginatedResponse } from '../pages/Financeiro/types'

export type ListCategoriasParams = Record<string, unknown>

export async function listCategorias(params: ListCategoriasParams = {}) {
  const { data } = await api.get<PaginatedResponse<CategoriaConta>>('/categorias-contas', { params })
  return data
}

export async function createCategoria(payload: Record<string, unknown>) {
  const { data } = await api.post('/categorias-contas', payload)
  return data
}

export async function updateCategoria(id: number | string, payload: Record<string, unknown>) {
  const { data } = await api.put(`/categorias-contas/${id}`, payload)
  return data
}

export async function deleteCategoria(id: number | string) {
  await api.delete(`/categorias-contas/${id}`)
}
