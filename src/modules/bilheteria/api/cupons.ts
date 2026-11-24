import api from '@/shared/lib/axios'
import type { CupomIngresso } from '../types'

export async function listarCupons(params?: { id_espetaculo?: number; search?: string }) {
  const { data } = await api.get('/cupons-ingresso', { params })
  return data as { data: CupomIngresso[] }
}

export async function criarCupom(payload: Partial<CupomIngresso>) {
  const { data } = await api.post('/cupons-ingresso', payload)
  return data as { data: CupomIngresso }
}

export async function atualizarCupom(id: number, payload: Partial<CupomIngresso>) {
  const { data } = await api.put(`/cupons-ingresso/${id}`, payload)
  return data as { data: CupomIngresso }
}

export async function excluirCupom(id: number) {
  await api.delete(`/cupons-ingresso/${id}`)
}
