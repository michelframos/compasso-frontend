import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import { listarMatriculas } from '../../../api/matriculas'
import { useAlunoAtivo } from '../../../hooks/useAlunoAtivo'
import type { MatriculaDoAluno } from '../../../types'

export function useMinhasMatriculas() {
  const { role, idAluno, params } = useAlunoAtivo()
  const aguardandoDependente = role === 'responsavel' && !idAluno
  const [encerradas, setEncerradas] = useState(false)
  const [matriculas, setMatriculas] = useState<MatriculaDoAluno[]>([])
  const [isLoading, setIsLoading] = useState(!aguardandoDependente)

  useEffect(() => {
    if (aguardandoDependente) {
      setMatriculas([])
      setIsLoading(false)
      return
    }

    let ativo = true
    setIsLoading(true)
    listarMatriculas(params.id_aluno, encerradas)
      .then((dados) => {
        if (ativo) setMatriculas(dados)
      })
      .catch((erro) => {
        if (ativo) toast.error(getErrorMessage(erro, 'Não foi possível carregar as matrículas.'))
      })
      .finally(() => {
        if (ativo) setIsLoading(false)
      })

    return () => {
      ativo = false
    }
  }, [aguardandoDependente, encerradas, params.id_aluno])

  return { matriculas, encerradas, setEncerradas, isLoading, aguardandoDependente }
}
