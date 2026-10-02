import { useCallback } from 'react'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import { getErrorMessage } from '@/shared/lib/utils'
import { useUsuariosStore } from '@/modules/core/store/useUsuariosStore'
import { createUser, deleteUser, listUsers, updateUser } from '@/modules/core/api/users'

export type UsuarioSubmitResult =
  | { success: true }
  | { success: false; message: string; errors?: Record<string, string[]> }

const buildErrorResult = (error: unknown, fallbackMessage: string): UsuarioSubmitResult => {
  const message = getErrorMessage(error, fallbackMessage)
  const errors = (error as AxiosError<{ errors?: Record<string, string[]> }>)?.response?.data?.errors
  toast.error(message)
  return { success: false, message, errors }
}

export const useUsuarios = () => {
  const usuarios = useUsuariosStore((state) => state.usuarios)
  const isLoading = useUsuariosStore((state) => state.isLoading)
  const currentPage = useUsuariosStore((state) => state.currentPage)
  const lastPage = useUsuariosStore((state) => state.lastPage)
  const total = useUsuariosStore((state) => state.total)
  const setUsuariosData = useUsuariosStore((state) => state.setUsuariosData)
  const setIsLoading = useUsuariosStore((state) => state.setIsLoading)
  const addUsuarioStore = useUsuariosStore((state) => state.addUsuario)
  const updateUsuarioStore = useUsuariosStore((state) => state.updateUsuario)
  const removeUsuarioStore = useUsuariosStore((state) => state.removeUsuario)

  const fetchUsuarios = useCallback(async (page: number = 1, search: string = '', roles: string[] = []) => {
    try {
      setIsLoading(true)
      const params: { page: number; search?: string; roles?: string } = { page }
      if (search) params.search = search
      if (roles.length > 0) params.roles = roles.join(',')

      const response = await listUsers(params)
      setUsuariosData(response.data || [], response.meta || {})
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      toast.error(getErrorMessage(error, 'Erro de conexão ao buscar usuários.'))
    } finally {
      setIsLoading(false)
    }
  }, [setIsLoading, setUsuariosData])

  const addUsuario = useCallback(async (data: Record<string, unknown>): Promise<UsuarioSubmitResult> => {
    try {
      const usuario = await createUser(data)
      addUsuarioStore(usuario)
      toast.success('Usuário cadastrado com sucesso.')
      return { success: true }
    } catch (error: unknown) {
      console.error('Erro ao cadastrar usuário:', error)
      return buildErrorResult(error, 'Erro ao cadastrar usuário.')
    }
  }, [addUsuarioStore])

  const updateUsuario = useCallback(async (id: number, data: Record<string, unknown>): Promise<UsuarioSubmitResult> => {
    try {
      const usuario = await updateUser(id, data)
      updateUsuarioStore(usuario)
      toast.success('Usuário atualizado com sucesso.')
      return { success: true }
    } catch (error: unknown) {
      console.error('Erro ao atualizar usuário:', error)
      return buildErrorResult(error, 'Erro ao atualizar usuário.')
    }
  }, [updateUsuarioStore])

  const removeUsuario = useCallback(async (id: number) => {
    try {
      await deleteUser(id)
      removeUsuarioStore(id)
      toast.success('Usuário excluído com sucesso.')
      return true
    } catch (error: unknown) {
      console.error('Erro ao excluir usuário:', error)
      toast.error(getErrorMessage(error, 'Erro ao excluir usuário.'))
      return false
    }
  }, [removeUsuarioStore])

  return {
    usuarios,
    isLoading,
    currentPage,
    lastPage,
    total,
    fetchUsuarios,
    addUsuario,
    updateUsuario,
    removeUsuario,
  }
}
