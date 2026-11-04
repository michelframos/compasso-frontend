import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { getErrorMessage } from '@/shared/lib/utils'
import {
  atualizarTemplateCertificado,
  criarTemplateCertificado,
  enviarFundoTemplateCertificado,
  obterTemplateCertificado,
  removerFundoTemplateCertificado,
  type TemplateCertificado,
} from '../../api/templatesCertificados'
import { TemplateCertificadoForm } from './components/TemplateCertificadoForm'

export const TemplateCertificadoFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const editando = Boolean(id)

  const [template, setTemplate] = useState<TemplateCertificado | null>(null)
  const [carregando, setCarregando] = useState(editando)
  const [salvando, setSalvando] = useState(false)
  const templateRef = useRef(template)
  templateRef.current = template

  useEffect(() => {
    if (!editando || !id) {
      setTemplate(null)
      setCarregando(false)
      return
    }

    if (templateRef.current?.id === Number(id)) {
      setCarregando(false)
      return
    }

    let ativo = true
    setCarregando(true)

    void obterTemplateCertificado(id)
      .then((dados) => {
        if (ativo) setTemplate(dados)
      })
      .catch((erro) => {
        if (!ativo) return
        toast.error(getErrorMessage(erro, 'Não foi possível carregar o template.'))
        navigate('/certificados?aba=templates', { replace: true })
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [editando, id, navigate])

  const voltar = () => {
    navigate('/certificados?aba=templates')
  }

  const handleSave = async (
    payload: { nome: string; conteudo: string },
    fundo?: File | null,
    removerFundo = false,
  ) => {
    setSalvando(true)
    try {
      let salvo = template?.id
        ? await atualizarTemplateCertificado(template.id, payload)
        : await criarTemplateCertificado(payload)

      if (fundo) {
        salvo = await enviarFundoTemplateCertificado(salvo.id, fundo)
      } else if (template?.id && removerFundo) {
        salvo = await removerFundoTemplateCertificado(salvo.id)
      }

      setTemplate(salvo)
      toast.success(template?.id ? 'Template atualizado.' : 'Template criado.')

      if (!template?.id) {
        navigate(`/certificados/templates/${salvo.id}`, { replace: true })
      }

      return salvo
    } catch (erro) {
      toast.error(getErrorMessage(erro, 'Não foi possível salvar o template.'))
      return null
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-7.5rem)] min-h-[560px] flex-col gap-4 md:h-[calc(100dvh-9rem)]">
      <div className="flex shrink-0 items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={voltar}
          className="h-10 w-10 rounded-full border border-zinc-100 shadow-sm transition-all hover:cursor-pointer hover:bg-white hover:text-indigo-600"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            {editando ? 'Editar' : 'Novo'} <span className="text-indigo-600">template</span>
          </h1>
          <p className="text-[14px] text-zinc-500">
            {template?.nome
              ? `“${template.nome}” · arraste elementos sobre o A4 paisagem`
              : 'Monte o certificado visualmente sobre o A4 paisagem'}
          </p>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-zinc-100 bg-white shadow-sm">
        <TemplateCertificadoForm
          key={template?.id ?? 'novo'}
          template={template}
          salvando={salvando}
          onCancel={voltar}
          onSave={handleSave}
        />
      </div>
    </div>
  )
}

export default TemplateCertificadoFormPage
