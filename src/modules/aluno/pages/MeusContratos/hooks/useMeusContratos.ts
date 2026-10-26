import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import { aceitarContrato, baixarContrato, listarContratos } from '../../../api/contratos'
import { useAlunoAtivo } from '../../../hooks/useAlunoAtivo'
import type { ContratoDoAluno } from '../../../types'

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
  const [aceitandoId, setAceitandoId] = useState<number | null>(null)
  const [baixandoId, setBaixandoId] = useState<number | null>(null)

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

  const aceitar = async (id: number) => {
    setAceitandoId(id)
    try {
      const aceito = await aceitarContrato(id, params.id_aluno)
      setContratos((lista) => lista.map((item) => (item.id === aceito.id ? aceito : item)))
      toast.success('Contrato aceito.')
    } catch (erro) {
      toast.error(getErrorMessage(erro, 'Não foi possível aceitar o contrato.'))
    } finally {
      setAceitandoId(null)
    }
  }

  const baixar = async (id: number) => {
    setBaixandoId(id)
    try {
      abrirPdf(await baixarContrato(id, params.id_aluno))
    } catch (erro) {
      await erroDoBlob(erro, 'Não foi possível baixar o contrato.')
    } finally {
      setBaixandoId(null)
    }
  }

  return { contratos, isLoading, aguardandoDependente, aceitandoId, baixandoId, aceitar, baixar }
}
