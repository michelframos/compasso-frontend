import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import { getHistoricoMatricula, listarMatriculas } from '../../../api/matriculas'
import { useAlunoAtivo } from '../../../hooks/useAlunoAtivo'
import type { HistoricoMatricula, MatriculaDoAluno } from '../../../types'

export function useMatriculaDetalhe() {
  const { id } = useParams()
  const { role, idAluno, params } = useAlunoAtivo()
  const aguardandoDependente = role === 'responsavel' && !idAluno
  const [matricula, setMatricula] = useState<MatriculaDoAluno | null>(null)
  const [historico, setHistorico] = useState<HistoricoMatricula[]>([])
  const [isLoading, setIsLoading] = useState(!aguardandoDependente)

  useEffect(() => {
    if (aguardandoDependente || !id) {
      setMatricula(null)
      setHistorico([])
      setIsLoading(false)
      return
    }

    let ativo = true
    setIsLoading(true)

    Promise.allSettled([
      listarMatriculas(params.id_aluno, false),
      listarMatriculas(params.id_aluno, true),
      getHistoricoMatricula(id, params.id_aluno),
    ]).then(([ativas, encerradas, historicoResult]) => {
      if (!ativo) return
      const listas = [ativas, encerradas].flatMap((resultado) => (resultado.status === 'fulfilled' ? resultado.value : []))
      setMatricula(listas.find((item) => String(item.id) === id) ?? null)
      if (historicoResult.status === 'fulfilled') {
        setHistorico(historicoResult.value)
      } else {
        setHistorico([])
        toast.error(getErrorMessage(historicoResult.reason, 'Não foi possível carregar o histórico.'))
      }
      if (ativas.status === 'rejected' && encerradas.status === 'rejected') {
        toast.error(getErrorMessage(ativas.reason, 'Não foi possível carregar a matrícula.'))
      }
      setIsLoading(false)
    })

    return () => {
      ativo = false
    }
  }, [aguardandoDependente, id, params.id_aluno])

  return { matricula, historico, isLoading, aguardandoDependente }
}
