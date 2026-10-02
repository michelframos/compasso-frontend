import api from '@/shared/lib/axios'
import type { Usuario } from '../store/useUsuariosStore'

export type UsersListParams = {
  page?: number
  search?: string
  roles?: string
}

export async function listUsers(params: UsersListParams = {}) {
  const { data } = await api.get('/users', { params })
  return data as { data: Usuario[]; meta: Record<string, unknown> }
}

export async function createUser(payload: Record<string, unknown>) {
  const { data } = await api.post('/users', payload)
  return (data.data || data) as Usuario
}

export async function updateUser(id: number, payload: Record<string, unknown>) {
  const { data } = await api.put(`/users/${id}`, payload)
  return (data.data || data) as Usuario
}

export async function deleteUser(id: number) {
  await api.delete(`/users/${id}`)
}
