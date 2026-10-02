import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createDepoimento, getDepoimento, updateDepoimento } from '../../../api/depoimentos'
import { getErrorMessage } from '@/shared/lib/utils'

const depoimentoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255),
  cargo: z.string().min(1, 'Cargo é obrigatório').max(255),
  escola: z.string().min(1, 'Escola é obrigatória').max(255),
  conteudo: z.string().min(1, 'Depoimento é obrigatório').max(2000),
  avatar_url: z
    .union([z.string().url('URL inválida'), z.literal('')])
    .optional()
    .transform((v) => (v ? v : null)),
  ordem: z.coerce.number().int().min(0).default(0),
})

export type DepoimentoFormValues = z.infer<typeof depoimentoSchema>

export const useDepoimentoForm = (depoimentoId?: number, onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(!!depoimentoId)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<DepoimentoFormValues>({
    resolver: zodResolver(depoimentoSchema),
    defaultValues: {
      nome: '',
      cargo: '',
      escola: '',
      conteudo: '',
      avatar_url: '',
      ordem: 0,
    },
  })

  useEffect(() => {
    if (!depoimentoId) return

    const load = async () => {
      try {
        setIsLoading(true)
        const item = await getDepoimento(depoimentoId)
        form.reset({
          nome: item.nome,
          cargo: item.cargo,
          escola: item.escola,
          conteudo: item.conteudo,
          avatar_url: item.avatar_url ?? '',
          ordem: item.ordem,
        })
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, 'Erro ao carregar depoimento'))
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [depoimentoId, form])

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true)
    try {
      const payload = {
        nome: values.nome,
        cargo: values.cargo,
        escola: values.escola,
        conteudo: values.conteudo,
        avatar_url: values.avatar_url,
        ordem: values.ordem,
      }

      if (depoimentoId) {
        await updateDepoimento(depoimentoId, payload)
        toast.success('Depoimento atualizado com sucesso!')
      } else {
        await createDepoimento(payload)
        toast.success('Depoimento criado. Aprove na lista para exibir no site.')
      }

      onSuccess?.()
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erro ao salvar depoimento'))
    } finally {
      setIsSubmitting(false)
    }
  })

  return { form, isLoading, isSubmitting, onSubmit }
}
