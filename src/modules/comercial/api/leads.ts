import api from '@/shared/lib/axios'
import type { Lead } from '../pages/Leads/hooks/useLeads'

export type ListLeadsParams = {
  page?: number
  search?: string
  status?: string
}

export async function listLeads(params: ListLeadsParams = {}) {
  const { data } = await api.get('/leads', { params })
  return data as {
    data: Lead[]
    meta: { current_page: number; last_page: number; total: number }
  }
}

export async function getLead(id: number | string) {
  const { data } = await api.get(`/leads/${id}`)
  return data
}

export async function createLead(payload: Record<string, unknown>) {
  const { data } = await api.post('/leads', payload)
  return data as Lead
}

export async function updateLead(id: number | string, payload: Record<string, unknown>) {
  const { data } = await api.put(`/leads/${id}`, payload)
  return data as Lead
}

export async function deleteLead(id: number | string) {
  await api.delete(`/leads/${id}`)
}

export async function createPublicLead(payload: {
  nome: string
  email?: string | null
  telefone?: string | null
  observacoes?: string | null
}) {
  const { data } = await api.post('/leads/public', payload)
  return data
}
