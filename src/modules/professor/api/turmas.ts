import api from '@/shared/lib/axios'
import type { DiarioTurma, MaterialDaTurma, SituacaoTurma, TurmaDoProfessor } from '../types'

export interface ListMinhasTurmasParams {
  situacao?: SituacaoTurma
  search?: string
}

export async function listMinhasTurmas(params: ListMinhasTurmasParams = {}) {
  const { data } = await api.get<{ data: TurmaDoProfessor[] }>('/professor/me/turmas', {
    params: { ...params, search: params.search || undefined },
  })
  return data.data
}

export async function getMinhaTurma(id: number | string) {
  const { data } = await api.get<{ data: TurmaDoProfessor }>(`/professor/me/turmas/${id}`)
  return data.data
}

export async function getDiario(id: number | string, periodo: { data_inicio: string; data_fim: string }) {
  const { data } = await api.get<{ data: DiarioTurma }>(`/professor/me/turmas/${id}/diario`, { params: periodo })
  return data.data
}

export async function listMateriaisDaTurma(id: number | string) {
  const { data } = await api.get<{ data: MaterialDaTurma[] }>(`/turmas/${id}/materiais`)
  return data.data
}
