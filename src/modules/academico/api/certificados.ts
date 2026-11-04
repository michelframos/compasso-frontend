import api from '@/shared/lib/axios'

export interface CertificadoStaff {
  id: number
  codigo_verificacao: string
  emitido_em: string | null
  carga_horaria: number | null
  id_matricula: number
  aluno: { id: number; nome: string | null } | null
  curso: string | null
  turma: string | null
  nivel: string | null
}

export interface MatriculaElegivelCertificado {
  id: number
  aluno: { id: number; nome: string | null } | null
  curso: string | null
  turma: string | null
  nivel: string | null
  frequencia_percentual: number
  frequencia_minima: number
  carga_horaria: number
}

export interface ResultadoEmissaoLote {
  emitidos: CertificadoStaff[]
  falhas: Array<{ id_matricula: number; mensagem: string }>
}

export async function listarCertificadosStaff() {
  const { data } = await api.get<{ data: CertificadoStaff[] }>('/certificados')
  return data.data
}

export async function listarElegiveisCertificado() {
  const { data } = await api.get<{ data: MatriculaElegivelCertificado[] }>('/certificados/elegiveis')
  return data.data
}

export async function emitirCertificado(idMatricula: number) {
  const { data } = await api.post<{ data: CertificadoStaff }>(`/matriculas/${idMatricula}/certificados`)
  return data.data
}

export async function emitirCertificadosLote(matriculaIds: number[]) {
  const { data } = await api.post<{ data: ResultadoEmissaoLote }>('/certificados/emitir-lote', {
    matricula_ids: matriculaIds,
  })
  return data.data
}

export async function baixarPdfCertificadoStaff(id: number) {
  const { data } = await api.get<Blob>(`/certificados/${id}/pdf`, {
    responseType: 'blob',
  })
  return data
}
