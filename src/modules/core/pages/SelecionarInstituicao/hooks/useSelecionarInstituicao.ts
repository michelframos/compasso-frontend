import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { switchInstituicao, normalizeInstituicoes } from '@/modules/core/api/auth'
import type { Instituicao } from '@/modules/core/types'

export const useSelecionarInstituicao = () => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const tenant = useAuthStore((state) => state.tenant)
  const tenants = useAuthStore((state) => state.tenants)
  const setAuth = useAuthStore((state) => state.setAuth)
  const [error, setError] = useState<string | null>(null)
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || tenants.length === 0) {
      navigate('/login', { replace: true })
      return
    }

    if (tenant) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, tenant, tenants.length, navigate])

  const handleSelect = async (instituicao: Instituicao) => {
    if (!isAuthenticated || !user) {
      navigate('/login', { replace: true })
      return
    }

    setLoadingSlug(instituicao.slug)
    setError(null)

    try {
      const result = await switchInstituicao(instituicao.slug)
      const allTenants = normalizeInstituicoes(result.tenants)

      setAuth(
        user,
        result.token,
        result.tenant,
        allTenants.length > 0 ? allTenants : tenants,
      )

      navigate('/', { replace: true })
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(message || 'Não foi possível acessar esta instituição.')
    } finally {
      setLoadingSlug(null)
    }
  }

  return {
    tenants,
    error,
    loadingSlug,
    handleSelect,
  }
}
