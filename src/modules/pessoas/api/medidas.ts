import api from '@/shared/lib/axios'

export interface MedidaAluno {
  id: number
  id_aluno: number
  medida_torax: number | null
  medida_cintura: number | null
  medida_quadril: number | null
  medida_altura: number | null
  ativo: boolean
  criado_em: string | null
}

export type MedidaAlunoPayload = {
  id_aluno: number
  medida_torax: number
  medida_cintura: number
  medida_quadril: number
  medida_altura: number
  ativo?: boolean
}

export async function listarMedidasDoAluno(alunoId: number | string) {
  const { data } = await api.get<MedidaAluno[]>(`/alunos/${alunoId}/medidas`)
  return data
}

export async function criarMedidaAluno(payload: MedidaAlunoPayload) {
  const { data } = await api.post<MedidaAluno>('/medidas-alunos', payload)
  return data
}

export async function atualizarMedidaAluno(
  id: number | string,
  payload: Partial<Omit<MedidaAlunoPayload, 'id_aluno'>> & { id_aluno?: number },
) {
  const { data } = await api.put<MedidaAluno>(`/medidas-alunos/${id}`, payload)
  return data
}
