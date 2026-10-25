import api from '@/shared/lib/axios'
import type { ExtratoProfessor, FechamentoRemuneracao, ResumoRemuneracao, SituacaoExtrato } from '@/modules/professor'

export interface RemuneracaoProfessorLinha {
  professor: { id: number; nome: string | null }
  situacao: SituacaoExtrato
  resumo: ResumoRemuneracao
  fechamento: FechamentoRemuneracao | null
}

export interface RemuneracaoMes {
  data: RemuneracaoProfessorLinha[]
  competencia: string
  total: number
}

/** `mes` no formato `yyyy-MM`. */
export async function getRemuneracaoMes(mes: string) {
  const { data } = await api.get<RemuneracaoMes>('/relatorios/professores/remuneracao', { params: { mes } })
  return data
}

export async function getExtratoProfessor(idProfessor: number | string, mes: string) {
  const { data } = await api.get<{ data: ExtratoProfessor }>(`/relatorios/professores/${idProfessor}/extrato`, { params: { mes } })
  return data.data
}

export async function fecharMesProfessor(idProfessor: number | string, payload: { mes: string; data_vencimento: string | null }) {
  const { data } = await api.post<{ data: ExtratoProfessor }>(`/relatorios/professores/${idProfessor}/fechamentos`, payload)
  return data.data
}

export async function reabrirMesProfessor(idProfessor: number | string, idFechamento: number) {
  await api.delete(`/relatorios/professores/${idProfessor}/fechamentos/${idFechamento}`)
}
