import api from '@/shared/lib/axios'

export async function listResponsaveis() {
  const { data } = await api.get('/responsaveis')
  return data
}
