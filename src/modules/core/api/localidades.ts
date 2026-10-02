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

export async function listEstados() {
  const { data } = await api.get<Estado[]>('/estados')
  return data
}

export async function listCidades(estadoId: number | string) {
  const { data } = await api.get<Cidade[]>(`/estados/${estadoId}/cidades`)
  return data
}
