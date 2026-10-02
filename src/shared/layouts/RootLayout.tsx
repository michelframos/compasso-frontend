import { Outlet } from 'react-router-dom'
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle'

export const RootLayout = () => {
  useDocumentTitle()

  return <Outlet />
}
