import api from '@/shared/lib/axios'
import type { MaterialDaTurma, MaterialPayload } from '../types'

const MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' } }

function toFormData(payload: MaterialPayload, extras: Record<string, string> = {}) {
  const form = new FormData()

  form.append('titulo', payload.titulo)
  form.append('descricao', payload.descricao ?? '')
  form.append('publico', payload.publico ? '1' : '0')

  if (payload.arquivo) {
    form.append('file', payload.arquivo)
  } else if (payload.link) {
    form.append('link', payload.link)
  }

  Object.entries(extras).forEach(([chave, valor]) => form.append(chave, valor))

  return form
}

export async function createMaterial(idTurma: number, payload: MaterialPayload) {
  const { data } = await api.post<{ data: MaterialDaTurma }>(
    '/materiais-turmas',
    toFormData(payload, { id_turma: String(idTurma) }),
    MULTIPART,
  )
  return data.data
}

/** Multipart não é aceito em PUT pelo PHP, por isso o método é simulado via `_method`. */
export async function updateMaterial(id: number, payload: MaterialPayload) {
  const { data } = await api.post<{ data: MaterialDaTurma }>(
    `/materiais-turmas/${id}`,
    toFormData(payload, { _method: 'PUT' }),
    MULTIPART,
  )
  return data.data
}

export async function deleteMaterial(id: number) {
  await api.delete(`/materiais-turmas/${id}`)
}
