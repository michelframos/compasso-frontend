import api from '@/shared/lib/axios'
import type {
  AuthResponse,
  Instituicao,
  SwitchInstituicaoResponse,
} from '@/modules/core/types'

export type LoginPayload = {
  email: string
  password: string
  tenant_cnpj: string
}

export type PlatformLoginPayload = {
  email: string
  password: string
}

export function normalizeInstituicoes(
  tenants?: Instituicao[] | { data: Instituicao[] } | null,
): Instituicao[] {
  if (!tenants) {
    return []
  }

  if (Array.isArray(tenants)) {
    return tenants
  }

  return tenants.data ?? []
}

export async function login(payload: LoginPayload) {
  const { data } = await api.post<AuthResponse>('/login', {
    email: payload.email,
    password: payload.password,
    tenant_cnpj: payload.tenant_cnpj,
  })

  return data
}

export async function platformLogin(payload: PlatformLoginPayload) {
  const { data } = await api.post<AuthResponse>('/platform/login', {
    email: payload.email,
    password: payload.password,
  })

  return data
}

export async function switchInstituicao(tenantSlug: string) {
  const { data } = await api.post<SwitchInstituicaoResponse>('/instituicoes/switch', {
    tenant_slug: tenantSlug,
  })

  return data
}

export async function listMinhasInstituicoes() {
  const { data } = await api.get<{ data: Instituicao[] }>('/instituicoes/mine')
  return normalizeInstituicoes(data)
}

export async function forgotPassword(email: string) {
  const { data } = await api.post<{ message: string }>('/forgot-password', { email })
  return data
}

export async function resetPassword(payload: {
  email: string
  token: string
  password: string
  password_confirmation: string
}) {
  const { data } = await api.post<{ message: string }>('/reset-password', payload)
  return data
}

export async function logout() {
  const { data } = await api.post<{ message: string }>('/logout')
  return data
}
