import api from '@/shared/lib/axios'

export type Estado = {
  id: number
  nome: string
  sigla: string
}

export type Cidade = {
  id: number
  nome: string
  id_estado: number
}

export type EnderecoCep = {
  cep: string
  logradouro: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  uf: string | null
  codigo_ibge: number | null
  id_estado: number | null
  id_cidade: number | null
}

export async function buscarEnderecoPorCep(cep: string) {
  const { data } = await api.get<{ data: EnderecoCep }>(`/cep/${cep.replace(/\D/g, '')}`)
  return data.data
}

export async function listEstados() {
  const { data } = await api.get<Estado[]>('/estados')
  return data
}

export async function listCidades(estadoId: number | string) {
  const { data } = await api.get<Cidade[]>(`/estados/${estadoId}/cidades`)
  return data
}
