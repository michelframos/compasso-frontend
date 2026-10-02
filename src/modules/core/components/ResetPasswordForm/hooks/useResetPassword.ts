import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import { resetPassword } from '@/modules/core/api/auth'
import { useNavigate } from 'react-router-dom'

const resetPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
  token: z.string().length(6, 'O código deve ter 6 dígitos'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'As senhas não coincidem',
  path: ['password_confirmation'],
})

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

export const useResetPassword = (initialEmail: string = '') => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: initialEmail,
      token: '',
      password: '',
      password_confirmation: '',
    },
  })

  const onSubmit = async (values: ResetPasswordValues) => {
    setIsLoading(true)

    try {
      const response = await resetPassword(values)
      toast.success(response.message || 'Senha redefinida com sucesso! Você já pode fazer login.')
      navigate('/login')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erro ao redefinir a senha. O código pode ser inválido.'))
    } finally {
      setIsLoading(false)
    }
  }

  return {
    form,
    onSubmit,
    isLoading,
  }
}
