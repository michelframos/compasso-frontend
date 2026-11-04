import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import { listarInstrumentos } from '../../../api/instrumentos'
import { useAlunoAtivo } from '../../../hooks/useAlunoAtivo'
import type { HistoricoInstrumento, InstrumentoDoAluno } from '../../../types'

export function useMeusInstrumentos() {
  const { role, idAluno, params } = useAlunoAtivo()
  const aguardandoDependente = role === 'responsavel' && !idAluno
  const [atuais, setAtuais] = useState<InstrumentoDoAluno[]>([])
  const [historico, setHistorico] = useState<HistoricoInstrumento[]>([])
  const [isLoading, setIsLoading] = useState(!aguardandoDependente)

  useEffect(() => {
    if (aguardandoDependente) {
      setAtuais([])
      setHistorico([])
      setIsLoading(false)
      return
    }

    let ativo = true
    setIsLoading(true)
    listarInstrumentos(params.id_aluno)
      .then((dados) => {
        if (!ativo) return
        setAtuais(dados.atuais)
        setHistorico(dados.historico)
      })
      .catch((erro) => {
        if (ativo) toast.error(getErrorMessage(erro, 'Não foi possível carregar os instrumentos.'))
      })
      .finally(() => {
        if (ativo) setIsLoading(false)
      })

    return () => {
      ativo = false
    }
  }, [aguardandoDependente, params.id_aluno])

  return { atuais, historico, isLoading, aguardandoDependente }
}
