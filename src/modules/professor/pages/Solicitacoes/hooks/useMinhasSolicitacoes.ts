import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getProfessorAutenticado } from '../../../api/me'
import { cancelarSolicitacao, listMinhasSolicitacoes } from '../../../api/solicitacoes'
import type { AulaDoProfessor, PermissoesAulas, SolicitacaoAula, StatusSolicitacaoAula } from '../../../types'
import { getErrorMessage } from '@/shared/lib/utils'

export type FiltroSolicitacoes = StatusSolicitacaoAula | 'todas'

export const useMinhasSolicitacoes = () => {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoAula[]>([])
  const [pagina, setPagina] = useState({ atual: 1, ultima: 1 })
  const [status, setStatus] = useState<FiltroSolicitacoes>('todas')
  const [isLoading, setIsLoading] = useState(true)
  const [permissoes, setPermissoes] = useState<PermissoesAulas | null>(null)
  const [emCancelamento, setEmCancelamento] = useState<SolicitacaoAula | null>(null)
  const [cancelando, setCancelando] = useState(false)
  const [escolhendoAula, setEscolhendoAula] = useState(false)
  const [emAlteracao, setEmAlteracao] = useState<AulaDoProfessor | null>(null)
  const [criandoAula, setCriandoAula] = useState(false)

  const carregar = useCallback(async (page: number, filtro: FiltroSolicitacoes) => {
    setIsLoading(true)
    try {
      const resposta = await listMinhasSolicitacoes({ page, status: filtro })
      setSolicitacoes(resposta.data)
      setPagina({ atual: resposta.meta.current_page, ultima: resposta.meta.last_page })
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível carregar suas solicitações.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    carregar(1, status)
  }, [carregar, status])

  useEffect(() => {
    getProfessorAutenticado()
      .then((professor) => setPermissoes(professor.permissoes_aulas))
      .catch(() => setPermissoes(null))
  }, [])

  const recarregar = () => carregar(1, status)

  const confirmarCancelamento = async () => {
    if (!emCancelamento) return
    setCancelando(true)
    try {
      await cancelarSolicitacao(emCancelamento.id)
      toast.success('Solicitação cancelada.')
      setEmCancelamento(null)
      recarregar()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível cancelar a solicitação.'))
    } finally {
      setCancelando(false)
    }
  }

  const escolherAula = (aula: AulaDoProfessor) => {
    setEscolhendoAula(false)
    setEmAlteracao(aula)
  }

  return {
    solicitacoes,
    pagina,
    status,
    setStatus,
    isLoading,
    permissoes,
    irParaPagina: (page: number) => carregar(page, status),
    recarregar,
    emCancelamento,
    setEmCancelamento,
    cancelando,
    confirmarCancelamento,
    escolhendoAula,
    setEscolhendoAula,
    escolherAula,
    emAlteracao,
    fecharAlteracao: () => setEmAlteracao(null),
    criandoAula,
    setCriandoAula,
  }
}
