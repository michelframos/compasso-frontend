import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import { listarJustificativas } from '../api/justificativas'
import { useAlunoAtivo } from './useAlunoAtivo'
import type { JustificativaDoAluno } from '../types'

export function useMinhasJustificativas() {
  const { role, idAluno, params } = useAlunoAtivo()
  const aguardandoDependente = role === 'responsavel' && !idAluno
  const [porAula, setPorAula] = useState<Record<number, JustificativaDoAluno>>({})

  const carregar = useCallback(() => {
    if (aguardandoDependente) {
      setPorAula({})
      return
    }

    listarJustificativas(params.id_aluno)
      .then((lista) => {
        const mapa: Record<number, JustificativaDoAluno> = {}
        for (const item of [...lista].reverse()) mapa[item.id_aula_turma] = item
        setPorAula(mapa)
      })
      .catch((erro) => {
        toast.error(getErrorMessage(erro, 'Não foi possível carregar os avisos de falta.'))
      })
  }, [aguardandoDependente, params.id_aluno])

  useEffect(() => {
    carregar()
  }, [carregar])

  return { porAula, recarregar: carregar }
}
