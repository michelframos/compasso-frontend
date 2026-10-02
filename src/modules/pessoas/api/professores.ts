import api from '@/shared/lib/axios'

export type Professor = {
  id: number
  id_usuario: number
  comissao?: number
  salario_fixo?: number
  valor_hora_aula?: number
  observacoes?: string | null
  usuario?: {
    id: number
    nome: string
    email: string
    cpf?: string
    telefone?: string | null
    whatsapp?: string | null
    role?: string
  }
  turmas?: unknown[]
}

export type ProfessoresPaginated = {
  data: Professor[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export async function listProfessores(params: Record<string, unknown> = {}) {
  const { data } = await api.get<ProfessoresPaginated>('/professores', { params })
  return data
}

export async function getProfessor(id: number | string) {
  const { data } = await api.get<Professor>(`/professores/${id}`)
  return data
}

export async function createProfessor(payload: Record<string, unknown>) {
  const { data } = await api.post<Professor>('/professores', payload)
  return data
}

export async function updateProfessor(id: number | string, payload: Record<string, unknown>) {
  const { data } = await api.put<Professor>(`/professores/${id}`, payload)
  return data
}

export async function deleteProfessor(id: number | string) {
  await api.delete(`/professores/${id}`)
}
