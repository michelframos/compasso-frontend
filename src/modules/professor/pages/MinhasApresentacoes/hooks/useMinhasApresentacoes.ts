import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { listEnsaios, listMinhasApresentacoes } from '../../../api/apresentacoes'
import type { ApresentacaoDoProfessor, EnsaioAgendado, SituacaoApresentacao } from '../../../types'
import { getErrorMessage } from '@/shared/lib/utils'

export const useMinhasApresentacoes = () => {
  const [apresentacoes, setApresentacoes] = useState<ApresentacaoDoProfessor[]>([])
  const [situacao, setSituacaoState] = useState<SituacaoApresentacao>('proximas')
  const [isLoading, setIsLoading] = useState(true)
  const [ensaios, setEnsaios] = useState<EnsaioAgendado[]>([])
  const [isLoadingEnsaios, setIsLoadingEnsaios] = useState(true)

  useEffect(() => {
    let cancelled = false

    listMinhasApresentacoes(situacao)
      .then((data) => {
        if (!cancelled) setApresentacoes(data)
      })
      .catch((err) => {
        if (!cancelled) toast.error(getErrorMessage(err, 'Não foi possível carregar suas apresentações.'))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [situacao])

  useEffect(() => {
    let cancelled = false

    listEnsaios({ data_inicio: format(new Date(), 'yyyy-MM-dd') })
      .then((data) => {
        if (!cancelled) setEnsaios(data)
      })
      .catch((err) => {
        if (!cancelled) toast.error(getErrorMessage(err, 'Não foi possível carregar a agenda de ensaios.'))
      })
      .finally(() => {
        if (!cancelled) setIsLoadingEnsaios(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const setSituacao = (valor: SituacaoApresentacao) => {
    if (valor === situacao) return
    setIsLoading(true)
    setSituacaoState(valor)
  }

  return { apresentacoes, situacao, setSituacao, isLoading, ensaios, isLoadingEnsaios }
}
