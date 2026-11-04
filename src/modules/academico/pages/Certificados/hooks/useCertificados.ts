import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import {
  baixarPdfCertificadoStaff,
  emitirCertificado,
  emitirCertificadosLote,
  listarCertificadosStaff,
  listarElegiveisCertificado,
  type CertificadoStaff,
  type MatriculaElegivelCertificado,
} from '../../../api/certificados'

function baixarBlob(blob: Blob, nome: string) {
  const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
  const link = document.createElement('a')
  link.href = url
  link.download = nome
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function useCertificados() {
  const [certificados, setCertificados] = useState<CertificadoStaff[]>([])
  const [elegiveis, setElegiveis] = useState<MatriculaElegivelCertificado[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [emitindoId, setEmitindoId] = useState<number | null>(null)
  const [emitindoLote, setEmitindoLote] = useState(false)
  const [baixandoPdfId, setBaixandoPdfId] = useState<number | null>(null)
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set())
  const [buscaElegiveis, setBuscaElegiveis] = useState('')
  const [buscaEmitidos, setBuscaEmitidos] = useState('')

  const carregar = useCallback(() => {
    let ativo = true
    setIsLoading(true)
    Promise.all([listarCertificadosStaff(), listarElegiveisCertificado()])
      .then(([listaEmitidos, listaElegiveis]) => {
        if (!ativo) return
        setCertificados(listaEmitidos)
        setElegiveis(listaElegiveis)
        setSelecionados(new Set())
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
  }, [])

  useEffect(() => carregar(), [carregar])

  const elegiveisFiltrados = useMemo(() => {
    const termo = buscaElegiveis.trim().toLowerCase()
    if (!termo) return elegiveis
    return elegiveis.filter((item) => {
      const texto = [item.aluno?.nome, item.curso, item.turma, item.nivel]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return texto.includes(termo)
    })
  }, [buscaElegiveis, elegiveis])

  const emitidosFiltrados = useMemo(() => {
    const termo = buscaEmitidos.trim().toLowerCase()
    if (!termo) return certificados
    return certificados.filter((item) => {
      const texto = [item.aluno?.nome, item.curso, item.turma, item.nivel, item.codigo_verificacao]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return texto.includes(termo)
    })
  }, [buscaEmitidos, certificados])

  const idsFiltrados = useMemo(
    () => elegiveisFiltrados.map((item) => item.id),
    [elegiveisFiltrados],
  )

  const todosFiltradosSelecionados =
    idsFiltrados.length > 0 && idsFiltrados.every((id) => selecionados.has(id))

  const alternarSelecao = (id: number) => {
    setSelecionados((atual) => {
      const proximo = new Set(atual)
      if (proximo.has(id)) proximo.delete(id)
      else proximo.add(id)
      return proximo
    })
  }

  const alternarSelecionarTodosFiltrados = () => {
    setSelecionados((atual) => {
      const proximo = new Set(atual)
      if (todosFiltradosSelecionados) {
        idsFiltrados.forEach((id) => proximo.delete(id))
      } else {
        idsFiltrados.forEach((id) => proximo.add(id))
      }
      return proximo
    })
  }

  const emitir = async (idMatricula: number) => {
    setEmitindoId(idMatricula)
    try {
      const criado = await emitirCertificado(idMatricula)
      setCertificados((atual) => [criado, ...atual])
      setElegiveis((atual) => atual.filter((item) => item.id !== idMatricula))
      setSelecionados((atual) => {
        const proximo = new Set(atual)
        proximo.delete(idMatricula)
        return proximo
      })
      toast.success('Certificado emitido.')
    } catch (erro) {
      toast.error(getErrorMessage(erro, 'Não foi possível emitir o certificado.'))
    } finally {
      setEmitindoId(null)
    }
  }

  const emitirLote = async (ids: number[]) => {
    if (ids.length === 0) return
    setEmitindoLote(true)
    try {
      const resultado = await emitirCertificadosLote(ids)
      const emitidosIds = new Set(resultado.emitidos.map((item) => item.id_matricula))

      if (resultado.emitidos.length > 0) {
        setCertificados((atual) => [...resultado.emitidos, ...atual])
        setElegiveis((atual) => atual.filter((item) => !emitidosIds.has(item.id)))
        setSelecionados((atual) => {
          const proximo = new Set(atual)
          emitidosIds.forEach((id) => proximo.delete(id))
          return proximo
        })
      }

      if (resultado.falhas.length === 0) {
        toast.success(
          resultado.emitidos.length === 1
            ? '1 certificado emitido.'
            : `${resultado.emitidos.length} certificados emitidos.`,
        )
      } else if (resultado.emitidos.length === 0) {
        toast.error(`Nenhum certificado emitido. ${resultado.falhas[0]?.mensagem ?? ''}`.trim())
      } else {
        toast.warning(
          `${resultado.emitidos.length} emitido(s), ${resultado.falhas.length} falha(s).`,
        )
      }
    } catch (erro) {
      toast.error(getErrorMessage(erro, 'Não foi possível emitir o lote.'))
    } finally {
      setEmitindoLote(false)
    }
  }

  const baixarPdf = async (certificado: CertificadoStaff) => {
    setBaixandoPdfId(certificado.id)
    try {
      const blob = await baixarPdfCertificadoStaff(certificado.id)
      baixarBlob(blob, `certificado_${certificado.codigo_verificacao}.pdf`)
    } catch (erro) {
      toast.error(getErrorMessage(erro, 'Não foi possível baixar o PDF.'))
    } finally {
      setBaixandoPdfId(null)
    }
  }

  return {
    certificados: emitidosFiltrados,
    elegiveis: elegiveisFiltrados,
    totalElegiveis: elegiveis.length,
    totalEmitidos: certificados.length,
    isLoading,
    emitindoId,
    emitindoLote,
    baixandoPdfId,
    selecionados,
    buscaElegiveis,
    setBuscaElegiveis,
    buscaEmitidos,
    setBuscaEmitidos,
    todosFiltradosSelecionados,
    alternarSelecao,
    alternarSelecionarTodosFiltrados,
    emitir,
    emitirLote,
    baixarPdf,
  }
}
