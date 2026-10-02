import api from '@/shared/lib/axios'

export type ListAulasParams = Record<string, unknown>

export async function listAulas(params: ListAulasParams = {}) {
  const { data } = await api.get('/aulas-turmas', { params })
  return data
}

export async function getAula(id: number | string) {
  const { data } = await api.get(`/aulas-turmas/${id}`)
  return data
}

export async function createAula(payload: Record<string, unknown>) {
  const { data } = await api.post('/aulas-turmas', payload)
  return data
}

export async function updateAula(id: number | string, payload: Record<string, unknown>) {
  const { data } = await api.put(`/aulas-turmas/${id}`, payload)
  return data
}

export async function deleteAula(id: number | string, config?: { data?: Record<string, unknown> }) {
  await api.delete(`/aulas-turmas/${id}`, config)
}

export async function listPresencas(aulaId: number | string) {
  const { data } = await api.get(`/aulas-turmas/${aulaId}/presencas`)
  return data
}

export async function syncPresencas(aulaId: number | string, payload: Record<string, unknown>) {
  await api.post(`/aulas-turmas/${aulaId}/presencas/sync`, payload)
}
