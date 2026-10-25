import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { SolicitacaoAula } from '@/modules/professor'
import { getErrorMessage } from '@/shared/lib/utils'
import {
  decidirSolicitacaoAula,
  listSolicitacoesAulas,
  type DecisaoSolicitacaoPayload,
  type FiltroStatusSolicitacao,
} from '../../../api/solicitacoesAulas'
import type { PaginationMeta } from '../../Cursos/types'

export type ModoDecisaoAula = 'aprovada' | 'rejeitada'

export const useSolicitacoesAulas = () => {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoAula[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<FiltroStatusSolicitacao>('pendente')
  const [search, setSearch] = useState('')
  const [emDecisao, setEmDecisao] = useState<{ solicitacao: SolicitacaoAula; modo: ModoDecisaoAula } | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const carregar = useCallback(async (page: number, filtroStatus: FiltroStatusSolicitacao, termo: string) => {
    setIsLoading(true)
    try {
      const resposta = await listSolicitacoesAulas({ page, status: filtroStatus, search: termo || undefined })
      setSolicitacoes(resposta.data)
      setPagination(resposta.meta)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível carregar as solicitações de aula.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => carregar(1, status, search), search ? 400 : 0)
    return () => clearTimeout(timer)
  }, [carregar, status, search])

  const decidir = async (payload: DecisaoSolicitacaoPayload) => {
    if (!emDecisao) return
    setIsSaving(true)

    try {
      const decidida = await decidirSolicitacaoAula(emDecisao.solicitacao.id, payload)
      setSolicitacoes((lista) =>
        status === 'pendente' ? lista.filter((s) => s.id !== decidida.id) : lista.map((s) => (s.id === decidida.id ? decidida : s))
      )
      toast.success(payload.decisao === 'aprovada' ? 'Solicitação aprovada e aplicada na agenda.' : 'Solicitação rejeitada.')
      setEmDecisao(null)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível registrar a decisão.'))
    } finally {
      setIsSaving(false)
    }
  }

  return {
    solicitacoes,
    pagination,
    isLoading,
    status,
    setStatus,
    search,
    setSearch,
    irParaPagina: (page: number) => carregar(page, status, search),
    emDecisao,
    isSaving,
    abrirDecisao: (solicitacao: SolicitacaoAula, modo: ModoDecisaoAula) => setEmDecisao({ solicitacao, modo }),
    fecharDecisao: () => !isSaving && setEmDecisao(null),
    decidir,
  }
}
