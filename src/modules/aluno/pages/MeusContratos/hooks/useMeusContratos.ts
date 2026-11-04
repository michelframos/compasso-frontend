import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import { baixarContrato, listarContratos } from '../../../api/contratos'
import { useAlunoAtivo } from '../../../hooks/useAlunoAtivo'
import type { ContratoDoAluno, TipoContratoDoAluno } from '../../../types'

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

export function useMeusContratos() {
  const { role, idAluno, params } = useAlunoAtivo()
  const aguardandoDependente = role === 'responsavel' && !idAluno
  const [contratos, setContratos] = useState<ContratoDoAluno[]>([])
  const [isLoading, setIsLoading] = useState(!aguardandoDependente)
  const [baixandoChave, setBaixandoChave] = useState<string | null>(null)

  useEffect(() => {
    if (aguardandoDependente) {
      setContratos([])
      setIsLoading(false)
      return
    }

    let ativo = true
    setIsLoading(true)
    listarContratos(params.id_aluno)
      .then((dados) => {
        if (ativo) setContratos(dados)
      })
      .catch((erro) => {
        if (ativo) toast.error(getErrorMessage(erro, 'Não foi possível carregar os contratos.'))
      })
      .finally(() => {
        if (ativo) setIsLoading(false)
      })

    return () => {
      ativo = false
    }
  }, [aguardandoDependente, params.id_aluno])

  const baixar = async (tipo: TipoContratoDoAluno, id: number) => {
    const chave = `${tipo}-${id}`
    setBaixandoChave(chave)
    try {
      abrirPdf(await baixarContrato(tipo, id, params.id_aluno))
    } catch (erro) {
      await erroDoBlob(erro, 'Não foi possível baixar o contrato.')
    } finally {
      setBaixandoChave(null)
    }
  }

  return { contratos, isLoading, aguardandoDependente, baixandoChave, baixar }
}
