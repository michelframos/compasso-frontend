import api from '@/shared/lib/axios'
import type { PaginatedResponse } from '../pages/Cursos/types'
import type {
  DecisaoProgressaoPayload,
  FiltroStatusProgressao,
  SugestaoProgressao,
} from '../pages/Progressoes/types'

export type ListProgressoesParams = {
  page?: number
  status?: FiltroStatusProgressao
  search?: string
}

export async function listProgressoes(params: ListProgressoesParams = {}) {
  const { data } = await api.get<PaginatedResponse<SugestaoProgressao>>('/progressoes', { params })
  return data
}

export async function decidirProgressao(id: number, payload: DecisaoProgressaoPayload) {
  const { data } = await api.post<{ data: SugestaoProgressao }>(`/progressoes/${id}/decisao`, payload)
  return data.data
}
