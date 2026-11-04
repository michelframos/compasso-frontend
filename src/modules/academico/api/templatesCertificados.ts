import api from '@/shared/lib/axios'
import type { LayoutCertificado } from '../types/layoutCertificado'

export interface TemplateCertificado {
  id: number
  nome: string
  conteudo: string
  layout?: LayoutCertificado
  fundo_path: string | null
  fundo_url: string | null
  created_at?: string | null
  updated_at?: string | null
}

export async function listarTemplatesCertificados(search = '') {
  const { data } = await api.get<{ data: TemplateCertificado[] }>('/templates-certificados', {
    params: { search: search || undefined, per_page: 100, sort_by: 'nome', sort_order: 'asc' },
  })
  return data.data
}

export async function obterTemplateCertificado(id: number | string) {
  const { data } = await api.get<{ data: TemplateCertificado }>(`/templates-certificados/${id}`)
  return data.data
}

export async function criarTemplateCertificado(payload: { nome: string; conteudo: string }) {
  const { data } = await api.post<{ data: TemplateCertificado }>('/templates-certificados', payload)
  return data.data
}

export async function atualizarTemplateCertificado(
  id: number,
  payload: { nome: string; conteudo: string },
) {
  const { data } = await api.put<{ data: TemplateCertificado }>(`/templates-certificados/${id}`, payload)
  return data.data
}

export async function excluirTemplateCertificado(id: number) {
  await api.delete(`/templates-certificados/${id}`)
}

export async function enviarFundoTemplateCertificado(id: number, arquivo: File) {
  const form = new FormData()
  form.append('fundo', arquivo)
  const { data } = await api.post<{ data: TemplateCertificado }>(
    `/templates-certificados/${id}/fundo`,
    form,
  )
  return data.data
}

export async function removerFundoTemplateCertificado(id: number) {
  const { data } = await api.delete<{ data: TemplateCertificado }>(`/templates-certificados/${id}/fundo`)
  return data.data
}

export async function enviarElementoTemplateCertificado(id: number, arquivo: File) {
  const form = new FormData()
  form.append('imagem', arquivo)
  const { data } = await api.post<{ data: { src: string; url: string } }>(
    `/templates-certificados/${id}/elementos`,
    form,
  )
  return data.data
}
