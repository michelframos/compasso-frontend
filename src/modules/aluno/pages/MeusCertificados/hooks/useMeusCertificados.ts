import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import { baixarCertificado, listarCertificados } from '../../../api/certificados'
import { useAlunoAtivo } from '../../../hooks/useAlunoAtivo'
import type { CertificadoDoAluno } from '../../../types'

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

export function useMeusCertificados() {
  const { role, idAluno, params } = useAlunoAtivo()
  const aguardandoDependente = role === 'responsavel' && !idAluno
  const [certificados, setCertificados] = useState<CertificadoDoAluno[]>([])
  const [isLoading, setIsLoading] = useState(!aguardandoDependente)
  const [baixandoId, setBaixandoId] = useState<number | null>(null)

  useEffect(() => {
    if (aguardandoDependente) {
      setCertificados([])
      setIsLoading(false)
      return
    }

    let ativo = true
    setIsLoading(true)
    listarCertificados(params.id_aluno)
      .then((dados) => {
        if (ativo) setCertificados(dados)
      })
      .catch((erro) => {
        if (ativo) toast.error(getErrorMessage(erro, 'Não foi possível carregar os certificados.'))
      })
      .finally(() => {
        if (ativo) setIsLoading(false)
      })

    return () => {
      ativo = false
    }
  }, [aguardandoDependente, params.id_aluno])

  const baixar = async (id: number) => {
    setBaixandoId(id)
    try {
      abrirPdf(await baixarCertificado(id, params.id_aluno))
    } catch (erro) {
      await erroDoBlob(erro, 'Não foi possível baixar o certificado.')
    } finally {
      setBaixandoId(null)
    }
  }

  return { certificados, isLoading, aguardandoDependente, baixandoId, baixar }
}
