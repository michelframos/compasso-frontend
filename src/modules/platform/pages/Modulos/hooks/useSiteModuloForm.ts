import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createSiteModulo, getSiteModulo, updateSiteModulo } from '../../../api/modulos'
import { SITE_MODULO_ICONES } from '../../../types'
import { getErrorMessage } from '@/shared/lib/utils'

function linhasParaRecursos(texto: string) {
  return texto
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
}

const moduloSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255),
  descricao: z.string().min(1, 'Descrição é obrigatória').max(2000),
  recursos_texto: z.string().optional().default(''),
  icone: z.enum(SITE_MODULO_ICONES),
  ordem: z.coerce.number().int().min(0).default(0),
})

export type SiteModuloFormValues = z.infer<typeof moduloSchema>

export const useSiteModuloForm = (moduloId?: number, onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(!!moduloId)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<SiteModuloFormValues>({
    resolver: zodResolver(moduloSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      recursos_texto: '',
      icone: 'LayoutGrid',
      ordem: 0,
    },
  })

  useEffect(() => {
    if (!moduloId) return

    const load = async () => {
      try {
        setIsLoading(true)
        const item = await getSiteModulo(moduloId)
        form.reset({
          nome: item.nome,
          descricao: item.descricao,
          recursos_texto: (item.recursos ?? []).join('\n'),
          icone: SITE_MODULO_ICONES.includes(item.icone as (typeof SITE_MODULO_ICONES)[number])
            ? (item.icone as (typeof SITE_MODULO_ICONES)[number])
            : 'LayoutGrid',
          ordem: item.ordem,
        })
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, 'Erro ao carregar módulo'))
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [moduloId, form])

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true)
    try {
      const payload = {
        nome: values.nome,
        descricao: values.descricao,
        recursos: linhasParaRecursos(values.recursos_texto ?? ''),
        icone: values.icone,
        ordem: values.ordem,
      }

      if (moduloId) {
        await updateSiteModulo(moduloId, payload)
        toast.success('Módulo atualizado com sucesso!')
      } else {
        await createSiteModulo(payload)
        toast.success('Módulo criado. Aprove na lista para exibir no site.')
      }

      onSuccess?.()
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erro ao salvar módulo'))
    } finally {
      setIsSubmitting(false)
    }
  })

  return { form, isLoading, isSubmitting, onSubmit }
}
