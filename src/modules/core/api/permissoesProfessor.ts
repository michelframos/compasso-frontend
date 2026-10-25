import api from '@/shared/lib/axios'
import type { PermissoesProfessorAulas } from '../types'

export async function getPermissoesProfessor() {
  const { data } = await api.get<{ data: PermissoesProfessorAulas }>('/instituicao/permissoes-professor')
  return data.data
}

export async function salvarPermissoesProfessor(permissoes: PermissoesProfessorAulas) {
  const { data } = await api.put<{ data: PermissoesProfessorAulas }>('/instituicao/permissoes-professor', permissoes)
  return data.data
}
