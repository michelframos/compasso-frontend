import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  getConfiguracoes,
  testarBilling,
  updateConfiguracoes,
  type PlatformConfiguracoes,
} from '../../../api/platform'
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
  billing_gateway_url: z
    .string()
    .trim()
    .refine((value) => value === '' || /^https?:\/\//i.test(value), 'Informe uma URL válida')
    .optional()
    .or(z.literal('')),
  billing_gateway_api_key: z.string().optional().or(z.literal('')),
  billing_enabled: z.boolean(),
})

export type ConfiguracoesFormValues = z.infer<typeof configuracoesSchema>

export const useConfiguracoesPlataforma = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [variaveis, setVariaveis] = useState<PlatformConfiguracoes['variaveis_email']>([])
  const [billingConfigured, setBillingConfigured] = useState(false)
  const [keyMasked, setKeyMasked] = useState<string | null>(null)

  const form = useForm<ConfiguracoesFormValues>({
    resolver: zodResolver(configuracoesSchema),
    defaultValues: {
      default_trial_days: 14,
      email_cadastro_assunto: '',
      email_cadastro_corpo: '',
      billing_gateway_url: '',
      billing_gateway_api_key: '',
      billing_enabled: false,
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
          billing_gateway_url: config.billing_gateway_url ?? '',
          billing_gateway_api_key: config.billing_gateway_api_key_masked ?? '',
          billing_enabled: Boolean(config.billing_enabled),
        })
        setVariaveis(config.variaveis_email ?? [])
        setBillingConfigured(Boolean(config.billing_configured))
        setKeyMasked(config.billing_gateway_api_key_masked)
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, 'Erro ao carregar configurações'))
      } finally {
        setIsLoading(false)
      }
    }

    void load()
  }, [form])

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true)
    try {
      const config = await updateConfiguracoes({
        default_trial_days: values.default_trial_days,
        email_cadastro_assunto: values.email_cadastro_assunto,
        email_cadastro_corpo: values.email_cadastro_corpo,
        billing_gateway_url: values.billing_gateway_url || null,
        billing_enabled: values.billing_enabled,
        billing_gateway_api_key: values.billing_gateway_api_key || null,
      })
      form.reset({
        default_trial_days: config.default_trial_days,
        email_cadastro_assunto: config.email_cadastro_assunto,
        email_cadastro_corpo: config.email_cadastro_corpo,
        billing_gateway_url: config.billing_gateway_url ?? '',
        billing_gateway_api_key: config.billing_gateway_api_key_masked ?? '',
        billing_enabled: Boolean(config.billing_enabled),
      })
      setBillingConfigured(Boolean(config.billing_configured))
      setKeyMasked(config.billing_gateway_api_key_masked)
      toast.success('Configurações salvas com sucesso!')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erro ao salvar configurações'))
    } finally {
      setIsSubmitting(false)
    }
  })

  const onTestBilling = async () => {
    setIsTesting(true)
    try {
      const values = form.getValues()
      const result = await testarBilling({
        billing_gateway_url: values.billing_gateway_url || null,
        billing_gateway_api_key: values.billing_gateway_api_key || null,
      })
      toast.success(
        result.system
          ? `${result.message} Sistema: ${result.system}`
          : result.message,
      )
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Falha ao testar conexão com o centralizador'))
    } finally {
      setIsTesting(false)
    }
  }

  return {
    form,
    isLoading,
    isSubmitting,
    isTesting,
    onSubmit,
    onTestBilling,
    variaveis,
    billingConfigured,
    keyMasked,
  }
}
