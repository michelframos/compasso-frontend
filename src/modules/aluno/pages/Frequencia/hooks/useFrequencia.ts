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
  const [frequenciaErro, setFrequenciaErro] = useState(false)
  const [isLoading, setIsLoading] = useState(!aguardandoDependente)

  useEffect(() => {
    if (aguardandoDependente) {
      setFrequencia(null)
      setFrequenciaErro(false)
      setIsLoading(false)
      return
    }

    let ativo = true
    setIsLoading(true)
    setFrequenciaErro(false)
    getFrequencia(params.id_aluno)
      .then((dados) => {
        if (!ativo) return
        setFrequencia(dados)
        setFrequenciaErro(false)
      })
      .catch((erro) => {
        if (!ativo) return
        setFrequencia(null)
        setFrequenciaErro(true)
        toast.error(getErrorMessage(erro, 'Não foi possível carregar a frequência.'))
      })
      .finally(() => {
        if (ativo) setIsLoading(false)
      })

    return () => {
      ativo = false
    }
  }, [aguardandoDependente, params.id_aluno])

  return { frequencia, frequenciaErro, isLoading, aguardandoDependente }
}
