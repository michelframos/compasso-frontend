import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '@/shared/store/useAuthStore'
import {
  alunoLogin,
  login,
  normalizeInstituicoes,
  platformLogin,
  reenviarCodigoAtivacao,
} from '@/modules/core/api/auth'
import { useState, type ChangeEvent } from 'react'
import type { AxiosError } from 'axios'
import type { Instituicao, LoginErrorResponse, LoginLocationState } from '@/modules/core/types'
import { formatCnpj, getErrorMessage, unmaskCnpj } from '@/shared/lib/utils'
import { getHomePath } from '@/shared/lib/homePath'

export type LoginMode = 'escola' | 'platform' | 'aluno' | 'bilheteria'

const credenciaisSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  activation_code: z.string().optional(),
})

const escolaSchema = credenciaisSchema.extend({
  cnpj: z
    .string()
    .min(1, 'Informe o CNPJ da escola')
    .refine((value) => unmaskCnpj(value).length === 14, 'CNPJ deve ter 14 caracteres'),
})

const simplesSchema = credenciaisSchema.extend({
  cnpj: z.string(),
})

type LoginFormValues = z.infer<typeof escolaSchema>

export const useLoginForm = (mode: LoginMode = 'escola') => {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = (location.state ?? null) as LoginLocationState | null
  const setAuth = useAuthStore((state) => state.setAuth)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [needsActivation, setNeedsActivation] = useState(
    (mode === 'escola' || mode === 'bilheteria') && Boolean(locationState?.aguardandoAtivacao),
  )
  const [escolasPendentes, setEscolasPendentes] = useState<Instituicao[]>([])

  const usaCnpj = mode === 'escola' || mode === 'bilheteria'

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(usaCnpj ? escolaSchema : simplesSchema),
    defaultValues: {
      cnpj: usaCnpj ? (locationState?.cnpj ?? '') : '',
      email: locationState?.email ?? '',
      password: '',
      activation_code: '',
    },
  })

  const registerCnpj = (name: 'cnpj') =>
    form.register(name, {
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        form.setValue(name, formatCnpj(event.target.value))
      },
    })

  const registerActivationCode = (name: 'activation_code') =>
    form.register(name, {
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        form.setValue(name, event.target.value.replace(/\D/g, '').slice(0, 6))
      },
    })

  const concluirLogin = (
    response: Awaited<ReturnType<typeof login>>,
    destino: string,
  ) => {
    const userData = response.data
    const tenant = response.tenant ?? null
    const tenants = normalizeInstituicoes(response.tenants)

    const user = {
      ...userData,
      name: userData.nome,
      is_super_admin: Boolean(userData.is_super_admin),
    }

    setAuth(user, response.token, tenant, tenants)
    navigate(destino, { replace: true, state: null })
  }

  const autenticar = async (values: LoginFormValues, tenantSlug?: string) => {
    const activationCode = values.activation_code?.trim() ?? ''

    if (needsActivation && activationCode.length !== 6) {
      form.setError('activation_code', { message: 'Informe o código de 6 dígitos enviado por e-mail' })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      if (mode === 'aluno') {
        const response = await alunoLogin({
          email: values.email,
          password: values.password,
          tenant_slug: tenantSlug,
        })
        concluirLogin(response, getHomePath(response.data.role))
        return
      }

      if (mode === 'bilheteria') {
        const response = await login({
          email: values.email,
          password: values.password,
          tenant_cnpj: unmaskCnpj(values.cnpj),
          activation_code: needsActivation ? activationCode : undefined,
        })
        const role = response.data.role
        const modulos = response.tenant?.modulos ?? []
        if (!['secretaria', 'admin'].includes(role) || !modulos.includes('bilheteria')) {
          setError('Este usuário não tem acesso ao Painel de Gestão de Ingressos.')
          return
        }
        concluirLogin(response, '/bilheteria')
        return
      }

      const response = mode === 'escola'
        ? await login({
          email: values.email,
          password: values.password,
          tenant_cnpj: unmaskCnpj(values.cnpj),
          activation_code: needsActivation ? activationCode : undefined,
        })
        : await platformLogin({ email: values.email, password: values.password })

      concluirLogin(
        response,
        mode === 'platform' ? '/platform' : getHomePath(response.data.role),
      )
    } catch (err) {
      const axiosError = err as AxiosError<LoginErrorResponse>
      const responseData = axiosError.response?.data

      if (mode === 'aluno' && responseData?.code === 'needs_tenant_selection') {
        const tenants = normalizeInstituicoes(responseData.tenants)
        setEscolasPendentes(tenants)
        setError(responseData.message ?? 'Selecione a escola para continuar.')
        return
      }

      if (responseData?.code === 'activation_required') {
        setNeedsActivation(true)
        setError(responseData.message ?? 'Informe o código de ativação enviado para o seu e-mail.')
        return
      }

      const cnpjError = responseData?.errors?.tenant_cnpj?.[0]
      if (cnpjError) {
        form.setError('cnpj', { message: cnpjError })
      }

      const activationError = responseData?.errors?.activation_code?.[0]
      if (activationError) {
        form.setError('activation_code', { message: activationError })
      }

      setError(
        responseData?.message
          || axiosError.message
          || 'Erro ao realizar login. Verifique suas credenciais.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (values: LoginFormValues) => {
    await autenticar(values)
  }

  const selecionarEscola = (slug: string) => {
    void autenticar(form.getValues(), slug)
  }

  const onResendCode = async () => {
    const valido = await form.trigger(['cnpj', 'email', 'password'])
    if (!valido) {
      setError('Informe CNPJ, e-mail e senha para reenviar o código.')
      return
    }

    const { cnpj, email, password } = form.getValues()

    setIsResending(true)
    setError(null)

    try {
      const response = await reenviarCodigoAtivacao({
        email,
        password,
        tenant_cnpj: unmaskCnpj(cnpj),
      })
      toast.success(response.message)
    } catch (err) {
      const axiosError = err as AxiosError<LoginErrorResponse>
      if (axiosError.response?.data?.code === 'already_activated') {
        setNeedsActivation(false)
        form.setValue('activation_code', '')
      }
      setError(getErrorMessage(err, 'Não foi possível reenviar o código.'))
    } finally {
      setIsResending(false)
    }
  }

  return {
    form,
    registerCnpj,
    registerActivationCode,
    onSubmit,
    onResendCode,
    selecionarEscola,
    isLoading,
    isResending,
    needsActivation,
    escolasPendentes,
    error,
  }
}
