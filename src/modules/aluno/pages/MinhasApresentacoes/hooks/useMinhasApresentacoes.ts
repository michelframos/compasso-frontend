import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import { listarApresentacoes } from '../../../api/apresentacoes'
import { useAlunoAtivo } from '../../../hooks/useAlunoAtivo'
import type { ApresentacaoDoAluno } from '../../../types'

export function useMinhasApresentacoes() {
  const { role, idAluno, params } = useAlunoAtivo()
  const aguardandoDependente = role === 'responsavel' && !idAluno
  const [apresentacoes, setApresentacoes] = useState<ApresentacaoDoAluno[]>([])
  const [isLoading, setIsLoading] = useState(!aguardandoDependente)

  useEffect(() => {
    if (aguardandoDependente) {
      setApresentacoes([])
      setIsLoading(false)
      return
    }

    let ativo = true
    setIsLoading(true)
    listarApresentacoes(params.id_aluno)
      .then((dados) => {
        if (ativo) setApresentacoes(dados)
      })
      .catch((erro) => {
        if (ativo) toast.error(getErrorMessage(erro, 'Não foi possível carregar as apresentações.'))
      })
      .finally(() => {
        if (ativo) setIsLoading(false)
      })

    return () => {
      ativo = false
    }
  }, [aguardandoDependente, params.id_aluno])

  return { apresentacoes, isLoading, aguardandoDependente }
}
