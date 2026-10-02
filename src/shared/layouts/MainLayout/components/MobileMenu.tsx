import React from 'react'
import { Link } from 'react-router-dom'
import { Menu, Music2, LogOut } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/shared/components/ui/sheet'
import { Button } from '@/shared/components/ui/button'
import { TenantSelector } from './TenantSelector'
import type { useMainLayout } from '../hooks/useMainLayout'

type LayoutState = ReturnType<typeof useMainLayout>

interface MobileMenuProps {
  layout: LayoutState
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ layout }) => {
  const {
    menuItems,
    bottomMenuItems,
    isActive,
    tenant,
    tenants,
    isSwitching,
    handleSwitchTenant,
    handleLogout,
    showTenantSelector,
  } = layout

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 hover:cursor-pointer">
          <Menu className="w-5 h-5 text-zinc-600" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-zinc-100 flex-row items-center gap-3 space-y-0">
          <div className="p-2 bg-indigo-600 rounded-full text-white shadow-lg shadow-indigo-100 flex items-center justify-center shrink-0">
            <Music2 className="w-6 h-6" />
          </div>
          <SheetTitle className="font-bold text-lg text-zinc-900">Compasso</SheetTitle>
        </SheetHeader>

        {showTenantSelector && tenants.length > 1 && (
          <div className="px-4 pt-2">
            <TenantSelector
              tenantSlug={tenant?.slug}
              tenants={tenants}
              isSwitching={isSwitching}
              onSwitch={handleSwitchTenant}
              compact
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-1.5">
          <nav className="flex flex-col gap-1.5">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-full transition-all duration-200 ${isActive(item.path)
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                    : 'text-zinc-500 hover:text-indigo-600 hover:bg-zinc-50'
                  }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive(item.path) ? 'text-white' : ''}`} />
                <span className="text-sm font-medium">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-4 border-t border-zinc-100 flex flex-col gap-1.5">
            {bottomMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 p-3 rounded-xl text-zinc-500 hover:text-indigo-600 hover:bg-zinc-50 transition-all"
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">
                  {item.label}
                </span>
              </Link>
            ))}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 h-10 rounded-xl text-zinc-500 hover:text-rose-600 hover:bg-rose-50 transition-all justify-start w-full hover:cursor-pointer"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">Sair</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
