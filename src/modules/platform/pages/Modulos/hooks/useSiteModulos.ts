import { useState, useCallback, useEffect } from 'react'
import {
  aprovarSiteModulo,
  deleteSiteModulo,
  listSiteModulos,
  ocultarSiteModulo,
} from '../../../api/modulos'
import type { PaginationMeta, SiteModulo } from '../../../types'
import { getErrorMessage } from '@/shared/lib/utils'

export const useSiteModulos = () => {
  const [modulos, setModulos] = useState<SiteModulo[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [aprovadoFilter, setAprovadoFilter] = useState<'all' | 'true' | 'false'>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const fetchModulos = useCallback(async (page = 1, search?: string, aprovado?: 'all' | 'true' | 'false') => {
    try {
      setIsLoading(true)
      setError(null)

      const params: Record<string, string | number | boolean> = { page, per_page: 15 }
      if (search) params.search = search
      if (aprovado === 'true') params.aprovado = true
      if (aprovado === 'false') params.aprovado = false

      const response = await listSiteModulos(params)
      setModulos(response.data)
      setPagination(response.meta)
      setCurrentPage(response.meta.current_page)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erro ao carregar módulos'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchModulos(1, searchTerm, aprovadoFilter)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm, aprovadoFilter, fetchModulos])

  const handlePageChange = (page: number) => {
    fetchModulos(page, searchTerm, aprovadoFilter)
  }

  const removeModulo = async (id: number) => {
    await deleteSiteModulo(id)
    setModulos((prev) => prev.filter((item) => item.id !== id))
  }

  const aprovar = async (id: number) => {
    const updated = await aprovarSiteModulo(id)
    setModulos((prev) => prev.map((item) => (item.id === id ? updated : item)))
  }

  const ocultar = async (id: number) => {
    const updated = await ocultarSiteModulo(id)
    setModulos((prev) => prev.map((item) => (item.id === id ? updated : item)))
  }

  return {
    modulos,
    pagination,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    aprovadoFilter,
    setAprovadoFilter,
    currentPage,
    handlePageChange,
    removeModulo,
    aprovar,
    ocultar,
  }
}
