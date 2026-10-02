import { useState, useCallback, useEffect } from 'react'
import {
  aprovarDepoimento,
  deleteDepoimento,
  listDepoimentos,
  ocultarDepoimento,
} from '../../../api/depoimentos'
import type { Depoimento, PaginationMeta } from '../../../types'
import { getErrorMessage } from '@/shared/lib/utils'

export const useDepoimentos = () => {
  const [depoimentos, setDepoimentos] = useState<Depoimento[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [aprovadoFilter, setAprovadoFilter] = useState<'all' | 'true' | 'false'>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const fetchDepoimentos = useCallback(async (page = 1, search?: string, aprovado?: 'all' | 'true' | 'false') => {
    try {
      setIsLoading(true)
      setError(null)

      const params: Record<string, string | number | boolean> = { page, per_page: 15 }
      if (search) params.search = search
      if (aprovado === 'true') params.aprovado = true
      if (aprovado === 'false') params.aprovado = false

      const response = await listDepoimentos(params)
      setDepoimentos(response.data)
      setPagination(response.meta)
      setCurrentPage(response.meta.current_page)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erro ao carregar depoimentos'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDepoimentos(1, searchTerm, aprovadoFilter)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm, aprovadoFilter, fetchDepoimentos])

  const handlePageChange = (page: number) => {
    fetchDepoimentos(page, searchTerm, aprovadoFilter)
  }

  const removeDepoimento = async (id: number) => {
    await deleteDepoimento(id)
    setDepoimentos((prev) => prev.filter((item) => item.id !== id))
  }

  const aprovar = async (id: number) => {
    const updated = await aprovarDepoimento(id)
    setDepoimentos((prev) => prev.map((item) => (item.id === id ? updated : item)))
  }

  const ocultar = async (id: number) => {
    const updated = await ocultarDepoimento(id)
    setDepoimentos((prev) => prev.map((item) => (item.id === id ? updated : item)))
  }

  return {
    depoimentos,
    pagination,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    aprovadoFilter,
    setAprovadoFilter,
    currentPage,
    fetchDepoimentos,
    handlePageChange,
    removeDepoimento,
    aprovar,
    ocultar,
  }
}
