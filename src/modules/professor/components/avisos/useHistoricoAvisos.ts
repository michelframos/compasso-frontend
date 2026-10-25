import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { AvisosApi, FiltrosAvisos } from '../../api/avisos'
import type { AvisoTurma, OpcoesAviso, OrigemAviso } from '../../types'
import { getErrorMessage } from '@/shared/lib/utils'

export type FiltroOrigemAviso = OrigemAviso | 'todos'

export const useHistoricoAvisos = (api: AvisosApi) => {
  const [avisos, setAvisos] = useState<AvisoTurma[]>([])
  const [pagina, setPagina] = useState({ atual: 1, ultima: 1 })
  const [origem, setOrigem] = useState<FiltroOrigemAviso>('todos')
  const [busca, setBusca] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [opcoes, setOpcoes] = useState<OpcoesAviso | null>(null)
  const [emDetalhe, setEmDetalhe] = useState<AvisoTurma | null>(null)
  const [criando, setCriando] = useState(false)

  const carregar = useCallback(
    async (filtros: FiltrosAvisos) => {
      setIsLoading(true)
      try {
        const resposta = await api.listar(filtros)
        setAvisos(resposta.data)
        setPagina({ atual: resposta.meta.current_page, ultima: resposta.meta.last_page })
      } catch (err) {
        toast.error(getErrorMessage(err, 'Não foi possível carregar os avisos.'))
      } finally {
        setIsLoading(false)
      }
    },
    [api]
  )

  const filtros = useCallback(
    (page: number): FiltrosAvisos => ({ page, origem: origem === 'todos' ? undefined : origem, search: busca.trim() || undefined }),
    [origem, busca]
  )

  useEffect(() => {
    const timer = setTimeout(() => carregar(filtros(1)), 300)
    return () => clearTimeout(timer)
  }, [carregar, filtros])

  const carregarOpcoes = useCallback(() => {
    api.opcoes().then(setOpcoes).catch(() => setOpcoes(null))
  }, [api])

  useEffect(() => {
    carregarOpcoes()
  }, [carregarOpcoes])

  return {
    avisos,
    pagina,
    origem,
    setOrigem,
    busca,
    setBusca,
    isLoading,
    opcoes,
    irParaPagina: (page: number) => carregar(filtros(page)),
    recarregar: () => {
      carregar(filtros(1))
      carregarOpcoes()
    },
    emDetalhe,
    setEmDetalhe,
    criando,
    setCriando,
  }
}
