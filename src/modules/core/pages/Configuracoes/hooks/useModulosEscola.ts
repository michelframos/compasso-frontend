import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { alterarModuloEscola, listModulosEscola } from '../../../api/modulosEscola'
import type { ModuloAppKey, ModuloEscola } from '../../../types'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { getErrorMessage } from '@/shared/lib/utils'

export const useModulosEscola = () => {
  const [modulos, setModulos] = useState<ModuloEscola[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [alterando, setAlterando] = useState<ModuloAppKey | null>(null)

  useEffect(() => {
    let cancelled = false

    listModulosEscola()
      .then((resposta) => {
        if (!cancelled) setModulos(resposta.data)
      })
      .catch((err) => {
        if (!cancelled) toast.error(getErrorMessage(err, 'Não foi possível carregar os módulos.'))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  /** Atualiza o tenant em memória para que menu e telas reflitam a mudança sem novo login. */
  const sincronizarTenant = (ativos: ModuloAppKey[]) => {
    const { tenant, tenants, setTenant, setTenants } = useAuthStore.getState()
    if (!tenant) return

    setTenant({ ...tenant, modulos: ativos })
    setTenants(tenants.map((t) => (t.id === tenant.id ? { ...t, modulos: ativos } : t)))
  }

  const alternar = async (modulo: ModuloEscola, ativo: boolean) => {
    setAlterando(modulo.key)

    try {
      const resposta = await alterarModuloEscola(modulo.key, ativo)
      setModulos(resposta.data)
      sincronizarTenant(resposta.meta.modulos_ativos)
      toast.success(`${modulo.label} ${ativo ? 'ativado' : 'desativado'}.`)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível alterar o módulo.'))
    } finally {
      setAlterando(null)
    }
  }

  return { modulos, isLoading, alterando, alternar }
}
