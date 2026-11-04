import api from '@/shared/lib/axios'
import type { AlunoAutenticado } from '../types'

export async function getAlunoAutenticado(idAluno?: number | null) {
  const { data } = await api.get<{ data: AlunoAutenticado }>('/aluno/me', {
    params: idAluno ? { id_aluno: idAluno } : undefined,
  })
  return data.data
}
