import { useEffect } from 'react'
import { listMinhasInstituicoes } from '@/modules/core/api/auth'
import { useAuthStore } from '@/shared/store/useAuthStore'

/**
 * O tenant fica persistido desde o login; ao abrir o app, recarrega os módulos ativos
 * para refletir mudanças de plano ou de configuração feitas depois disso.
 */
export const useSincronizarTenant = (habilitado: boolean) => {
  const tenantId = useAuthStore((s) => s.tenant?.id)

  useEffect(() => {
    if (!habilitado || !tenantId) return
    let cancelled = false

    listMinhasInstituicoes()
      .then((instituicoes) => {
        if (cancelled) return
        const { tenant, setTenant, setTenants } = useAuthStore.getState()
        const atual = instituicoes.find((i) => i.id === tenant?.id)
        if (!tenant || !atual) return

        setTenant({ ...tenant, ...atual })
        setTenants(instituicoes)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [habilitado, tenantId])
}
