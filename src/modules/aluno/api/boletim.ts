import api from '@/shared/lib/axios'
import type { BoletimAluno } from '../types'

export async function getBoletim(idAluno?: number | null, idMatricula?: number | null) {
  const { data } = await api.get<{ data: BoletimAluno }>('/aluno/me/boletim', {
    params: {
      ...(idAluno ? { id_aluno: idAluno } : {}),
      ...(idMatricula ? { id_matricula: idMatricula } : {}),
    },
  })
  return data.data
}
