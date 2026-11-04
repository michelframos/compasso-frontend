import api from '@/shared/lib/axios'
import type { AgendaAluno } from '../types'

export async function getAgenda(inicio: string, fim: string, idAluno?: number | null) {
  const { data } = await api.get<{ data: AgendaAluno }>('/aluno/me/agenda', {
    params: {
      inicio,
      fim,
      ...(idAluno ? { id_aluno: idAluno } : {}),
    },
  })
  return data.data
}
