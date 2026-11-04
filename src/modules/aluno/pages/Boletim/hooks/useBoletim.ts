import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import { getBoletim } from '../../../api/boletim'
import { useAlunoAtivo } from '../../../hooks/useAlunoAtivo'
import type { BoletimAluno } from '../../../types'

export function useBoletim(idMatricula: number | null) {
  const { role, idAluno, params } = useAlunoAtivo()
  const aguardandoDependente = role === 'responsavel' && !idAluno
  const [boletim, setBoletim] = useState<BoletimAluno | null>(null)
  const [isLoading, setIsLoading] = useState(!aguardandoDependente)

  useEffect(() => {
    if (aguardandoDependente) {
      setBoletim(null)
      setIsLoading(false)
      return
    }

    let ativo = true
    setIsLoading(true)
    getBoletim(params.id_aluno, idMatricula)
      .then((dados) => {
        if (ativo) setBoletim(dados)
      })
      .catch((erro) => {
        if (ativo) toast.error(getErrorMessage(erro, 'Não foi possível carregar o boletim.'))
      })
      .finally(() => {
        if (ativo) setIsLoading(false)
      })

    return () => {
      ativo = false
    }
  }, [aguardandoDependente, params.id_aluno, idMatricula])

  return { boletim, isLoading, aguardandoDependente }
}
