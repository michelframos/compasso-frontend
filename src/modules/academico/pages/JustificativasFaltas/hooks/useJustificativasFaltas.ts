import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import {
  decidirJustificativa,
  listarJustificativasFaltas,
  type JustificativaFalta,
  type StatusJustificativa,
} from '../../../api/justificativasFaltas'

export function useJustificativasFaltas() {
  const [status, setStatus] = useState<StatusJustificativa>('pendente')
  const [pedidos, setPedidos] = useState<JustificativaFalta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [decidindoId, setDecidindoId] = useState<number | null>(null)

  const carregar = useCallback(() => {
    let ativo = true
    setIsLoading(true)
    listarJustificativasFaltas(status)
      .then((lista) => {
        if (ativo) setPedidos(lista)
      })
      .catch((erro) => {
        if (ativo) toast.error(getErrorMessage(erro, 'Não foi possível carregar as justificativas.'))
      })
      .finally(() => {
        if (ativo) setIsLoading(false)
      })

    return () => {
      ativo = false
    }
  }, [status])

  useEffect(() => carregar(), [carregar])

  const decidir = async (id: number, decisao: 'aceita' | 'recusada') => {
    setDecidindoId(id)
    try {
      await decidirJustificativa(id, decisao)
      toast.success(decisao === 'aceita' ? 'Justificativa aceita.' : 'Justificativa recusada.')
      setPedidos((atual) => atual.filter((pedido) => pedido.id !== id))
    } catch (erro) {
      toast.error(getErrorMessage(erro, 'Não foi possível registrar a decisão.'))
    } finally {
      setDecidindoId(null)
    }
  }

  return { status, setStatus, pedidos, isLoading, decidindoId, decidir }
}
