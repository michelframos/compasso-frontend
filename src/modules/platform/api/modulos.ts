import api from '@/shared/lib/axios'
import type { PaginatedResponse, SiteModulo, SiteModuloFormData } from '../types'

export interface ListSiteModulosParams {
  page?: number
  per_page?: number
  search?: string
  aprovado?: boolean
}

export async function listSiteModulos(params: ListSiteModulosParams = {}) {
  const { data } = await api.get<PaginatedResponse<SiteModulo>>('/platform/modulos', { params })
  return data
}

export async function getSiteModulo(id: number) {
  const { data } = await api.get<{ data: SiteModulo }>(`/platform/modulos/${id}`)
  return data.data
}

export async function createSiteModulo(payload: SiteModuloFormData) {
  const { data } = await api.post<{ data: SiteModulo }>('/platform/modulos', payload)
  return data.data
}

export async function updateSiteModulo(id: number, payload: Partial<SiteModuloFormData>) {
  const { data } = await api.put<{ data: SiteModulo }>(`/platform/modulos/${id}`, payload)
  return data.data
}

export async function deleteSiteModulo(id: number) {
  await api.delete(`/platform/modulos/${id}`)
}

export async function aprovarSiteModulo(id: number) {
  const { data } = await api.post<{ data: SiteModulo }>(`/platform/modulos/${id}/aprovar`)
  return data.data
}

export async function ocultarSiteModulo(id: number) {
  const { data } = await api.post<{ data: SiteModulo }>(`/platform/modulos/${id}/ocultar`)
  return data.data
}
