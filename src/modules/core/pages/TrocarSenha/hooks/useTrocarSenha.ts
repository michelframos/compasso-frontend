import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { alterarSenha, logout } from '@/modules/core/api/auth'
import { getHomePath } from '@/shared/lib/homePath'
import { getErrorMessage } from '@/shared/lib/utils'

const trocarSenhaSchema = z.object({
  senha_atual: z.string().min(1, 'Informe a senha atual'),
  password: z.string().min(8, 'A nova senha deve ter pelo menos 8 caracteres'),
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'As senhas não coincidem',
  path: ['password_confirmation'],
}).refine((data) => data.password !== data.senha_atual, {
  message: 'A nova senha deve ser diferente da senha atual',
  path: ['password'],
})

type TrocarSenhaValues = z.infer<typeof trocarSenhaSchema>

export const useTrocarSenha = () => {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<TrocarSenhaValues>({
    resolver: zodResolver(trocarSenhaSchema),
    defaultValues: { senha_atual: '', password: '', password_confirmation: '' },
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const onSubmit = async (values: TrocarSenhaValues) => {
    setIsLoading(true)

    try {
      const response = await alterarSenha(values)
      updateUser({ deve_trocar_senha: false })
      toast.success(response.message || 'Senha alterada com sucesso!')
      navigate(getHomePath(user?.role), { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível alterar a senha.'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSair = async () => {
    try {
      await logout()
    } catch {
      // Estado local é limpo mesmo se a requisição falhar
    } finally {
      clearAuth()
      navigate('/login', { replace: true })
    }
  }

  return {
    form,
    onSubmit,
    isLoading,
    handleSair,
    nome: user?.nome ?? user?.name,
  }
}
