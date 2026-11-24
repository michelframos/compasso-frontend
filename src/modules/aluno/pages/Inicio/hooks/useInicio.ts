import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import { getAlunoAutenticado } from '../../../api/me'
import { getPainel } from '../../../api/painel'
import { useAlunoAtivo } from '../../../hooks/useAlunoAtivo'
import type { AlunoAutenticado, PainelAluno } from '../../../types'

export function useInicio() {
  const { role, idAluno, params } = useAlunoAtivo()
  const aguardandoDependente = role === 'responsavel' && !idAluno
  const [aluno, setAluno] = useState<AlunoAutenticado | null>(null)
  const [painel, setPainel] = useState<PainelAluno | null>(null)
  const [painelErro, setPainelErro] = useState(false)
  const [isLoading, setIsLoading] = useState(!aguardandoDependente)

  useEffect(() => {
    if (aguardandoDependente) {
      setAluno(null)
      setPainel(null)
      setPainelErro(false)
      setIsLoading(false)
      return
    }

    let ativo = true
    setIsLoading(true)
    setPainelErro(false)

    Promise.allSettled([getAlunoAutenticado(params.id_aluno), getPainel(params.id_aluno)]).then(
      ([alunoResult, painelResult]) => {
        if (!ativo) return
        if (alunoResult.status === 'fulfilled') setAluno(alunoResult.value)
        if (painelResult.status === 'fulfilled') {
          setPainel(painelResult.value)
          setPainelErro(false)
        } else {
          setPainel(null)
          setPainelErro(true)
          toast.error(getErrorMessage(painelResult.reason, 'Não foi possível carregar o painel.'))
        }
        setIsLoading(false)
      },
    )

    return () => {
      ativo = false
    }
  }, [aguardandoDependente, params.id_aluno])

  return { aluno, painel, painelErro, isLoading, aguardandoDependente }
}
