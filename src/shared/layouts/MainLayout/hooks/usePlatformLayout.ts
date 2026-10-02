import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { useLayoutStore } from '@/shared/store/useLayoutStore'
import { logout as logoutApi } from '@/modules/core/api/auth'
import { Building2, ClipboardList, CreditCard, LayoutDashboard, LayoutGrid, MessageSquareQuote } from 'lucide-react'
import type { LayoutMenuItem } from './layoutTypes'

export const usePlatformLayout = () => {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { isCollapsed, toggleSidebar } = useLayoutStore()

  const handleLogout = async () => {
    try {
      await logoutApi()
    } catch {
      // Ignora falha de rede
    } finally {
      clearAuth()
      navigate('/platform/login', { replace: true })
    }
  }

  const menuItems: LayoutMenuItem[] = [
    { icon: LayoutDashboard, path: '/platform', label: 'Início' },
    { icon: Building2, path: '/platform/instituicoes', label: 'Escolas' },
    { icon: CreditCard, path: '/platform/planos', label: 'Planos' },
    { icon: MessageSquareQuote, path: '/platform/depoimentos', label: 'Depoimentos' },
    { icon: LayoutGrid, path: '/platform/modulos', label: 'Módulos' },
    { icon: ClipboardList, path: '/platform/solicitacoes', label: 'Solicitações' },
  ]

  const bottomMenuItems: LayoutMenuItem[] = []

  const isActive = (path: string) => {
    if (path === '/platform') {
      return location.pathname === '/platform'
    }

    return location.pathname.startsWith(path)
  }

  return {
    user,
    tenant: null,
    tenants: [],
    isSwitching: false,
    handleLogout,
    handleSwitchTenant: async () => undefined,
    menuItems,
    bottomMenuItems,
    isActive,
    isCollapsed,
    toggleSidebar,
    showTenantSelector: false,
    showTopNav: false,
    homePath: '/platform',
    headerSubtitle: 'Plataforma',
  }
}
