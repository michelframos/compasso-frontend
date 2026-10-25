import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { alterarSenha } from '@/modules/core/api/auth'
import { getErrorMessage } from '@/shared/lib/utils'

const alterarSenhaSchema = z.object({
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

type AlterarSenhaValues = z.infer<typeof alterarSenhaSchema>

const VAZIO: AlterarSenhaValues = { senha_atual: '', password: '', password_confirmation: '' }

export const useAlterarSenha = () => {
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<AlterarSenhaValues>({
    resolver: zodResolver(alterarSenhaSchema),
    defaultValues: VAZIO,
  })

  const salvar = form.handleSubmit(async (valores) => {
    setIsSaving(true)

    try {
      const resposta = await alterarSenha(valores)
      form.reset(VAZIO)
      toast.success(resposta.message || 'Senha alterada com sucesso.', {
        description: 'Os outros dispositivos conectados foram desconectados.',
      })
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível alterar a senha.'))
    } finally {
      setIsSaving(false)
    }
  })

  return { form, salvar, isSaving }
}
