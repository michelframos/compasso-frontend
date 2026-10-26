import api from '@/shared/lib/axios'
import type { MaterialDoAluno } from '../types'

export async function listarMateriais(idAluno?: number | null, idTurma?: number | null) {
  const { data } = await api.get<{ data: MaterialDoAluno[] }>('/aluno/me/materiais', {
    params: {
      ...(idAluno ? { id_aluno: idAluno } : {}),
      ...(idTurma ? { id_turma: idTurma } : {}),
    },
  })
  return data.data
}
