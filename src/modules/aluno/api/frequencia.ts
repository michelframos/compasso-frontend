import api from '@/shared/lib/axios'
import type { FrequenciaAluno } from '../types'

export async function getFrequencia(idAluno?: number | null, idMatricula?: number | null) {
  const { data } = await api.get<{ data: FrequenciaAluno }>('/aluno/me/frequencia', {
    params: {
      ...(idAluno ? { id_aluno: idAluno } : {}),
      ...(idMatricula ? { id_matricula: idMatricula } : {}),
    },
  })
  return data.data
}
