import { useCallback, useEffect, useState } from 'react'
import {
  aprovarSolicitacao,
  listSolicitacoes,
  rejeitarSolicitacao,
  type PlatformSolicitacao,
} from '@/modules/platform/api/solicitacoes'
import type { PaginationMeta } from '@/modules/platform/types'
import { getErrorMessage } from '@/shared/lib/utils'
import { toast } from 'sonner'

export function useSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<PlatformSolicitacao[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('pendente')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [actionId, setActionId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await listSolicitacoes({
        page,
        per_page: 15,
        status: statusFilter || undefined,
        search: searchTerm || undefined,
      })
      setSolicitacoes(response.data)
      setPagination(response.meta)
    } catch (err) {
      setError(getErrorMessage(err, 'Erro ao carregar solicitações'))
    } finally {
      setIsLoading(false)
    }
  }, [page, statusFilter, searchTerm])

  useEffect(() => {
    void load()
  }, [load])

  const handlePageChange = (nextPage: number) => setPage(nextPage)

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setPage(1)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPage(1)
  }

  const aprovar = async (id: number) => {
    setActionId(id)
    try {
      await aprovarSolicitacao(id)
      toast.success('Solicitação aprovada e plano ativado!')
      await load()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao aprovar solicitação'))
    } finally {
      setActionId(null)
    }
  }

  const rejeitar = async (id: number, observacao?: string) => {
    setActionId(id)
    try {
      await rejeitarSolicitacao(id, observacao)
      toast.success('Solicitação rejeitada.')
      await load()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao rejeitar solicitação'))
    } finally {
      setActionId(null)
    }
  }

  return {
    solicitacoes,
    pagination,
    isLoading,
    error,
    statusFilter,
    searchTerm,
    actionId,
    handlePageChange,
    handleStatusFilter,
    handleSearch,
    aprovar,
    rejeitar,
  }
}
