import api from '@/shared/lib/axios'
import type { TemplateIngresso } from '../types'

export async function listarTemplatesIngresso(params?: { search?: string }) {
  const { data } = await api.get('/templates-ingressos', { params })
  return data as { data: TemplateIngresso[] }
}

export async function obterTemplateIngresso(id: number) {
  const { data } = await api.get(`/templates-ingressos/${id}`)
  return data as { data: TemplateIngresso }
}

export async function criarTemplateIngresso(payload: {
  nome: string
  largura: number
  altura: number
  unidade: 'px' | 'cm'
  conteudo?: string
}) {
  const { data } = await api.post('/templates-ingressos', payload)
  return data as { data: TemplateIngresso }
}

export async function atualizarTemplateIngresso(
  id: number,
  payload: Partial<{
    nome: string
    largura: number
    altura: number
    unidade: 'px' | 'cm'
    conteudo: string
  }>,
) {
  const { data } = await api.put(`/templates-ingressos/${id}`, payload)
  return data as { data: TemplateIngresso }
}

export async function excluirTemplateIngresso(id: number) {
  await api.delete(`/templates-ingressos/${id}`)
}

export async function uploadFundoTemplateIngresso(id: number, arquivo: File) {
  const form = new FormData()
  form.append('fundo', arquivo)
  const { data } = await api.post(`/templates-ingressos/${id}/fundo`, form)
  return data as { data: TemplateIngresso }
}

export async function uploadElementoTemplateIngresso(id: number, arquivo: File) {
  const form = new FormData()
  form.append('imagem', arquivo)
  const { data } = await api.post(`/templates-ingressos/${id}/elementos`, form)
  return data as { data: { src: string; url: string } }
}
