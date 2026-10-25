import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createInstituicao, getInstituicao, updateInstituicao } from '../../../api/instituicoes'
import { getPlatformConfig } from '../../../api/platform'
import { listPlanos } from '../../../api/planos'
import type { PlanoAssinatura } from '../../../types'
import { formatCnpj, getErrorMessage, unmaskCnpj } from '@/shared/lib/utils'

const idOpcional = z
  .union([z.string(), z.number(), z.null()])
  .optional()
  .transform((valor) => {
    if (valor === '' || valor === null || valor === undefined) return null
    const numero = Number(valor)
    return Number.isInteger(numero) && numero > 0 ? numero : null
  })

const baseInstituicaoSchema = z.object({
  slug: z.string().min(1, 'Slug é obrigatório').max(64).regex(/^[a-z0-9_-]+$/i, 'Slug inválido'),
  nome_fantasia: z.string().min(1, 'Nome fantasia é obrigatório').max(255),
  razao_social: z.string().optional().default(''),
  cnpj: z
    .string()
    .min(1, 'CNPJ é obrigatório')
    .refine((value) => unmaskCnpj(value).length === 14, 'CNPJ deve ter 14 caracteres'),
  rua: z.string().optional().default(''),
  numero: z.string().optional().default(''),
  bairro: z.string().optional().default(''),
  complemento: z.string().optional().default(''),
  cep: z.string().optional().default(''),
  id_estado: idOpcional,
  id_cidade: idOpcional,
  status: z.enum(['a', 'i', 's']).default('a'),
  id_plano_assinatura: idOpcional,
  assinatura_status: z.enum(['trialing', 'active', 'past_due', 'canceled']).default('trialing'),
  assinatura_inicia_em: z.string().optional().default(''),
  trial_mode: z.enum(['padrao', 'dias', 'data']).default('padrao'),
  trial_dias: z.union([z.coerce.number().int().min(1).max(3650), z.literal(''), z.null()]).optional().transform((v) => (v === '' || v === null || v === undefined ? null : Number(v))),
  trial_ends_at: z.string().optional().default(''),
})

const createInstituicaoSchema = baseInstituicaoSchema.extend({
  admin_nome: z.string().min(1, 'Nome do administrador é obrigatório').max(255),
  admin_email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  admin_password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  admin_password_confirmation: z.string().min(1, 'Confirme a senha'),
  admin_cpf: z.string().optional().default(''),
}).refine((data) => data.admin_password === data.admin_password_confirmation, {
  message: 'As senhas não conferem',
  path: ['admin_password_confirmation'],
})

export type InstituicaoFormValues = z.infer<typeof createInstituicaoSchema>

const toDateInput = (value: string | null | undefined) => {
  if (!value) return ''
  return value.slice(0, 10)
}

const toDateTimeInput = (value: string | null | undefined) => {
  if (!value) return ''
  return value.slice(0, 16)
}

