import api from '@/shared/lib/axios'
import type { RelatorioFrequencia } from '../types'

export interface FrequenciaParams {
  data_inicio: string
  data_fim: string
  id_turma?: number
  limite_faltas?: number
}

export async function getFrequencia(params: FrequenciaParams) {
  const { data } = await api.get<RelatorioFrequencia>('/professor/me/relatorios/frequencia', { params })
  return data
}
