import api from '@/shared/lib/axios'
import type { Dependente } from '../types'

export async function listarDependentes() {
  const { data } = await api.get<{ data: Dependente[] }>('/aluno/me/dependentes')
  return data.data
}
