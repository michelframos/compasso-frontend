import api from '@/shared/lib/axios'
import type { PainelAluno } from '../types'

export async function getPainel(idAluno?: number | null) {
  const { data } = await api.get<{ data: PainelAluno }>('/aluno/me/painel', {
    params: idAluno ? { id_aluno: idAluno } : undefined,
  })
  return data.data
}
