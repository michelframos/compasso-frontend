import { useState, useCallback, useEffect, useMemo } from 'react'
import { deleteInstituicao, listInstituicoes } from '../../../api/instituicoes'
import { listPlanos } from '../../../api/planos'
import type { PaginationMeta, PlanoAssinatura, PlatformInstituicao } from '../../../types'
import { getErrorMessage } from '@/shared/lib/utils'

export const useInstituicoes = () => {
  const [instituicoes, setInstituicoes] = useState<PlatformInstituicao[]>([])
  const [planos, setPlanos] = useState<PlanoAssinatura[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [planoFilter, setPlanoFilter] = useState('')
  const [trialFilter, setTrialFilter] = useState<'all' | 'trial' | 'expirado'>('all')

  const fetchInstituicoes = useCallback(async (page = 1, search?: string, status?: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const params: Record<string, string | number> = { page, per_page: 15 }
      if (search) params.search = search
      if (status) params.status = status

      const response = await listInstituicoes(params)
      setInstituicoes(response.data)
      setPagination(response.meta)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erro ao carregar escolas'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    listPlanos({ per_page: 100, ativo: true })
      .then((res) => setPlanos(res.data))
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInstituicoes(1, searchTerm, statusFilter)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm, statusFilter, fetchInstituicoes])

  const filteredInstituicoes = useMemo(() => {
    return instituicoes.filter((item) => {
      if (planoFilter && String(item.id_plano_assinatura) !== planoFilter) return false
      if (trialFilter === 'trial' && !item.em_trial) return false
      if (trialFilter === 'expirado' && !item.trial_expirado) return false
      return true
    })
  }, [instituicoes, planoFilter, trialFilter])

  const handlePageChange = (page: number) => {
    fetchInstituicoes(page, searchTerm, statusFilter)
  }

  const removeInstituicao = async (id: number) => {
    await deleteInstituicao(id)
    setInstituicoes((prev) => prev.filter((i) => i.id !== id))
  }

  return {
    instituicoes: filteredInstituicoes,
    planos,
    pagination,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    planoFilter,
    setPlanoFilter,
    trialFilter,
    setTrialFilter,
    handlePageChange,
    removeInstituicao,
  }
}
