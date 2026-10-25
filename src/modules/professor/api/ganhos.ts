import api from '@/shared/lib/axios'
import type { ExtratoProfessor } from '../types'

/** `mes` no formato `yyyy-MM`. */
export async function getMeuExtrato(mes: string) {
  const { data } = await api.get<{ data: ExtratoProfessor }>('/professor/me/extrato', { params: { mes } })
  return data.data
}
