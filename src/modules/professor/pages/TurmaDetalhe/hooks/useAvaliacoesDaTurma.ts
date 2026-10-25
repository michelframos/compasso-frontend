import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { listAvaliacoes } from '../../../api/avaliacoes'
import type { AvaliacaoAluno } from '../../../types'
import { getErrorMessage } from '@/shared/lib/utils'

export const useAvaliacoesDaTurma = (turmaId: number) => {
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoAluno[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    listAvaliacoes({ id_turma: turmaId })
      .then((data) => {
        if (!cancelled) setAvaliacoes(data)
      })
      .catch((err) => {
        if (!cancelled) toast.error(getErrorMessage(err, 'Não foi possível carregar as avaliações.'))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [turmaId])

  const alterarAvaliacoes = useCallback(
    (alterar: (lista: AvaliacaoAluno[]) => AvaliacaoAluno[]) => setAvaliacoes((lista) => alterar(lista)),
    []
  )

  return { avaliacoes, isLoading, alterarAvaliacoes }
}
