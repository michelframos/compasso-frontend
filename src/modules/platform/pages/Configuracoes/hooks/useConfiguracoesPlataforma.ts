import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { getConfiguracoes, updateConfiguracoes, type PlatformConfiguracoes } from '../../../api/platform'
import { getErrorMessage } from '@/shared/lib/utils'

const configuracoesSchema = z.object({
  default_trial_days: z
    .number({ message: 'Informe a quantidade de dias' })
    .int('Use um número inteiro')
    .min(1, 'Mínimo de 1 dia')
    .max(3650, 'Máximo de 3650 dias'),
  email_cadastro_assunto: z.string().trim().min(1, 'Informe o assunto do e-mail').max(255),
  email_cadastro_corpo: z
    .string()
    .refine((value) => value.replace(/<[^>]*>/g, '').trim().length > 0, 'Informe o texto do e-mail'),
})

export type ConfiguracoesFormValues = z.infer<typeof configuracoesSchema>

export const useConfiguracoesPlataforma = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [variaveis, setVariaveis] = useState<PlatformConfiguracoes['variaveis_email']>([])

  const form = useForm<ConfiguracoesFormValues>({
    resolver: zodResolver(configuracoesSchema),
    defaultValues: {
      default_trial_days: 14,
      email_cadastro_assunto: '',
      email_cadastro_corpo: '',
    },
  })

  useEffect(() => {
    const load = async () => {
      try {
        const config = await getConfiguracoes()
        form.reset({
          default_trial_days: config.default_trial_days,
          email_cadastro_assunto: config.email_cadastro_assunto,
          email_cadastro_corpo: config.email_cadastro_corpo,
        })
        setVariaveis(config.variaveis_email ?? [])
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, 'Erro ao carregar configurações'))
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [form])

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true)
    try {
      const config = await updateConfiguracoes(values)
      form.reset({
        default_trial_days: config.default_trial_days,
        email_cadastro_assunto: config.email_cadastro_assunto,
        email_cadastro_corpo: config.email_cadastro_corpo,
      })
      toast.success('Configurações salvas com sucesso!')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erro ao salvar configurações'))
    } finally {
      setIsSubmitting(false)
    }
  })

  return { form, isLoading, isSubmitting, onSubmit, variaveis }
}
