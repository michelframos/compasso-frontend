import api from '@/shared/lib/axios'

export async function listResponsaveis() {
  const { data } = await api.get('/responsaveis')
  return data
}

export async function enviarAcessoResponsavel(id: number | string) {
  const { data } = await api.post<{ message: string }>(`/responsaveis/${id}/enviar-acesso`)
  return data
}
