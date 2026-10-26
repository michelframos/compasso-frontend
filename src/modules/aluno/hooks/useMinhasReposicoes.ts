import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import { listarReposicoes } from '../api/reposicoes'
import { useAlunoAtivo } from './useAlunoAtivo'
import type { RegrasReposicao, ReposicaoDoAluno } from '../types'

const REGRAS_VAZIAS: RegrasReposicao = { limite_periodo: null, prazo_dias: null, usados_no_periodo: 0 }

export function useMinhasReposicoes() {
  const { role, idAluno, params } = useAlunoAtivo()
  const aguardandoDependente = role === 'responsavel' && !idAluno
  const [porAula, setPorAula] = useState<Record<number, ReposicaoDoAluno>>({})
  const [regras, setRegras] = useState<RegrasReposicao>(REGRAS_VAZIAS)

  const carregar = useCallback(() => {
    if (aguardandoDependente) {
      setPorAula({})
      setRegras(REGRAS_VAZIAS)
      return
    }

    listarReposicoes(params.id_aluno)
      .then((resposta) => {
        const mapa: Record<number, ReposicaoDoAluno> = {}
        for (const item of [...resposta.data].reverse()) mapa[item.id_aula_turma_perdida] = item
        setPorAula(mapa)
        setRegras(resposta.regras)
      })
      .catch((erro) => {
        toast.error(getErrorMessage(erro, 'Não foi possível carregar as reposições.'))
      })
  }, [aguardandoDependente, params.id_aluno])

  useEffect(() => {
    carregar()
  }, [carregar])

  return { porAula, regras, recarregar: carregar }
}
