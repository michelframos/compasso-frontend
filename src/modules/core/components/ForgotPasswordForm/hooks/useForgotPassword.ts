import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import { forgotPassword } from '@/modules/core/api/auth'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export const useForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (values: ForgotPasswordValues) => {
    setIsLoading(true)
    setSuccess(false)

    try {
      const response = await forgotPassword(values.email)
      toast.success(response.message || 'Código enviado com sucesso!')
      setSuccess(true)
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erro ao solicitar recuperação de senha.'))
    } finally {
      setIsLoading(false)
    }
  }

  return {
    form,
    onSubmit,
    isLoading,
    success,
  }
}
