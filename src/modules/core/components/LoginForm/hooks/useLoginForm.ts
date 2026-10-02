import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { login, normalizeInstituicoes, platformLogin } from '@/modules/core/api/auth'
import { useState, type ChangeEvent } from 'react'
import type { AxiosError } from 'axios'
import type { LoginErrorResponse } from '@/modules/core/types'
import { formatCnpj, unmaskCnpj } from '@/shared/lib/utils'

export type LoginMode = 'escola' | 'platform'

const credenciaisSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

const escolaSchema = credenciaisSchema.extend({
  cnpj: z
    .string()
    .min(1, 'Informe o CNPJ da escola')
    .refine((value) => unmaskCnpj(value).length === 14, 'CNPJ deve ter 14 caracteres'),
})

const platformSchema = credenciaisSchema.extend({
  cnpj: z.string(),
})

type LoginFormValues = z.infer<typeof escolaSchema>

export const useLoginForm = (mode: LoginMode = 'escola') => {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(mode === 'escola' ? escolaSchema : platformSchema),
    defaultValues: {
      cnpj: '',
      email: '',
      password: '',
    },
  })

  const registerCnpj = (name: 'cnpj') =>
    form.register(name, {
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        form.setValue(name, formatCnpj(event.target.value))
      },
    })

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = mode === 'escola'
        ? await login({
          email: values.email,
          password: values.password,
          tenant_cnpj: unmaskCnpj(values.cnpj),
        })
        : await platformLogin({ email: values.email, password: values.password })

      const userData = response.data
      const tenant = response.tenant ?? null
      const tenants = normalizeInstituicoes(response.tenants)

      const user = {
        ...userData,
        name: userData.nome,
        is_super_admin: Boolean(userData.is_super_admin),
      }

      setAuth(user, response.token, tenant, tenants)

      navigate(mode === 'platform' ? '/platform' : '/')
    } catch (err) {
      const axiosError = err as AxiosError<LoginErrorResponse>
      const responseData = axiosError.response?.data

      const cnpjError = responseData?.errors?.tenant_cnpj?.[0]
      if (cnpjError) {
        form.setError('cnpj', { message: cnpjError })
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

  return {
    form,
    registerCnpj,
    onSubmit,
    isLoading,
    error,
  }
}
