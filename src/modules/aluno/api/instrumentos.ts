import api from '@/shared/lib/axios'
import type { InstrumentosDoAluno } from '../types'

export async function listarInstrumentos(idAluno?: number | null) {
  const { data } = await api.get<{ data: InstrumentosDoAluno }>('/aluno/me/instrumentos', {
    params: idAluno ? { id_aluno: idAluno } : {},
  })
  return data.data
}
