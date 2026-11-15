import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import {
  baixarPdfCertificadoStaff,
  emitirCertificado,
  emitirCertificadosLote,
  listarCertificadosStaff,
  listarElegiveisCertificado,
  reemitirCertificado,
  type CertificadoStaff,
  type MatriculaElegivelCertificado,
} from '../../../api/certificados'

const SEM_TURMA = 'Sem turma'

export type GrupoElegiveis = {
  turma: string
  itens: MatriculaElegivelCertificado[]
}

export type FalhaEmissao = {
  id_matricula: number
  mensagem: string
  aluno?: string | null
}

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

function nomeTurma(valor: string | null | undefined) {
  return valor?.trim() || SEM_TURMA
}

function passaBusca(texto: string, termo: string) {
  return texto.toLowerCase().includes(termo)
}

export function useCertificados() {
  const [certificados, setCertificados] = useState<CertificadoStaff[]>([])
  const [elegiveis, setElegiveis] = useState<MatriculaElegivelCertificado[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [emitindoId, setEmitindoId] = useState<number | null>(null)
  const [emitindoLote, setEmitindoLote] = useState(false)
  const [reemitindoId, setReemitindoId] = useState<number | null>(null)
  const [baixandoPdfId, setBaixandoPdfId] = useState<number | null>(null)
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set())
  const [buscaElegiveis, setBuscaElegiveis] = useState('')
  const [buscaEmitidos, setBuscaEmitidos] = useState('')
  const [filtroTurma, setFiltroTurma] = useState('')
  const [falhasRecentes, setFalhasRecentes] = useState<FalhaEmissao[]>([])

  const carregar = useCallback(() => {
    let ativo = true
    setIsLoading(true)
    Promise.all([listarCertificadosStaff(), listarElegiveisCertificado()])
      .then(([listaEmitidos, listaElegiveis]) => {
        if (!ativo) return
        setCertificados(listaEmitidos)
        setElegiveis(listaElegiveis)
        setSelecionados(new Set())
        setFalhasRecentes([])
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

  const turmasDisponiveis = useMemo(() => {
    const nomes = new Set<string>()
    for (const item of elegiveis) {
      if (item.turma?.trim()) nomes.add(item.turma.trim())
    }
    for (const item of certificados) {
      if (item.turma?.trim()) nomes.add(item.turma.trim())
    }
    return Array.from(nomes).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [certificados, elegiveis])

  const elegiveisFiltrados = useMemo(() => {
    const termo = buscaElegiveis.trim().toLowerCase()
    return elegiveis.filter((item) => {
      if (filtroTurma && nomeTurma(item.turma) !== filtroTurma) return false
      if (!termo) return true
      const texto = [item.aluno?.nome, item.curso, item.turma, item.nivel]
        .filter(Boolean)
        .join(' ')
      return passaBusca(texto, termo)
    })
  }, [buscaElegiveis, elegiveis, filtroTurma])

  const emitidosFiltrados = useMemo(() => {
    const termo = buscaEmitidos.trim().toLowerCase()
    return certificados.filter((item) => {
      if (filtroTurma && nomeTurma(item.turma) !== filtroTurma) return false
      if (!termo) return true
      const texto = [item.aluno?.nome, item.curso, item.turma, item.nivel, item.codigo_verificacao]
        .filter(Boolean)
        .join(' ')
      return passaBusca(texto, termo)
    })
  }, [buscaEmitidos, certificados, filtroTurma])

  const gruposElegiveis = useMemo(() => {
    const mapa = new Map<string, MatriculaElegivelCertificado[]>()
    for (const item of elegiveisFiltrados) {
      const chave = nomeTurma(item.turma)
      const lista = mapa.get(chave) ?? []
      lista.push(item)
      mapa.set(chave, lista)
    }
    return Array.from(mapa.entries())
      .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
      .map(([turma, itens]) => ({ turma, itens }))
  }, [elegiveisFiltrados])

  const idsFiltrados = useMemo(
    () => elegiveisFiltrados.map((item) => item.id),
    [elegiveisFiltrados],
  )

  const todosFiltradosSelecionados =
    idsFiltrados.length > 0 && idsFiltrados.every((id) => selecionados.has(id))

  const limparFalhas = useCallback(() => setFalhasRecentes([]), [])

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

  const selecionarTurma = (turma: string) => {
    const ids = elegiveisFiltrados
      .filter((item) => nomeTurma(item.turma) === turma)
      .map((item) => item.id)
    if (ids.length === 0) return

    setSelecionados((atual) => {
      const proximo = new Set(atual)
      const todosJa = ids.every((id) => proximo.has(id))
      if (todosJa) {
        ids.forEach((id) => proximo.delete(id))
      } else {
        ids.forEach((id) => proximo.add(id))
      }
      return proximo
    })
  }

  const turmaTotalmenteSelecionada = (turma: string) => {
    const ids = elegiveisFiltrados
      .filter((item) => nomeTurma(item.turma) === turma)
      .map((item) => item.id)
    return ids.length > 0 && ids.every((id) => selecionados.has(id))
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

  const reemitir = async (certificado: CertificadoStaff, idTemplate?: number | null) => {
    setReemitindoId(certificado.id)
    try {
      const atualizado = await reemitirCertificado(certificado.id, idTemplate)
      setCertificados((atual) =>
        atual.map((item) => (item.id === atualizado.id ? atualizado : item)),
      )
      toast.success('Certificado reemitido.', {
        action: {
          label: 'Baixar PDF',
          onClick: () => {
            void baixarPdf(atualizado)
          },
        },
      })
      return atualizado
    } catch (erro) {
      toast.error(getErrorMessage(erro, 'Não foi possível reemitir o certificado.'))
      return null
    } finally {
      setReemitindoId(null)
    }
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
      toast.success('Certificado emitido.', {
        action: {
          label: 'Baixar PDF',
          onClick: () => {
            void baixarPdf(criado)
          },
        },
      })
      return criado
    } catch (erro) {
      toast.error(getErrorMessage(erro, 'Não foi possível emitir o certificado.'))
      return null
    } finally {
      setEmitindoId(null)
    }
  }

  const emitirLote = async (ids: number[]) => {
    if (ids.length === 0) {
      return { emitidos: 0, falhas: 0 }
    }
    setEmitindoLote(true)
    setFalhasRecentes([])
    try {
      const resultado = await emitirCertificadosLote(ids)
      const emitidosIds = new Set(resultado.emitidos.map((item) => item.id_matricula))
      const nomesPorId = new Map(elegiveis.map((item) => [item.id, item.aluno?.nome ?? null]))

      if (resultado.emitidos.length > 0) {
        setCertificados((atual) => [...resultado.emitidos, ...atual])
        setElegiveis((atual) => atual.filter((item) => !emitidosIds.has(item.id)))
        setSelecionados((atual) => {
          const proximo = new Set(atual)
          emitidosIds.forEach((id) => proximo.delete(id))
          return proximo
        })
      }

      if (resultado.falhas.length > 0) {
        setFalhasRecentes(
          resultado.falhas.map((falha) => ({
            ...falha,
            aluno: nomesPorId.get(falha.id_matricula) ?? null,
          })),
        )
      }

      if (resultado.falhas.length > 0 && resultado.emitidos.length === 0) {
        toast.error(`Nenhum certificado emitido. ${resultado.falhas[0]?.mensagem ?? ''}`.trim())
      } else if (resultado.falhas.length > 0) {
        toast.warning(
          `${resultado.emitidos.length} emitido(s), ${resultado.falhas.length} falha(s).`,
        )
      }

      return {
        emitidos: resultado.emitidos.length,
        falhas: resultado.falhas.length,
      }
    } catch (erro) {
      toast.error(getErrorMessage(erro, 'Não foi possível emitir o lote.'))
      return { emitidos: 0, falhas: 0 }
    } finally {
      setEmitindoLote(false)
    }
  }

  return {
    certificados: emitidosFiltrados,
    elegiveis: elegiveisFiltrados,
    gruposElegiveis,
    totalElegiveis: elegiveis.length,
    totalEmitidos: certificados.length,
    isLoading,
    emitindoId,
    emitindoLote,
    reemitindoId,
    baixandoPdfId,
    selecionados,
    buscaElegiveis,
    setBuscaElegiveis,
    buscaEmitidos,
    setBuscaEmitidos,
    filtroTurma,
    setFiltroTurma,
    turmasDisponiveis,
    falhasRecentes,
    limparFalhas,
    todosFiltradosSelecionados,
    alternarSelecao,
    alternarSelecionarTodosFiltrados,
    selecionarTurma,
    turmaTotalmenteSelecionada,
    emitir,
    emitirLote,
    reemitir,
    baixarPdf,
  }
}
