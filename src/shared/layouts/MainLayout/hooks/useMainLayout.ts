import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { useLayoutStore } from '@/shared/store/useLayoutStore'
import { logout as logoutApi, switchInstituicao, normalizeInstituicoes } from '@/modules/core/api/auth'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Mic2,
  CreditCard,
  Settings,
  UserRoundPen,
  NotebookText,
  Layers,
  ClipboardList,
  Star,
  Music,
  Shield,
} from 'lucide-react'
import type { LayoutMenuItem } from './layoutTypes'

export const useMainLayout = () => {
  const { user, tenant, tenants, setAuth, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { isCollapsed, toggleSidebar } = useLayoutStore()
  const [isSwitching, setIsSwitching] = useState(false)

  const handleLogout = async () => {
    try {
      await logoutApi()
    } catch {
      // Ignora falha de rede — estado local será limpo de qualquer forma
    } finally {
      clearAuth()
      navigate('/login', { replace: true })
    }
  }

  const handleSwitchTenant = async (slug: string) => {
    if (!user || slug === tenant?.slug) {
      return
    }

    setIsSwitching(true)

    try {
      const result = await switchInstituicao(slug)
      const updatedTenants = normalizeInstituicoes(result.tenants)

      setAuth(
        user,
        result.token,
        result.tenant,
        updatedTenants.length > 0 ? updatedTenants : tenants,
      )

      navigate('/dashboard', { replace: true })
    } catch {
      // Erro tratado silenciosamente; usuário pode tentar novamente
    } finally {
      setIsSwitching(false)
    }
  }

  const allMenuItems: LayoutMenuItem[] = [
    { icon: LayoutDashboard, path: '/dashboard', label: 'Início', roles: ['admin', 'secretaria'] },
    { icon: ClipboardList, path: '/agenda', label: 'Agenda', roles: ['admin', 'secretaria', 'professor'] },
    { icon: Users, path: '/leads', label: 'Leads', roles: ['admin', 'secretaria'], modulo: 'leads' },
    { icon: Users, path: '/alunos', label: 'Alunos', roles: ['admin', 'secretaria'] },
    { icon: UserRoundPen, path: '/professores', label: 'Professores', roles: ['admin', 'secretaria'] },
    { icon: NotebookText, path: '/cursos', label: 'Cursos', roles: ['admin', 'secretaria'] },
    { icon: Layers, path: '/niveis', label: 'Níveis', roles: ['admin', 'secretaria'] },
    { icon: GraduationCap, path: '/turmas', label: 'Turmas', roles: ['admin', 'secretaria', 'professor'] },
    { icon: ClipboardList, path: '/matriculas', label: 'Matrículas', roles: ['admin', 'secretaria'] },
    { icon: Star, path: '/espetaculos', label: 'Espetáculos', roles: ['admin', 'secretaria', 'professor'], modulo: 'espetaculos' },
    { icon: Mic2, path: '/apresentacoes', label: 'Apresentações', roles: ['admin', 'secretaria', 'professor', 'aluno'], modulo: 'espetaculos' },
    { icon: Music, path: '/instrumentos', label: 'Instrumentos', roles: ['admin', 'secretaria'], modulo: 'instrumentos' },
    { icon: CreditCard, path: '/financeiro', label: 'Financeiro', roles: ['admin', 'secretaria'], modulo: 'financeiro' },
  ]


  const menuItems = allMenuItems.filter(item => {
    if (item.roles) {
      const roleOk = user?.role === 'admin' || (user?.role != null && item.roles.includes(user.role))
      if (!roleOk) return false
    }
    if (item.modulo) {
      const allowed = tenant?.modulos ?? []
      if (!allowed.includes(item.modulo)) return false
    }
    return true
  })

  const bottomMenuItems: LayoutMenuItem[] = [
    ...(user?.is_super_admin
      ? [{ icon: Shield, path: '/platform', label: 'Plataforma' }]
      : []),
    { icon: Settings, path: '/configuracoes', label: 'Configurações' },
  ]

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/dashboard') return location.pathname === '/dashboard' || location.pathname === '/';
    return location.pathname.startsWith(path);
  }

  return {
    user,
    tenant,
    tenants,
    isSwitching,
    handleLogout,
    handleSwitchTenant,
    menuItems,
    bottomMenuItems,
    isActive,
    isCollapsed,
    toggleSidebar,
    showTenantSelector: tenants.length > 0,
    showTopNav: user?.role === 'admin' || user?.role === 'secretaria',
    homePath: '/',
    headerSubtitle: tenant?.nome_fantasia,
  }
}
