import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/shared/lib/axios'
import { useAuthStore, type AuthUser as StoreAuthUser } from '@/shared/store/useAuthStore'
import { listMinhasInstituicoes } from '@/modules/core/api/auth'
import type { AuthUser } from '@/modules/core/types'

function parseHandoffParams(): { token: string | null; tenantSlug: string | null } {
  const hash = window.location.hash.replace(/^#/, '')
  const fromHash = new URLSearchParams(hash)
  const fromQuery = new URLSearchParams(window.location.search)

  return {
    token: fromHash.get('token') || fromQuery.get('token'),
    tenantSlug: fromHash.get('tenant') || fromQuery.get('tenant'),
  }
}

export function useAuthCallback() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function completeHandoff() {
      const { token, tenantSlug } = parseHandoffParams()

      // Remove token da URL o quanto antes (histórico / logs)
      window.history.replaceState(null, '', '/auth/callback')

      if (!token) {
        setError('Link de acesso inválido ou expirado.')
        return
      }

      try {
        localStorage.setItem('auth_token', token)
        useAuthStore.setState({ token })

        const { data: userResponse } = await api.get<{ data?: AuthUser } & AuthUser>('/user', {
          headers: { Authorization: `Bearer ${token}` },
        })

        const userData = (userResponse.data ?? userResponse) as AuthUser
        const tenants = await listMinhasInstituicoes()
        const tenant =
          (tenantSlug ? tenants.find((t) => t.slug === tenantSlug) : null) ??
          tenants[0] ??
          null

        if (cancelled) return

        const user: StoreAuthUser = {
          id: userData.id,
          name: userData.nome,
          nome: userData.nome,
          email: userData.email,
          role: userData.role,
          is_super_admin: Boolean(userData.is_super_admin),
        }

        setAuth(user, token, tenant, tenants)
        navigate('/dashboard', { replace: true })
      } catch {
        if (cancelled) return
        clearAuth()
        setError('Não foi possível concluir o acesso. Faça login novamente.')
      }
    }

    void completeHandoff()

    return () => {
      cancelled = true
    }
  }, [setAuth, clearAuth, navigate])

  return { error }
}
