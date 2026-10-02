import api from '@/shared/lib/axios'
import type { Conta, PaginatedResponse, ContaPagamento } from '../pages/Financeiro/types'

export type ListContasParams = Record<string, unknown>

export async function listContas(params: ListContasParams = {}) {
  const { data } = await api.get<PaginatedResponse<Conta>>('/contas', { params })
  return data
}

export async function getConta(id: number | string) {
  const { data } = await api.get(`/contas/${id}`)
  return data
}

export async function createConta(payload: Record<string, unknown>) {
  const { data } = await api.post('/contas', payload)
  return data
}

export async function updateConta(id: number | string, payload: Record<string, unknown>) {
  const { data } = await api.put(`/contas/${id}`, payload)
  return data
}

export async function deleteConta(id: number | string) {
  await api.delete(`/contas/${id}`)
}

export async function listPagamentos(contaId: number | string) {
  const { data } = await api.get<ContaPagamento[]>(`/contas/${contaId}/pagamentos`)
  return data
}

export async function createPagamento(contaId: number | string, payload: Record<string, unknown>) {
  const { data } = await api.post(`/contas/${contaId}/pagamentos`, payload)
  return data
}

export async function createPagamentosLote(payload: Record<string, unknown>) {
  const { data } = await api.post('/contas/pagamentos/lote', payload)
  return data
}

export async function deletePagamento(pagamentoId: number | string) {
  await api.delete(`/pagamentos/${pagamentoId}`)
}
