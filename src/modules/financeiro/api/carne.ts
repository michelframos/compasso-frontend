import api from '@/shared/lib/axios'

export async function gerarCarne(payload: Record<string, unknown>) {
  const response = await api.post('/carne/gerar', payload, { responseType: 'blob' })
  return response.data as Blob
}
