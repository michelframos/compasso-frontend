import { createBrowserRouter, Navigate } from 'react-router-dom'
import { MainLayout } from '@/shared/layouts/MainLayout'
import { RootLayout } from '@/shared/layouts/RootLayout'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { corePublicRoutes, coreRoutes } from '@/modules/core'
import { pessoasRoutes } from '@/modules/pessoas'
import { academicoRoutes } from '@/modules/academico'
import { financeiroRoutes } from '@/modules/financeiro'
import { comercialRoutes } from '@/modules/comercial'
import { espetaculosRoutes } from '@/modules/espetaculos'
import { instrumentosRoutes } from '@/modules/instrumentos'
import { notificacoesRoutes } from '@/modules/notificacoes'
import { relatoriosRoutes } from '@/modules/relatorios'
import { platformRoutes } from '@/modules/platform'
import { PlatformProtectedRoute } from '@/shared/components/PlatformProtectedRoute'

/**
 * Aggregator de rotas: cada módulo exporta `routes.tsx` com React.lazy.
 */
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      ...corePublicRoutes,
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          ...relatoriosRoutes,
          ...academicoRoutes,
          ...pessoasRoutes,
          ...comercialRoutes,
          ...financeiroRoutes,
          ...espetaculosRoutes,
          ...instrumentosRoutes,
          ...coreRoutes,
          ...notificacoesRoutes,
        ],
      },
      {
        path: '/platform',
        element: (
          <PlatformProtectedRoute>
            <MainLayout mode="platform" />
          </PlatformProtectedRoute>
        ),
        children: [
          ...platformRoutes,
        ],
      },
    ],
  },
])
