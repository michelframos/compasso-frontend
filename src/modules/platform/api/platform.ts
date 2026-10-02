import api from '@/shared/lib/axios'
import type { AuthUser, Instituicao } from '@/modules/core/types'

export interface ImpersonateResponse {
  token: string
  tenant: Instituicao
  user: AuthUser
  impersonation: {
    log_id: number
    super_admin: {
      id: number
      nome: string
    }
  }
}

export interface StopImpersonationResponse {
  token: string
  user: AuthUser
}

export async function impersonateInstituicaoUser(instituicaoId: number, userId: number) {
  const { data } = await api.post<ImpersonateResponse>(
    `/platform/instituicoes/${instituicaoId}/impersonate`,
    { user_id: userId },
  )

  return data
}

export async function stopImpersonation() {
  const { data } = await api.post<StopImpersonationResponse>('/platform/stop-impersonation')
  return data
}

export async function getPlatformConfig() {
  const { data } = await api.get<{
    default_trial_days: number
    modulos_app: Array<{ key: string; label: string; descricao: string }>
  }>('/platform/config')
  return data
}
