import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { MaterialDaTurma, MaterialPayload } from '../../../types'

export const TAMANHO_MAXIMO_ARQUIVO = 10 * 1024 * 1024

export const EXTENSOES_ACEITAS =
  '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.txt,.rtf,.csv,.jpg,.jpeg,.png,.gif,.webp,.mp3,.wav,.ogg,.m4a,.aac,.flac,.mid,.midi,.mp4,.mov,.webm,.zip,.xml'

const linkValido = (valor: string) => {
  try {
    return ['http:', 'https:'].includes(new URL(valor).protocol)
  } catch {
    return false
  }
}

const criarSchema = (material: MaterialDaTurma | null) =>
  z
    .object({
      titulo: z.string().trim().min(1, 'Informe o título').max(255, 'Máximo de 255 caracteres'),
      descricao: z.string().max(5000, 'Máximo de 5000 caracteres'),
      publico: z.boolean(),
      tipo: z.enum(['arquivo', 'link']),
      link: z.string().trim(),
      arquivo: z.instanceof(File).nullable(),
    })
    .superRefine((dados, ctx) => {
      if (dados.tipo === 'link' && !linkValido(dados.link)) {
        ctx.addIssue({ code: 'custom', path: ['link'], message: 'Informe um link válido (http ou https)' })
      }

      if (dados.tipo === 'arquivo') {
        const mantemArquivoAtual = material?.tipo === 'arquivo'

        if (!dados.arquivo && !mantemArquivoAtual) {
          ctx.addIssue({ code: 'custom', path: ['arquivo'], message: 'Selecione um arquivo' })
        }

        if (dados.arquivo && dados.arquivo.size > TAMANHO_MAXIMO_ARQUIVO) {
          ctx.addIssue({ code: 'custom', path: ['arquivo'], message: 'O arquivo deve ter no máximo 10MB' })
        }
      }
    })

type MaterialFormValues = z.infer<ReturnType<typeof criarSchema>>

const valoresIniciais = (material: MaterialDaTurma | null): MaterialFormValues => ({
  titulo: material?.titulo ?? '',
  descricao: material?.descricao ?? '',
  publico: material?.publico ?? true,
  tipo: material?.tipo ?? 'arquivo',
  link: material?.link ?? '',
  arquivo: null,
})

export const useMaterialForm = (
  material: MaterialDaTurma | null,
  aberto: boolean,
  onSalvar: (payload: MaterialPayload) => void,
) => {
  const schema = useMemo(() => criarSchema(material), [material])

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(schema),
    defaultValues: valoresIniciais(material),
  })

  useEffect(() => {
    if (aberto) form.reset(valoresIniciais(material))
  }, [aberto, material, form])

  const enviar = form.handleSubmit((valores) => {
    onSalvar({
      titulo: valores.titulo,
      descricao: valores.descricao.trim() || null,
      publico: valores.publico,
      ...(valores.tipo === 'arquivo' ? { arquivo: valores.arquivo } : { link: valores.link }),
    })
  })

  const [tipo, arquivo, publico] = useWatch({ control: form.control, name: ['tipo', 'arquivo', 'publico'] })

  return {
    form,
    enviar,
    tipo,
    arquivo,
    publico,
    arquivoAtual: material?.tipo === 'arquivo' ? material : null,
  }
}
