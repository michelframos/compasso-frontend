import api from '@/shared/lib/axios'
import type { ContratoDoAluno, TipoContratoDoAluno } from '../types'

export async function listarContratos(idAluno?: number | null) {
  const { data } = await api.get<{ data: ContratoDoAluno[] }>('/aluno/me/contratos', {
    params: idAluno ? { id_aluno: idAluno } : {},
  })
  return data.data
}

export async function baixarContrato(
  tipo: TipoContratoDoAluno,
  id: number,
  idAluno?: number | null,
) {
  const { data } = await api.get<Blob>(`/aluno/me/contratos/${tipo}/${id}/pdf`, {
    params: idAluno ? { id_aluno: idAluno } : {},
    responseType: 'blob',
  })
  return data
}
