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

export async function listarCertificadosStaff() {
  const { data } = await api.get<{ data: CertificadoStaff[] }>('/certificados')
  return data.data
}

export async function emitirCertificado(idMatricula: number) {
  const { data } = await api.post<{ data: CertificadoStaff }>(`/matriculas/${idMatricula}/certificados`)
  return data.data
}
