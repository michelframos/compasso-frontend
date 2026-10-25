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

export interface PlatformConfiguracoes {
  default_trial_days: number
  email_cadastro_assunto: string
  email_cadastro_corpo: string
  variaveis_email: Array<{ chave: string; descricao: string }>
}

export type PlatformConfiguracoesPayload = Partial<
  Pick<PlatformConfiguracoes, 'default_trial_days' | 'email_cadastro_assunto' | 'email_cadastro_corpo'>
>

export async function getConfiguracoes() {
  const { data } = await api.get<PlatformConfiguracoes>('/platform/configuracoes')
  return data
}

export async function updateConfiguracoes(payload: PlatformConfiguracoesPayload) {
  const { data } = await api.put<PlatformConfiguracoes>('/platform/configuracoes', payload)
  return data
}

export async function getPlatformConfig() {
  const { data } = await api.get<{
    default_trial_days: number
    modulos_app: Array<{ key: string; label: string; descricao: string }>
  }>('/platform/config')
  return data
}
