import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus'
import { estaOffline, lerCacheOffline, salvarCacheOffline } from '@/shared/lib/offlineCache'
import { getErrorMessage } from '@/shared/lib/utils'
import { baixarCarne, baixarRecibo, getPix, listarContas, listarContasConsolidadas } from '../../../api/financeiro'
import { useAlunoAtivo } from '../../../hooks/useAlunoAtivo'
import type { ContaDoAluno, PixDaConta } from '../../../types'

export type SituacaoConta = 'em_aberto' | 'pagas' | 'atrasadas'

const RECURSO = 'financeiro'

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

  useEffect(() => {
    if (aguardandoDependente) {
      setContas([])
      setDoCache(false)
      setIsLoading(false)
      return
    }

    let ativo = true
    setIsLoading(true)
    const partes = [consolidado ? 'consolidado' : params.id_aluno, situacao]
    const pedido = consolidado ? listarContasConsolidadas(situacao) : listarContas(situacao, params.id_aluno)
    pedido
      .then((dados) => {
        if (!ativo) return
        setContas(dados)
        setDoCache(false)
        salvarCacheOffline(RECURSO, dados, partes)
      })
      .catch((erro) => {
        if (!ativo) return
        const cache = lerCacheOffline<ContaDoAluno[]>(RECURSO, partes)
        if (cache && (estaOffline() || offline)) {
          setContas(cache.dados)
          setDoCache(true)
          return
        }
        setContas([])
        setDoCache(false)
        toast.error(getErrorMessage(erro, 'Não foi possível carregar o financeiro.'))
      })
      .finally(() => {
        if (ativo) setIsLoading(false)
      })

    return () => {
      ativo = false
    }
  }, [aguardandoDependente, consolidado, params.id_aluno, situacao, offline])

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
  }
}
