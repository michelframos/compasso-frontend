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
  ClipboardCheck,
  Award,
  Star,
  Music,
  Shield,
  CircleUserRound,
  TrendingUp,
  Wallet,
  CalendarClock,
  CalendarOff,
  CalendarPlus,
  Megaphone,
  BookOpen,
  Wrench,
  Ticket,
  QrCode,
  Percent,
  LayoutTemplate,
  BarChart3,
} from 'lucide-react'
import {
  isLayoutMenuGroup,
  type LayoutMenuItem,
  type LayoutMenuLeaf,
  type LayoutNavEntry,
} from './layoutTypes'
import { getHomePath } from '@/shared/lib/homePath'

function leafVisivel(
  item: LayoutMenuLeaf,
  role: string | undefined,
  modulos: string[],
): boolean {
  if (item.roles) {
    const adminOk = role === 'admin' && !item.somenteRoles
    const roleOk = adminOk || (role != null && item.roles.includes(role))
    if (!roleOk) return false
  }
  if (item.modulo && !modulos.includes(item.modulo)) {
    return false
  }
  return true
}

function grupoVisivel(
  entry: LayoutNavEntry,
  role: string | undefined,
  modulos: string[],
): boolean {
  if (isLayoutMenuGroup(entry)) {
    if (entry.roles) {
      const adminOk = role === 'admin'
      const roleOk = adminOk || (role != null && entry.roles.includes(role))
      if (!roleOk) return false
    }
    if (entry.modulo && !modulos.includes(entry.modulo)) {
      return false
    }
    return entry.children.some((child) => leafVisivel(child, role, modulos))
  }
  return leafVisivel(entry, role, modulos)
}