export const useInstituicaoForm = (instituicaoId?: number, onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(!!instituicaoId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [defaultTrialDays, setDefaultTrialDays] = useState(14)
  const [planos, setPlanos] = useState<PlanoAssinatura[]>([])

  const form = useForm<InstituicaoFormValues>({
    resolver: zodResolver(instituicaoId ? baseInstituicaoSchema : createInstituicaoSchema),
    defaultValues: {
      slug: '',
      nome_fantasia: '',
      razao_social: '',
      cnpj: '',
      rua: '',
      numero: '',
      bairro: '',
      complemento: '',
      cep: '',
      id_estado: null,
      id_cidade: null,
      status: 'a',
      id_plano_assinatura: null,
      assinatura_status: 'trialing',
      assinatura_inicia_em: '',
      trial_mode: 'padrao',
      trial_dias: null,
      trial_ends_at: '',
      admin_nome: '',
      admin_email: '',
      admin_password: '',
      admin_password_confirmation: '',
      admin_cpf: '',
    },
  })

  useEffect(() => {
    Promise.all([
      getPlatformConfig().catch(() => ({ default_trial_days: 14 })),
      listPlanos({ per_page: 100 }).catch(() => ({ data: [] as PlanoAssinatura[] })),
    ]).then(([config, planosRes]) => {
      setDefaultTrialDays(config.default_trial_days)
      setPlanos(planosRes.data)
    })
  }, [])

  useEffect(() => {
    if (!instituicaoId) return

    const load = async () => {
      try {
        setIsLoading(true)
        const inst = await getInstituicao(instituicaoId)

        let trialMode: InstituicaoFormValues['trial_mode'] = 'padrao'
        if (inst.trial_ends_at && !inst.trial_usa_padrao) {
          trialMode = 'data'
        } else if (!inst.trial_usa_padrao) {
          trialMode = 'dias'
        }

        form.reset({
          slug: inst.slug,
          nome_fantasia: inst.nome_fantasia,
          razao_social: inst.razao_social ?? '',
          cnpj: formatCnpj(inst.cnpj ?? ''),
          rua: inst.rua ?? '',
          numero: inst.numero ?? '',
          bairro: inst.bairro ?? '',
          complemento: inst.complemento ?? '',
          cep: inst.cep ?? '',
          id_estado: inst.id_estado,
          id_cidade: inst.id_cidade,
          status: inst.status,
          id_plano_assinatura: inst.id_plano_assinatura,
          assinatura_status: inst.assinatura_status,
          assinatura_inicia_em: toDateInput(inst.assinatura_inicia_em),
          trial_mode: trialMode,
          trial_dias: null,
          trial_ends_at: toDateTimeInput(inst.trial_ends_at),
        })
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, 'Erro ao carregar escola'))
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [instituicaoId, form])

  const buildTrialPayload = (values: InstituicaoFormValues) => {
    if (values.trial_mode === 'padrao') {
      return { usar_trial_padrao: true, trial_dias: null, trial_ends_at: null }
    }
    if (values.trial_mode === 'dias' && values.trial_dias) {
      return { usar_trial_padrao: false, trial_dias: values.trial_dias, trial_ends_at: null }
    }
    if (values.trial_mode === 'data' && values.trial_ends_at) {
      return { usar_trial_padrao: false, trial_dias: null, trial_ends_at: values.trial_ends_at }
    }
    return { usar_trial_padrao: true, trial_dias: null, trial_ends_at: null }
  }

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true)
    try {
      const trial = buildTrialPayload(values)
      const payload = {
        slug: values.slug,
        nome_fantasia: values.nome_fantasia,
        razao_social: values.razao_social || null,
        cnpj: unmaskCnpj(values.cnpj),
        rua: values.rua || null,
        numero: values.numero || null,
        bairro: values.bairro || null,
        complemento: values.complemento || null,
        cep: values.cep || null,
        id_estado: values.id_estado,
        id_cidade: values.id_cidade,
        status: values.status,
        id_plano_assinatura: values.id_plano_assinatura,
        assinatura_status: values.assinatura_status,
        assinatura_inicia_em: values.assinatura_inicia_em || null,
        ...trial,
      }

      if (instituicaoId) {
        await updateInstituicao(instituicaoId, payload)
        toast.success('Escola atualizada com sucesso!')
      } else {
        await createInstituicao({
          ...payload,
          admin_nome: values.admin_nome,
          admin_email: values.admin_email,
          admin_password: values.admin_password,
          admin_password_confirmation: values.admin_password_confirmation,
          admin_cpf: values.admin_cpf || undefined,
        })
        toast.success('Escola criada com sucesso!')
      }

      onSuccess?.()
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erro ao salvar escola'))
    } finally {
      setIsSubmitting(false)
    }
  })

  return { form, isLoading, isSubmitting, onSubmit, defaultTrialDays, planos, isCreate: !instituicaoId }
}
