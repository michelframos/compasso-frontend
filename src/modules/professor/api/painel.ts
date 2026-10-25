import api from '@/shared/lib/axios'
import type { PainelProfessor } from '../types'

export async function getPainel() {
  const { data } = await api.get<{ data: PainelProfessor }>('/professor/me/painel')
  return data.data
}
