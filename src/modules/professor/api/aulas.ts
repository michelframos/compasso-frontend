import api from '@/shared/lib/axios'
import type { AulaDoProfessor, ConcluirAulaPayload } from '../types'

export async function getAula(id: number | string) {
  const { data } = await api.get<{ data: AulaDoProfessor }>(`/professor/me/aulas/${id}`)
  return data.data
}

/** Aulas agendadas do professor no período, em ordem cronológica. */
export async function listAulasAgendadas(periodo: { data_inicio: string; data_fim: string }) {
  const { data } = await api.get<{ data: AulaDoProfessor[] }>('/aulas-turmas', { params: periodo })
  return data.data
    .filter((aula) => (aula.status ?? 'agendada') === 'agendada')
    .sort((a, b) => a.data.localeCompare(b.data) || a.hora_inicio.localeCompare(b.hora_inicio))
}

export async function concluirAula(id: number | string, payload: ConcluirAulaPayload) {
  const { data } = await api.post<{ message: string; data: AulaDoProfessor }>(`/aulas-turmas/${id}/concluir`, payload)
  return data
}
