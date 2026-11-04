import api from '@/shared/lib/axios'
import type { JustificativaDoAluno } from '../types'

export async function listarJustificativas(idAluno?: number | null) {
  const { data } = await api.get<{ data: JustificativaDoAluno[] }>('/aluno/me/justificativas', {
    params: idAluno ? { id_aluno: idAluno } : {},
  })
  return data.data
}

export async function registrarJustificativa(payload: {
  idAula: number
  tipo: 'aviso_previo' | 'justificativa'
  motivo: string
  anexo: File | null
  idAluno?: number | null
}) {
  const form = new FormData()
  form.append('id_aula_turma', String(payload.idAula))
  form.append('tipo', payload.tipo)
  form.append('motivo', payload.motivo)
  if (payload.anexo) form.append('anexo', payload.anexo)
  if (payload.idAluno) form.append('id_aluno', String(payload.idAluno))

  const { data } = await api.post<{ data: JustificativaDoAluno }>('/aluno/me/justificativas', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}
