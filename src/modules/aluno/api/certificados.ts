import api from '@/shared/lib/axios'
import type { CertificadoDoAluno } from '../types'

export async function listarCertificados(idAluno?: number | null) {
  const { data } = await api.get<{ data: CertificadoDoAluno[] }>('/aluno/me/certificados', {
    params: idAluno ? { id_aluno: idAluno } : {},
  })
  return data.data
}

export async function baixarCertificado(id: number, idAluno?: number | null) {
  const { data } = await api.get<Blob>(`/aluno/me/certificados/${id}/pdf`, {
    params: idAluno ? { id_aluno: idAluno } : {},
    responseType: 'blob',
  })
  return data
}
