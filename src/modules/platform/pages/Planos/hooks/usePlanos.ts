import { useState, useCallback, useEffect } from 'react'
import { deletePlano, listPlanos } from '../../../api/planos'
import type { PaginationMeta, PlanoAssinatura } from '../../../types'
import { getErrorMessage } from '@/shared/lib/utils'

export const usePlanos = () => {
  const [planos, setPlanos] = useState<PlanoAssinatura[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [ativoFilter, setAtivoFilter] = useState<'all' | 'true' | 'false'>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const fetchPlanos = useCallback(async (page = 1, search?: string, ativo?: 'all' | 'true' | 'false') => {
    try {
      setIsLoading(true)
      setError(null)

      const params: Record<string, string | number | boolean> = { page, per_page: 15 }
      if (search) params.search = search
      if (ativo === 'true') params.ativo = true
      if (ativo === 'false') params.ativo = false

      const response = await listPlanos(params)
      setPlanos(response.data)
      setPagination(response.meta)
      setCurrentPage(response.meta.current_page)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erro ao carregar planos'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPlanos(1, searchTerm, ativoFilter)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm, ativoFilter, fetchPlanos])

  const handlePageChange = (page: number) => {
    fetchPlanos(page, searchTerm, ativoFilter)
  }

  const removePlano = async (id: number) => {
    await deletePlano(id)
    setPlanos((prev) => prev.filter((p) => p.id !== id))
  }

  return {
    planos,
    pagination,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    ativoFilter,
    setAtivoFilter,
    currentPage,
    fetchPlanos,
    handlePageChange,
    removePlano,
  }
}