function filtrarNav(
  entries: LayoutNavEntry[],
  role: string | undefined,
  modulos: string[],
): LayoutNavEntry[] {
  return entries
    .filter((entry) => grupoVisivel(entry, role, modulos))
    .map((entry) => {
      if (!isLayoutMenuGroup(entry)) return entry
      return {
        ...entry,
        children: entry.children.filter((child) => leafVisivel(child, role, modulos)),
      }
    })
    .filter((entry) => !isLayoutMenuGroup(entry) || entry.children.length > 0)
}

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

      navigate(getHomePath(user.role), { replace: true })
    } catch {
      // Erro tratado silenciosamente; usuário pode tentar novamente
    } finally {
      setIsSwitching(false)
    }
  }

  const allNavEntries: LayoutNavEntry[] = [
    { icon: LayoutDashboard, path: '/dashboard', label: 'Início', roles: ['admin', 'secretaria'] },
    {
      icon: LayoutDashboard,
      path: '/professor/inicio',
      label: 'Início',
      roles: ['professor'],
      somenteRoles: true,
    },
    { icon: ClipboardList, path: '/agenda', label: 'Agenda', roles: ['admin', 'secretaria', 'professor'] },
    {
      id: 'pessoas',
      label: 'Pessoas',
      icon: Users,
      children: [
        { icon: Users, path: '/leads', label: 'Leads', roles: ['admin', 'secretaria'], modulo: 'leads' },
        { icon: Users, path: '/alunos', label: 'Alunos', roles: ['admin', 'secretaria'] },
        { icon: UserRoundPen, path: '/professores', label: 'Professores', roles: ['admin', 'secretaria'] },
        { icon: Wallet, path: '/remuneracao', label: 'Remuneração', roles: ['admin'] },
      ],
    },
    {
      id: 'academico',
      label: 'Acadêmico',
      icon: BookOpen,
      children: [
        { icon: NotebookText, path: '/cursos', label: 'Cursos', roles: ['admin', 'secretaria'] },
        { icon: Layers, path: '/niveis', label: 'Níveis', roles: ['admin', 'secretaria'] },
        { icon: GraduationCap, path: '/turmas', label: 'Turmas', roles: ['admin', 'secretaria'] },
        { icon: ClipboardList, path: '/matriculas', label: 'Matrículas', roles: ['admin', 'secretaria'] },
        { icon: Award, path: '/certificados', label: 'Certificados', roles: ['admin', 'secretaria'] },
        {
          icon: TrendingUp,
          path: '/progressoes',
          label: 'Progressões',
          roles: ['admin', 'secretaria'],
          modulo: 'progressao',
        },
      ],
    },
    {
      id: 'minha-area',
      label: 'Minha área',
      icon: GraduationCap,
      roles: ['professor'],
      children: [
        {
          icon: GraduationCap,
          path: '/professor/turmas',
          label: 'Minhas turmas',
          roles: ['professor'],
          somenteRoles: true,
        },
        {
          icon: Users,
          path: '/professor/alunos',
          label: 'Meus alunos',
          roles: ['professor'],
          somenteRoles: true,
        },
        {
          icon: ClipboardCheck,
          path: '/professor/frequencia',
          label: 'Frequência',
          roles: ['professor'],
          somenteRoles: true,
        },
        {
          icon: Mic2,
          path: '/professor/apresentacoes',
          label: 'Apresentações',
          roles: ['professor'],
          somenteRoles: true,
          modulo: 'espetaculos',
        },
        {
          icon: Wallet,
          path: '/professor/ganhos',
          label: 'Meus ganhos',
          roles: ['professor'],
          somenteRoles: true,
        },
        {
          icon: CalendarClock,
          path: '/professor/solicitacoes',
          label: 'Solicitações',
          roles: ['professor'],
          somenteRoles: true,
        },
        {
          icon: Megaphone,
          path: '/professor/avisos',
          label: 'Avisos',
          roles: ['professor'],
          somenteRoles: true,
        },
      ],
    },
    {
      id: 'operacoes',
      label: 'Operações',
      icon: Wrench,
      children: [
        {
          icon: CalendarOff,
          path: '/justificativas-faltas',
          label: 'Justificativas',
          roles: ['admin', 'secretaria', 'professor'],
        },
        {
          icon: CalendarPlus,
          path: '/solicitacoes-reposicoes',
          label: 'Reposições',
          roles: ['admin', 'secretaria', 'professor'],
        },
        {
          icon: CalendarClock,
          path: '/solicitacoes-aulas',
          label: 'Solicitações de aula',
          roles: ['admin', 'secretaria'],
        },
        { icon: Megaphone, path: '/avisos', label: 'Avisos', roles: ['admin', 'secretaria'] },
      ],
    },
    {
      id: 'espetaculos',
      label: 'Espetáculos',
      icon: Star,
      modulo: 'espetaculos',
      children: [
        {
          icon: Star,
          path: '/espetaculos',
          label: 'Espetáculos',
          roles: ['admin', 'secretaria'],
          modulo: 'espetaculos',
        },
        {
          icon: Mic2,
          path: '/apresentacoes',
          label: 'Apresentações',
          roles: ['admin', 'secretaria'],
          modulo: 'espetaculos',
        },
      ],
    },
    {
      id: 'bilheteria',
      label: 'Bilheteria',
      icon: Ticket,
      modulo: 'bilheteria',
      roles: ['admin', 'secretaria'],
      children: [
        {
          icon: Ticket,
          path: '/bilheteria',
          label: 'Ingressos',
          roles: ['admin', 'secretaria'],
          modulo: 'bilheteria',
        },
        {
          icon: QrCode,
          path: '/bilheteria/validacao',
          label: 'Validação',
          roles: ['admin', 'secretaria'],
          modulo: 'bilheteria',
        },
        {
          icon: Percent,
          path: '/bilheteria/cupons',
          label: 'Cupons',
          roles: ['admin', 'secretaria'],
          modulo: 'bilheteria',
        },
        {
          icon: LayoutTemplate,
          path: '/bilheteria/templates',
          label: 'Templates',
          roles: ['admin', 'secretaria'],
          modulo: 'bilheteria',
        },
        {
          icon: BarChart3,
          path: '/bilheteria/relatorios',
          label: 'Relatórios',
          roles: ['admin', 'secretaria'],
          modulo: 'bilheteria',
        },
      ],
    },
    {
      icon: Music,
      path: '/instrumentos',
      label: 'Instrumentos',
      roles: ['admin', 'secretaria'],
      modulo: 'instrumentos',
    },
    {
      icon: CreditCard,
      path: '/financeiro',
      label: 'Financeiro',
      roles: ['admin', 'secretaria'],
      modulo: 'financeiro',
    },
  ]

  const navEntries = filtrarNav(allNavEntries, user?.role, tenant?.modulos ?? [])

  const bottomMenuItems: LayoutMenuItem[] = [
    ...(user?.is_super_admin
      ? [{ icon: Shield, path: '/platform', label: 'Plataforma' }]
      : []),
    { icon: CircleUserRound, path: '/meu-perfil', label: 'Meu perfil' },
    ...(user?.role === 'admin' || user?.role === 'secretaria'
      ? [{ icon: Settings, path: '/configuracoes', label: 'Configurações' }]
      : []),
  ]

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    if (path === '/dashboard') return location.pathname === '/dashboard' || location.pathname === '/'
    if (path === '/bilheteria') {
      return (
        location.pathname === '/bilheteria' ||
        location.pathname.startsWith('/bilheteria/espetaculos/')
      )
    }
    return location.pathname.startsWith(path)
  }

  return {
    user,
    tenant,
    tenants,
    isSwitching,
    handleLogout,
    handleSwitchTenant,
    navEntries,
    bottomMenuItems,
    isActive,
    isCollapsed,
    toggleSidebar,
    showTenantSelector: tenants.length > 0,
    showTopNav: user?.role === 'admin' || user?.role === 'secretaria',
    homePath: '/',
    perfilPath: '/meu-perfil' as string | null,
    headerSubtitle: tenant?.nome_fantasia,
  }
}
