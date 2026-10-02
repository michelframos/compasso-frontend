import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { impersonateInstituicaoUser, stopImpersonation } from '../api/platform'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { getErrorMessage } from '@/shared/lib/utils'
import type { AuthUser, Instituicao } from '@/modules/core/types'

const toAuthUser = (user: { id: number; nome: string; email: string; role?: string; is_super_admin?: boolean }): AuthUser => ({
  id: user.id,
  nome: user.nome,
  name: user.nome,
  email: user.email,
  role: user.role,
  is_super_admin: user.is_super_admin,
})

export const useImpersonation = () => {
  const navigate = useNavigate()
  const startImpersonation = useAuthStore((s) => s.startImpersonation)
  const restorePlatformSession = useAuthStore((s) => s.restorePlatformSession)
  const impersonation = useAuthStore((s) => s.impersonation)
  const user = useAuthStore((s) => s.user)
  const tenant = useAuthStore((s) => s.tenant)
  const [isStarting, setIsStarting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)

  const enterAsUser = useCallback(async (instituicaoId: number, userId: number) => {
    const { token: superAdminToken, user: superAdminUser } = useAuthStore.getState()
    if (!superAdminToken || !superAdminUser) {
      toast.error('Sessão de super-admin não encontrada.')
      return
    }

    setIsStarting(true)
    try {
      const data = await impersonateInstituicaoUser(instituicaoId, userId)

      startImpersonation({
        user: toAuthUser(data.user),
        token: data.token,
        tenant: data.tenant as Instituicao,
        superAdminToken,
        superAdminUser,
        logId: data.impersonation.log_id,
      })

      toast.success(`Acessando como ${data.user.nome}`)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Não foi possível entrar como este usuário.'))
    } finally {
      setIsStarting(false)
    }
  }, [navigate, startImpersonation])

  const exitImpersonation = useCallback(async () => {
    setIsStopping(true)
    try {
      const data = await stopImpersonation()
      restorePlatformSession(toAuthUser(data.user), data.token)
      toast.success('Sessão de suporte encerrada.')
      navigate('/platform/instituicoes', { replace: true })
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Não foi possível encerrar o modo suporte.'))
    } finally {
      setIsStopping(false)
    }
  }, [navigate, restorePlatformSession])

  return {
    impersonation,
    user,
    tenant,
    isStarting,
    isStopping,
    enterAsUser,
    exitImpersonation,
    isImpersonating: !!impersonation?.active,
  }
}
