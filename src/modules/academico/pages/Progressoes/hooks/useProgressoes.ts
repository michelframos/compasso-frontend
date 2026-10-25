import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { decidirProgressao, listProgressoes } from '../../../api/progressoes'
import type { PaginationMeta } from '../../Cursos/types'
import type { DecisaoProgressaoPayload, FiltroStatusProgressao, SugestaoProgressao } from '../types'
import { getErrorMessage } from '@/shared/lib/utils'

export type ModoDecisao = 'aprovada' | 'rejeitada'

export const useProgressoes = () => {
  const [sugestoes, setSugestoes] = useState<SugestaoProgressao[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<FiltroStatusProgressao>('pendente')
  const [search, setSearch] = useState('')
  const [emDecisao, setEmDecisao] = useState<{ sugestao: SugestaoProgressao; modo: ModoDecisao } | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const carregar = useCallback(async (page: number, filtroStatus: FiltroStatusProgressao, termo: string) => {
    setIsLoading(true)
    try {
      const resposta = await listProgressoes({ page, status: filtroStatus, search: termo || undefined })
      setSugestoes(resposta.data)
      setPagination(resposta.meta)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível carregar as sugestões de progressão.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => carregar(1, status, search), search ? 400 : 0)
    return () => clearTimeout(timer)
  }, [carregar, status, search])

  const irParaPagina = (page: number) => carregar(page, status, search)

  const abrirDecisao = (sugestao: SugestaoProgressao, modo: ModoDecisao) => setEmDecisao({ sugestao, modo })

  const fecharDecisao = () => {
    if (!isSaving) setEmDecisao(null)
  }

  const decidir = async (payload: DecisaoProgressaoPayload) => {
    if (!emDecisao) return
    setIsSaving(true)

    try {
      const decidida = await decidirProgressao(emDecisao.sugestao.id, payload)
      setSugestoes((lista) =>
        status === 'pendente' ? lista.filter((s) => s.id !== decidida.id) : lista.map((s) => (s.id === decidida.id ? decidida : s))
      )
      toast.success(payload.decisao === 'aprovada' ? 'Progressão aprovada.' : 'Sugestão rejeitada.')
      setEmDecisao(null)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível registrar a decisão.'))
    } finally {
      setIsSaving(false)
    }
  }

  return {
    sugestoes,
    pagination,
    isLoading,
    status,
    setStatus,
    search,
    setSearch,
    irParaPagina,
    emDecisao,
    isSaving,
    abrirDecisao,
    fecharDecisao,
    decidir,
  }
}
