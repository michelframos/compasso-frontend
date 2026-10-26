import api from '@/shared/lib/axios'

export type StatusJustificativa = 'pendente' | 'aceita' | 'recusada'

export interface JustificativaFalta {
  id: number
  tipo: 'aviso_previo' | 'justificativa'
  motivo: string
  status: StatusJustificativa
  anexo_url: string | null
  aluno: { id: number; nome: string | null }
  aula: {
    id: number
    data: string
    hora_inicio: string
    hora_termino: string
    turma: string | null
  } | null
}

export async function listarJustificativasFaltas(status: StatusJustificativa) {
  const { data } = await api.get<{ data: JustificativaFalta[] }>('/justificativas-faltas', { params: { status } })
  return data.data
}

export async function decidirJustificativa(id: number, decisao: 'aceita' | 'recusada') {
  const { data } = await api.post<{ data: JustificativaFalta }>(`/justificativas-faltas/${id}/decisao`, { decisao })
  return data.data
}
