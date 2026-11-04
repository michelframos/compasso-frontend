import api from '@/shared/lib/axios'
import type { HistoricoMatricula, MatriculaDoAluno } from '../types'

export async function listarMatriculas(idAluno?: number | null, encerradas = false) {
  const { data } = await api.get<{ data: MatriculaDoAluno[] }>('/aluno/me/matriculas', {
    params: {
      ...(idAluno ? { id_aluno: idAluno } : {}),
      ...(encerradas ? { status: 'encerradas' } : {}),
    },
  })
  return data.data
}

export async function getHistoricoMatricula(id: number | string, idAluno?: number | null) {
  const { data } = await api.get<{ data: HistoricoMatricula[] }>(`/aluno/me/matriculas/${id}/historico`, {
    params: idAluno ? { id_aluno: idAluno } : undefined,
  })
  return data.data
}
