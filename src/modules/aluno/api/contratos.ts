import api from '@/shared/lib/axios'
import type { ContratoDoAluno } from '../types'

export async function listarContratos(idAluno?: number | null) {
  const { data } = await api.get<{ data: ContratoDoAluno[] }>('/aluno/me/contratos', {
    params: idAluno ? { id_aluno: idAluno } : {},
  })
  return data.data
}

export async function aceitarContrato(id: number, idAluno?: number | null) {
  const { data } = await api.post<{ data: ContratoDoAluno }>(`/aluno/me/contratos/${id}/aceite`, null, {
    params: idAluno ? { id_aluno: idAluno } : {},
  })
  return data.data
}

export async function baixarContrato(id: number, idAluno?: number | null) {
  const { data } = await api.get<Blob>(`/aluno/me/contratos/${id}/pdf`, {
    params: idAluno ? { id_aluno: idAluno } : {},
    responseType: 'blob',
  })
  return data
}
