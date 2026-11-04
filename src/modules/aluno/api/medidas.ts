import api from '@/shared/lib/axios'
import type { MedidaDoAluno, MedidasDoAluno } from '../types'

export async function listarMedidas(idAluno?: number | null) {
  const { data } = await api.get<MedidasDoAluno>('/aluno/me/medidas', {
    params: idAluno ? { id_aluno: idAluno } : {},
  })
  return data
}

export async function atualizarMedida(
  id: number,
  payload: Pick<MedidaDoAluno, 'medida_torax' | 'medida_cintura' | 'medida_quadril' | 'medida_altura'>,
  idAluno?: number | null,
) {
  const { data } = await api.put<{ data: MedidaDoAluno }>(`/aluno/me/medidas/${id}`, payload, {
    params: idAluno ? { id_aluno: idAluno } : {},
  })
  return data.data
}
