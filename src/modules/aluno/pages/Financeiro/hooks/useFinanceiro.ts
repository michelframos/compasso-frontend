import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus'
import { estaOffline, lerCacheOffline, salvarCacheOffline } from '@/shared/lib/offlineCache'
import { getErrorMessage } from '@/shared/lib/utils'
import {
  baixarCarne,
  baixarRecibo,
  criarCobrancaOnline,
  getCobrancaOnline,
  getPix,
  listarContas,
  listarContasConsolidadas,
} from '../../../api/financeiro'
import { useAlunoAtivo } from '../../../hooks/useAlunoAtivo'
import type { ContaCobrancaGateway, ContaDoAluno, MetodoCobrancaOnline, PixDaConta } from '../../../types'

export type SituacaoConta = 'em_aberto' | 'pagas' | 'atrasadas'

const RECURSO = 'financeiro'
const POLL_MS = 4000

function abrirPdf(blob: Blob) {
  const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
  const link = document.createElement('a')
  link.href = url
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  link.click()
  URL.revokeObjectURL(url)
}

async function erroDoBlob(erro: unknown, fallback: string) {
  const resposta = (erro as { response?: { data?: Blob } }).response?.data
  if (resposta instanceof Blob) {
    try {
      const json = JSON.parse(await resposta.text())
      toast.error(getErrorMessage({ response: { data: json } }, fallback))
      return
    } catch {
      toast.error(fallback)
      return
    }
  }
  toast.error(getErrorMessage(erro, fallback))
}

