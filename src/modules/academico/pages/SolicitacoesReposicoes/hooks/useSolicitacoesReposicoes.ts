import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import {
  decidirReposicao,
  listarSolicitacoesReposicao,
  type SolicitacaoReposicao,
  type StatusReposicao,
} from '../../../api/solicitacoesReposicoes'

export function useSolicitacoesReposicoes() {
  const [status, setStatus] = useState<StatusReposicao>('pendente')
  const [pedidos, setPedidos] = useState<SolicitacaoReposicao[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [decidindoId, setDecidindoId] = useState<number | null>(null)

  const carregar = useCallback(() => {
    let ativo = true
    setIsLoading(true)
    listarSolicitacoesReposicao(status)
      .then((lista) => {
        if (ativo) setPedidos(lista)
      })
      .catch((erro) => {
        if (ativo) toast.error(getErrorMessage(erro, 'Não foi possível carregar as reposições.'))
      })
      .finally(() => {
        if (ativo) setIsLoading(false)
      })

    return () => {
      ativo = false
    }
  }, [status])

  useEffect(() => carregar(), [carregar])

  const decidir = async (id: number, decisao: 'aprovada' | 'recusada', idAulaDestino?: number | null) => {
    setDecidindoId(id)
    try {
      await decidirReposicao(id, decisao, idAulaDestino)
      toast.success(decisao === 'aprovada' ? 'Reposição aprovada.' : 'Reposição recusada.')
      setPedidos((atual) => atual.filter((pedido) => pedido.id !== id))
    } catch (erro) {
      toast.error(getErrorMessage(erro, 'Não foi possível registrar a decisão.'))
    } finally {
      setDecidindoId(null)
    }
  }

  return { status, setStatus, pedidos, isLoading, decidindoId, decidir }
}
