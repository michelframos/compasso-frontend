import api from '@/shared/lib/axios'
import type { ApresentacaoDoAluno } from '../types'

export async function listarApresentacoes(idAluno?: number | null) {
  const { data } = await api.get<{ data: ApresentacaoDoAluno[] }>('/aluno/me/apresentacoes', {
    params: idAluno ? { id_aluno: idAluno } : {},
  })
  return data.data
}
