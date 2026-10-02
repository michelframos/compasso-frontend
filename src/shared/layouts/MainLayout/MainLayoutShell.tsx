import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { ImpersonationBanner } from '@/shared/components/ImpersonationBanner'
import { TrialBanner } from '@/shared/components/TrialBanner'
import { useHasModulo } from '@/shared/hooks/useHasModulo'
import {
  LogOut,
  Search,
  Bell,
  Music2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { MobileMenu } from './components/MobileMenu'
import { TenantSelector } from './components/TenantSelector'
import type { useMainLayout } from './hooks/useMainLayout'

type LayoutState = ReturnType<typeof useMainLayout>

interface MainLayoutShellProps {
  layout: LayoutState
  children: React.ReactNode
}

export const MainLayoutShell: React.FC<MainLayoutShellProps> = ({ layout, children }) => {
  const {
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
    showTenantSelector,
    showTopNav,
    homePath,
    headerSubtitle,
  } = layout

  const hasFinanceiro = useHasModulo('financeiro')
  const hasRelatorios = useHasModulo('relatorios')

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden print:h-auto print:overflow-visible print:block">
      <aside
        className={`${isCollapsed ? 'w-16' : 'w-64'
          } hidden md:flex bg-white border-r border-zinc-200 flex-col transition-all duration-300 ease-in-out z-20 relative shadow-sm print:hidden`}
      >
        <div className={`py-6 flex flex-col flex-1 overflow-y-auto custom-scrollbar ${isCollapsed ? 'items-center overflow-x-hidden' : 'items-stretch px-4'}`}>
          <div className={`flex items-center mb-10 shrink-0 ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
            <Link to={homePath} className="p-2 bg-indigo-600 rounded-full text-white shadow-lg shadow-indigo-100 flex items-center justify-center shrink-0">
              <Music2 className="w-6 h-6" />
            </Link>
            {!isCollapsed && (
              <span className="ml-3 font-bold text-lg text-zinc-900 truncate">Compasso</span>
            )}
          </div>

          <nav className="flex-1 flex flex-col gap-1.5">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 p-2.5 rounded-full transition-all duration-200 group relative ${isActive(item.path)
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'text-zinc-500 hover:text-indigo-600 hover:bg-zinc-50'
                  }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive(item.path) ? 'text-white' : ''}`} />
                {!isCollapsed && (
                  <span className="text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300">
                    {item.label}
                  </span>
                )}
                {isCollapsed && (
                  <span className="absolute left-full ml-4 px-2.5 py-1.5 bg-zinc-900 text-white text-[11px] font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-all transform translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap shadow-xl">
                    {item.label}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-1.5 pt-4 border-t border-zinc-100 shrink-0">
            {bottomMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 p-2.5 rounded-xl text-zinc-500 hover:text-indigo-600 hover:bg-zinc-50 transition-all group relative"
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
                    {item.label}
                  </span>
                )}
              </Link>
            ))}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="flex items-center gap-3 px-2.5 h-10 rounded-xl text-zinc-500 hover:text-rose-600 hover:bg-rose-50 transition-all justify-start w-full hover:cursor-pointer"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium">Sair</span>
              )}
            </Button>
          </div>
        </div>

        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 bg-white border border-zinc-200 rounded-full p-1 shadow-sm hover:bg-zinc-50 hover:text-indigo-600 transition-all z-30 hover:cursor-pointer print:hidden"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </aside>

      <div className="flex-1 flex flex-col relative overflow-hidden print:block print:overflow-visible">
        <ImpersonationBanner />
        <TrialBanner />
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200 flex items-center justify-between px-4 md:px-6 z-10 sticky top-0 shrink-0 print:hidden">
          <div className="flex items-center gap-4 md:gap-10 flex-1">
            <MobileMenu layout={layout} />

            <div className="flex items-center gap-5">
              {showTopNav && (
                <nav className="hidden lg:flex items-center gap-6">
                  <Link to="/" className={`text-sm font-medium transition-colors border-b-2 pb-1 ${isActive('/dashboard') ? 'text-zinc-900 border-indigo-600 font-bold' : 'text-zinc-500 border-transparent hover:text-indigo-600'}`}>Dashboard</Link>
                  {hasFinanceiro && (
                    <Link to="/contratos" className={`text-sm font-medium transition-colors border-b-2 pb-1 ${isActive('/contratos') ? 'text-zinc-900 border-indigo-600 font-bold' : 'text-zinc-500 border-transparent hover:text-indigo-600'}`}>Contratos</Link>
                  )}
                  {hasRelatorios && (
                    <Link to="/relatorios" className={`text-sm font-medium transition-colors border-b-2 pb-1 ${isActive('/relatorios') ? 'text-zinc-900 border-indigo-600 font-bold' : 'text-zinc-500 border-transparent hover:text-indigo-600'}`}>Relatórios</Link>
                  )}
                </nav>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            {showTenantSelector && (
              <TenantSelector
                tenantSlug={tenant?.slug}
                tenants={tenants}
                isSwitching={isSwitching}
                onSwitch={handleSwitchTenant}
              />
            )}

            <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 group-focus-within:text-indigo-600 transition-colors" />
              <Input
                placeholder="Buscar..."
                className="w-56 h-9 pl-9 rounded-full border-none bg-zinc-100 focus-visible:ring-indigo-600 focus-visible:bg-white transition-all shadow-none text-sm"
              />
            </div>

            <Button variant="ghost" size="icon" className="text-zinc-500 hover:bg-zinc-100 rounded-full h-9 w-9 hover:cursor-pointer">
              <Bell className="w-4.5 h-4.5" />
            </Button>

            <div className="h-6 w-[1px] bg-zinc-200 mx-1 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-zinc-900 leading-none">{user?.name}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5 capitalize">
                  {headerSubtitle || user?.role || 'Usuário'}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-indigo-100 border-2 border-white overflow-hidden shadow-sm">
                <img
                  src={`https://ui-avatars.com/api/?name=${user?.name}&background=4f46e5&color=fff`}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-zinc-50/50 min-h-0 print:p-0 print:bg-white print:overflow-visible">
          {children}
        </main>
      </div>
    </div>
  )
}
