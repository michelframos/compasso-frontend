import { useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import { registrarEscola } from '@/modules/core/api/auth'
import type { LoginErrorResponse, LoginLocationState } from '@/modules/core/types'
import { formatCnpj, unmaskCnpj } from '@/shared/lib/utils'

const criarContaSchema = z
  .object({
    nome_fantasia: z.string().trim().min(1, 'Informe o nome da escola'),
    cnpj: z
      .string()
      .min(1, 'Informe o CNPJ da escola')
      .refine((value) => unmaskCnpj(value).length === 14, 'CNPJ deve ter 14 caracteres'),
    responsavel_nome: z.string().trim().min(1, 'Informe o nome do responsável'),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    password_confirmation: z.string().min(1, 'Confirme a senha'),
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ['password_confirmation'],
    message: 'As senhas não coincidem',
  })

export type CriarContaFormValues = z.infer<typeof criarContaSchema>

export const useCriarContaForm = () => {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<CriarContaFormValues>({
    resolver: zodResolver(criarContaSchema),
    defaultValues: {
      nome_fantasia: '',
      cnpj: '',
      responsavel_nome: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  })

  const registerCnpj = (name: 'cnpj') =>
    form.register(name, {
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        form.setValue(name, formatCnpj(event.target.value))
      },
    })

  const onSubmit = async (values: CriarContaFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await registrarEscola({
        ...values,
        nome_fantasia: values.nome_fantasia.trim(),
        responsavel_nome: values.responsavel_nome.trim(),
        email: values.email.trim(),
        cnpj: unmaskCnpj(values.cnpj),
      })

      if (response.email_enviado) {
        toast.success(response.message)
      } else {
        toast.warning(response.message)
      }

      const state: LoginLocationState = {
        cnpj: values.cnpj,
        email: values.email.trim(),
        aguardandoAtivacao: true,
      }

      navigate('/login', { state })
    } catch (err) {
      const axiosError = err as AxiosError<LoginErrorResponse>
      const responseData = axiosError.response?.data
      const fieldErrors = responseData?.errors ?? {}

      const campos: Array<keyof CriarContaFormValues> = [
        'nome_fantasia',
        'cnpj',
        'responsavel_nome',
        'email',
        'password',
      ]

      campos.forEach((campo) => {
        const message = fieldErrors[campo]?.[0]
        if (message) {
          form.setError(campo, { message })
        }
      })

      setError(
        responseData?.message
          || axiosError.message
          || 'Não foi possível criar a conta. Tente novamente.',
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
