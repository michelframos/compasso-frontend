import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import {
  atualizarTemplateCertificado,
  criarTemplateCertificado,
  duplicarTemplateCertificado,
  enviarFundoTemplateCertificado,
  excluirTemplateCertificado,
  listarTemplatesCertificados,
  removerFundoTemplateCertificado,
  type TemplateCertificado,
} from '../../../api/templatesCertificados'

export function useTemplatesCertificados() {
  const [templates, setTemplates] = useState<TemplateCertificado[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [duplicandoId, setDuplicandoId] = useState<number | null>(null)

  const carregar = useCallback(async () => {
    setIsLoading(true)
    try {
      setTemplates(await listarTemplatesCertificados())
    } catch (erro) {
      toast.error(getErrorMessage(erro, 'Não foi possível carregar os templates.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const salvar = async (
    payload: { nome: string; conteudo: string },
    id?: number,
    fundo?: File | null,
    removerFundo = false,
  ) => {
    setSalvando(true)
    try {
      let salvo = id
        ? await atualizarTemplateCertificado(id, payload)
        : await criarTemplateCertificado(payload)

      if (fundo) {
        salvo = await enviarFundoTemplateCertificado(salvo.id, fundo)
      } else if (id && removerFundo) {
        salvo = await removerFundoTemplateCertificado(salvo.id)
      }

      setTemplates((lista) => {
        const semAtual = lista.filter((item) => item.id !== salvo.id)
        return [salvo, ...semAtual].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
      })
      toast.success(id ? 'Template atualizado.' : 'Template criado.')
      return salvo
    } catch (erro) {
      toast.error(getErrorMessage(erro, 'Não foi possível salvar o template.'))
      return null
    } finally {
      setSalvando(false)
    }
  }

  const excluir = async (id: number) => {
    try {
      await excluirTemplateCertificado(id)
      setTemplates((lista) => lista.filter((item) => item.id !== id))
      toast.success('Template removido.')
      return true
    } catch (erro) {
      toast.error(getErrorMessage(erro, 'Não foi possível remover o template.'))
      return false
    }
  }

  const duplicar = async (id: number) => {
    setDuplicandoId(id)
    try {
      const copia = await duplicarTemplateCertificado(id)
      setTemplates((lista) =>
        [copia, ...lista].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
      )
      toast.success('Template duplicado.')
      return copia
    } catch (erro) {
      toast.error(getErrorMessage(erro, 'Não foi possível duplicar o template.'))
      return null
    } finally {
      setDuplicandoId(null)
    }
  }

  return { templates, isLoading, salvando, duplicandoId, carregar, salvar, excluir, duplicar }
}