export function useFinanceiro() {
  const { role, idAluno, params } = useAlunoAtivo()
  const { offline } = useOnlineStatus()
  const [consolidado, setConsolidado] = useState(false)
  const aguardandoDependente = role === 'responsavel' && !idAluno && !consolidado
  const [situacao, setSituacao] = useState<SituacaoConta>('em_aberto')
  const [contas, setContas] = useState<ContaDoAluno[]>([])
  const [isLoading, setIsLoading] = useState(!aguardandoDependente)
  const [doCache, setDoCache] = useState(false)
  const [pix, setPix] = useState<PixDaConta | null>(null)
  const [abrindoPix, setAbrindoPix] = useState(false)
  const [gerando, setGerando] = useState(false)
  const [cobrancaOnline, setCobrancaOnline] = useState<ContaCobrancaGateway | null>(null)
  const [abrindoCobranca, setAbrindoCobranca] = useState(false)
  const [escolhendoMeioContaId, setEscolhendoMeioContaId] = useState<number | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const carregarContas = useCallback(async () => {
    if (aguardandoDependente) {
      setContas([])
      setDoCache(false)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const partes = [consolidado ? 'consolidado' : params.id_aluno, situacao]
    try {
      const dados = consolidado
        ? await listarContasConsolidadas(situacao)
        : await listarContas(situacao, params.id_aluno)
      setContas(dados)
      setDoCache(false)
      salvarCacheOffline(RECURSO, dados, partes)
    } catch (erro) {
      const cache = lerCacheOffline<ContaDoAluno[]>(RECURSO, partes)
      if (cache && (estaOffline() || offline)) {
        setContas(cache.dados)
        setDoCache(true)
      } else {
        setContas([])
        setDoCache(false)
        toast.error(getErrorMessage(erro, 'Não foi possível carregar o financeiro.'))
      }
    } finally {
      setIsLoading(false)
    }
  }, [aguardandoDependente, consolidado, params.id_aluno, situacao, offline])

  useEffect(() => {
    void carregarContas()
  }, [carregarContas])

  const pararPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const fecharCobrancaOnline = useCallback(() => {
    pararPoll()
    setCobrancaOnline(null)
    setEscolhendoMeioContaId(null)
  }, [pararPoll])

  const iniciarPoll = useCallback(
    (idConta: number, idAlunoConta?: number | null) => {
      pararPoll()
      pollRef.current = setInterval(async () => {
        try {
          const atual = await getCobrancaOnline(idConta, true, idAlunoConta ?? params.id_aluno)
          if (!atual) return
          setCobrancaOnline(atual)
          if (atual.paga || !atual.aberta) {
            pararPoll()
            if (atual.paga) {
              toast.success('Pagamento confirmado!')
              void carregarContas()
            }
          }
        } catch {
          // mantém o poll; falha pontual de rede
        }
      }, POLL_MS)
    },
    [carregarContas, params.id_aluno, pararPoll],
  )

  useEffect(() => () => pararPoll(), [pararPoll])

  const abrirPix = async (idConta: number, idAlunoConta?: number | null) => {
    if (offline) {
      toast.error('PIX indisponível offline.')
      return
    }
    setAbrindoPix(true)
    try {
      setPix(await getPix(idConta, idAlunoConta ?? params.id_aluno))
    } catch (erro) {
      toast.error(getErrorMessage(erro, 'Não foi possível gerar o PIX.'))
    } finally {
      setAbrindoPix(false)
    }
  }

  const copiarPix = async () => {
    if (!pix) return
    try {
      await navigator.clipboard.writeText(pix.payload)
      toast.success('Código PIX copiado.')
    } catch {
      toast.error('Não foi possível copiar o código.')
    }
  }

  const copiarPixOnline = async () => {
    const codigo = cobrancaOnline?.pix_copy_paste
    if (!codigo) return
    try {
      await navigator.clipboard.writeText(codigo)
      toast.success('Código PIX copiado.')
    } catch {
      toast.error('Não foi possível copiar o código.')
    }
  }

  const pagarOnline = async (
    idConta: number,
    method: MetodoCobrancaOnline,
    idAlunoConta?: number | null,
  ) => {
    if (offline) {
      toast.error('Pagamento online indisponível offline.')
      return
    }
    setAbrindoCobranca(true)
    setEscolhendoMeioContaId(null)
    try {
      const cobranca = await criarCobrancaOnline(idConta, method, idAlunoConta ?? params.id_aluno)
      setCobrancaOnline(cobranca)
      if (cobranca.aberta && !cobranca.paga) {
        iniciarPoll(idConta, idAlunoConta ?? params.id_aluno)
      }
      if (cobranca.paga) {
        toast.success('Pagamento já confirmado.')
        void carregarContas()
      }
    } catch (erro) {
      toast.error(getErrorMessage(erro, 'Não foi possível iniciar o pagamento online.'))
    } finally {
      setAbrindoCobranca(false)
    }
  }

  const emitirCarne = async () => {
    if (offline) {
      toast.error('Carnê indisponível offline.')
      return
    }
    if (contas.length === 0) return
    setGerando(true)
    try {
      abrirPdf(await baixarCarne(contas.map((conta) => conta.id), params.id_aluno))
    } catch (erro) {
      await erroDoBlob(erro, 'Não foi possível gerar o carnê.')
    } finally {
      setGerando(false)
    }
  }

  const emitirRecibo = async (idPagamento: number, idAlunoConta?: number | null) => {
    if (offline) {
      toast.error('Recibo indisponível offline.')
      return
    }
    setGerando(true)
    try {
      abrirPdf(await baixarRecibo(idPagamento, idAlunoConta ?? params.id_aluno))
    } catch (erro) {
      await erroDoBlob(erro, 'Não foi possível baixar o recibo.')
    } finally {
      setGerando(false)
    }
  }

  return {
    situacao,
    setSituacao,
    consolidado,
    setConsolidado,
    podeConsolidar: role === 'responsavel',
    contas,
    isLoading,
    aguardandoDependente,
    offline,
    doCache,
    pix,
    fecharPix: () => setPix(null),
    abrindoPix,
    abrirPix,
    copiarPix,
    gerando,
    emitirCarne,
    emitirRecibo,
    cobrancaOnline,
    abrindoCobranca,
    escolhendoMeioContaId,
    setEscolhendoMeioContaId,
    pagarOnline,
    fecharCobrancaOnline,
    copiarPixOnline,
  }
}
