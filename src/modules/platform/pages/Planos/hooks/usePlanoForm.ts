import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createPlano, getPlano, updatePlano } from '../../../api/planos'
import { getPlatformConfig } from '../../../api/platform'
import type { ModuloAppCatalogItem, PlanoAssinatura } from '../../../types'
import { getErrorMessage } from '@/shared/lib/utils'

const planoSchema = z.object({
  slug: z.string().min(1, 'Slug é obrigatório').max(64).regex(/^[a-z0-9_-]+$/i, 'Use apenas letras, números, hífen e underscore'),
  nome: z.string().min(1, 'Nome é obrigatório').max(255),
  descricao: z.string().optional().default(''),
  preco_mensal: z.coerce.number().min(0, 'Preço deve ser positivo'),
  limite_alunos: z.union([z.coerce.number().int().min(1), z.literal(''), z.null()]).optional().transform((v) => (v === '' || v === null || v === undefined ? null : Number(v))),
  modulos: z.array(z.string()).default([]),
  ativo: z.boolean().default(true),
})

export type PlanoFormValues = z.infer<typeof planoSchema>

export const usePlanoForm = (planoId?: number, onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(!!planoId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modulosCatalog, setModulosCatalog] = useState<ModuloAppCatalogItem[]>([])

  const form = useForm<PlanoFormValues>({
    resolver: zodResolver(planoSchema),
    defaultValues: {
      slug: '',
      nome: '',
      descricao: '',
      preco_mensal: 0,
      limite_alunos: null,
      modulos: [],
      ativo: true,
    },
  })

  useEffect(() => {
    getPlatformConfig()
      .then((config) => setModulosCatalog(config.modulos_app ?? []))
      .catch(() => setModulosCatalog([]))
  }, [])

  useEffect(() => {
    if (!planoId) return

    const load = async () => {
      try {
        setIsLoading(true)
        const plano = await getPlano(planoId)
        form.reset({
          slug: plano.slug,
          nome: plano.nome,
          descricao: plano.descricao ?? '',
          preco_mensal: Number(plano.preco_mensal),
          limite_alunos: plano.limite_alunos,
          modulos: plano.modulos ?? [],
          ativo: plano.ativo,
        })
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, 'Erro ao carregar plano'))
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [planoId, form])

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true)
    try {
      const payload = {
        slug: values.slug,
        nome: values.nome,
        descricao: values.descricao || null,
        preco_mensal: values.preco_mensal,
        limite_alunos: values.limite_alunos,
        modulos: values.modulos,
        ativo: values.ativo,
      }

      if (planoId) {
        await updatePlano(planoId, payload)
        toast.success('Plano atualizado com sucesso!')
      } else {
        await createPlano(payload)
        toast.success('Plano criado com sucesso!')
      }

      onSuccess?.()
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erro ao salvar plano'))
    } finally {
      setIsSubmitting(false)
    }
  })

  return { form, isLoading, isSubmitting, onSubmit, modulosCatalog }
}

export type { PlanoAssinatura }
