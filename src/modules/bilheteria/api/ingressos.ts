import api from '@/shared/lib/axios'
import type { Ingresso, RelatorioIngressos } from '../types'

export async function listarIngressos(params?: {
  id_espetaculo?: number
  status?: string
  status_pagamento?: string
  search?: string
  page?: number
  per_page?: number
}) {
  const { data } = await api.get('/ingressos', { params })
  return data as { data: Ingresso[]; meta?: unknown }
}

export async function gerarIngressos(
  idEspetaculo: number,
  payload: { quantidade: number; valor?: number; id_template_ingresso?: number },
) {
  const { data } = await api.post(`/espetaculos/${idEspetaculo}/ingressos/gerar`, payload)
  return data as { data: Ingresso[] }
}

export async function venderIngresso(
  id: number,
  payload: {
    comprador_nome?: string
    comprador_documento?: string
    cupom?: string
    data_vencimento?: string
  },
) {
  const { data } = await api.post(`/ingressos/${id}/vender`, payload)
  return data as { data: Ingresso }
}

export async function marcarCortesia(id: number, payload?: { comprador_nome?: string }) {
  const { data } = await api.post(`/ingressos/${id}/cortesia`, payload ?? {})
  return data as { data: Ingresso }
}

export async function cancelarVendaIngresso(id: number) {
  const { data } = await api.post(`/ingressos/${id}/cancelar-venda`)
  return data as { data: Ingresso }
}

export async function validarIngresso(payload: { numero?: string; codigo_qr?: string }) {
  const { data } = await api.post('/ingressos/validar', payload)
  return data as { ok: boolean; motivo?: string | null; data?: Ingresso | null }
}

export async function utilizarIngresso(payload: { numero?: string; codigo_qr?: string }) {
  const { data } = await api.post('/ingressos/utilizar', payload)
  return data as { ok: boolean; motivo?: string | null; message?: string; data?: Ingresso | null }
}

export async function relatorioIngressos(idEspetaculo: number) {
  const { data } = await api.get('/ingressos/relatorio', { params: { id_espetaculo: idEspetaculo } })
  return data as { data: RelatorioIngressos }
}
