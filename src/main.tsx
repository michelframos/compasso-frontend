import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { PwaRuntime } from '@/shared/components/PwaRuntime'
import { Toaster } from '@/shared/components/ui/sonner'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <PwaRuntime />
    <Toaster position="top-right" richColors theme="light" />
  </StrictMode>,
)
