import api from '@/shared/lib/axios'
import type { InstituicaoFormData, PaginatedResponse, PlatformInstituicao, PlatformInstituicaoUsuario } from '../types'

export interface ListInstituicoesParams {
  page?: number
  per_page?: number
  search?: string
  status?: string
}

export type InstituicaoPayload = Omit<
  InstituicaoFormData,
  'trial_mode' | 'trial_dias' | 'trial_ends_at' | 'usar_trial_padrao'
> & {
  trial_dias?: number | null
  trial_ends_at?: string | null
  usar_trial_padrao?: boolean
}

export async function listInstituicoes(params: ListInstituicoesParams = {}) {
  const { data } = await api.get<PaginatedResponse<PlatformInstituicao>>('/platform/instituicoes', { params })
  return data
}

export async function getInstituicao(id: number) {
  const { data } = await api.get<{ data: PlatformInstituicao }>(`/platform/instituicoes/${id}`)
  return data.data
}

export type InstituicaoCreatePayload = InstituicaoPayload & {
  admin_nome: string
  admin_email: string
  admin_password: string
  admin_password_confirmation: string
  admin_cpf?: string
}

export async function createInstituicao(payload: InstituicaoCreatePayload) {
  const { data } = await api.post<{ data: PlatformInstituicao }>('/platform/instituicoes', payload)
  return data.data
}

export async function updateInstituicao(id: number, payload: Partial<InstituicaoPayload>) {
  const { data } = await api.put<{ data: PlatformInstituicao }>(`/platform/instituicoes/${id}`, payload)
  return data.data
}

export async function deleteInstituicao(id: number) {
  await api.delete(`/platform/instituicoes/${id}`)
}

export interface ListInstituicaoUsuariosParams {
  page?: number
  per_page?: number
  search?: string
}

export async function listInstituicaoUsuarios(instituicaoId: number, params: ListInstituicaoUsuariosParams = {}) {
  const { data } = await api.get<PaginatedResponse<PlatformInstituicaoUsuario>>(
    `/platform/instituicoes/${instituicaoId}/usuarios`,
    { params },
  )
  return data
}
