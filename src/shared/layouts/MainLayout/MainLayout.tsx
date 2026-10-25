import React from 'react'
import { Outlet } from 'react-router-dom'
import { LayoutModeProvider, type LayoutMode } from '@/shared/contexts/LayoutModeContext'
import { useMainLayout } from './hooks/useMainLayout'
import { usePlatformLayout } from './hooks/usePlatformLayout'
import { useSincronizarTenant } from './hooks/useSincronizarTenant'
import { MainLayoutShell } from './MainLayoutShell'

interface MainLayoutProps {
  mode?: LayoutMode
}

export const MainLayout: React.FC<MainLayoutProps> = ({ mode = 'tenant' }) => {
  const tenantLayout = useMainLayout()
  const platformLayout = usePlatformLayout()
  useSincronizarTenant(mode === 'tenant')
  const layout = mode === 'platform' ? platformLayout : tenantLayout

  return (
    <LayoutModeProvider value={mode}>
      <MainLayoutShell layout={layout}>
        <Outlet />
      </MainLayoutShell>
    </LayoutModeProvider>
  )
}
