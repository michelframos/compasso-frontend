import { useCallback, useEffect, useState } from 'react'
import { listInstituicaoUsuarios } from '../../../api/instituicoes'
import type { PaginationMeta, PlatformInstituicaoUsuario } from '../../../types'
import { getErrorMessage } from '@/shared/lib/utils'

export const useInstituicaoUsuarios = (instituicaoId?: number) => {
  const [usuarios, setUsuarios] = useState<PlatformInstituicaoUsuario[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchUsuarios = useCallback(async (page = 1, search?: string) => {
    if (!instituicaoId) return

    try {
      setIsLoading(true)
      setError(null)
      const response = await listInstituicaoUsuarios(instituicaoId, {
        page,
        per_page: 15,
        search,
      })
      setUsuarios(response.data)
      setPagination(response.meta)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erro ao carregar usuários'))
    } finally {
      setIsLoading(false)
    }
  }, [instituicaoId])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsuarios(1, searchTerm)
    }, 400)
    return () => clearTimeout(timer)
  }, [instituicaoId, searchTerm, fetchUsuarios])

  const handlePageChange = (page: number) => {
    fetchUsuarios(page, searchTerm)
  }

  return {
    usuarios,
    pagination,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    handlePageChange,
    fetchUsuarios,
  }
}
