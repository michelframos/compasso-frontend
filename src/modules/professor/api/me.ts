import api from '@/shared/lib/axios'
import type { ProfessorAutenticado } from '../types'

export async function getProfessorAutenticado() {
  const { data } = await api.get<{ data: ProfessorAutenticado }>('/professor/me')
  return data.data
}
