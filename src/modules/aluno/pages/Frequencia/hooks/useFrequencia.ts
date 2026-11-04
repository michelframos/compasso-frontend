import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import { getFrequencia } from '../../../api/frequencia'
import { useAlunoAtivo } from '../../../hooks/useAlunoAtivo'
import type { FrequenciaAluno } from '../../../types'

export function useFrequencia() {
  const { role, idAluno, params } = useAlunoAtivo()
  const aguardandoDependente = role === 'responsavel' && !idAluno
  const [frequencia, setFrequencia] = useState<FrequenciaAluno | null>(null)
  const [isLoading, setIsLoading] = useState(!aguardandoDependente)

  useEffect(() => {
    if (aguardandoDependente) {
      setFrequencia(null)
      setIsLoading(false)
      return
    }

    let ativo = true
    setIsLoading(true)
    getFrequencia(params.id_aluno)
      .then((dados) => {
        if (ativo) setFrequencia(dados)
      })
      .catch((erro) => {
        if (ativo) toast.error(getErrorMessage(erro, 'Não foi possível carregar a frequência.'))
      })
      .finally(() => {
        if (ativo) setIsLoading(false)
      })

    return () => {
      ativo = false
    }
  }, [aguardandoDependente, params.id_aluno])

  return { frequencia, isLoading, aguardandoDependente }
}
