import api from '@/shared/lib/axios'
import type { PaginatedResponse } from '../types'

export interface PlatformSolicitacao {
  id: number
  status: 'pendente' | 'aprovada' | 'rejeitada' | string
  observacao?: string | null
  aprovado_em?: string | null
  created_at?: string | null
  instituicao?: {
    id: number
    slug: string
    nome_fantasia: string
    assinatura_status?: string | null
    trial_ends_at?: string | null
  } | null
  plano?: {
    id: number
    slug: string
    nome: string
    preco: number
    limite_alunos: number | null
  } | null
  usuario?: {
    id: number
    nome: string
    email: string
  } | null
  aprovado_por?: {
    id: number
    nome: string
    email: string
  } | null
}

export interface ListSolicitacoesParams {
  page?: number
  per_page?: number
  status?: string
  search?: string
}

export async function listSolicitacoes(params: ListSolicitacoesParams = {}) {
  const { data } = await api.get<PaginatedResponse<PlatformSolicitacao>>('/platform/solicitacoes', {
    params,
  })
  return data
}

export async function aprovarSolicitacao(id: number) {
  const { data } = await api.post<{ data: PlatformSolicitacao }>(
    `/platform/solicitacoes/${id}/aprovar`,
  )
  return data.data
}

export async function rejeitarSolicitacao(id: number, observacao?: string) {
  const { data } = await api.post<{ data: PlatformSolicitacao }>(
    `/platform/solicitacoes/${id}/rejeitar`,
    { observacao },
  )
  return data.data
}
