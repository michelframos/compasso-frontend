/**
 * Fundação compartilhada do frontend.
 * Preferir imports via `@/shared` ou `@/shared/...`.
 * Domínio vive em `@/modules/{nome}` (somente via `index.ts` público).
 */
export { default as api } from './lib/axios'
export * from './lib/utils'
export { lazyRoute } from './lib/lazyRoute'
export { ProtectedRoute } from './components/ProtectedRoute'
export { MainLayout } from './layouts/MainLayout'
export { RootLayout } from './layouts/RootLayout'
export { APP_NAME } from './constants/app'
export { useDocumentTitle } from './hooks/useDocumentTitle'
export { useAuthStore } from './store/useAuthStore'
export { useLayoutStore } from './store/useLayoutStore'
export { PageHeader } from './components/PageHeader'
export { CustomTable } from './components/CustomTable'
export { NoData } from './components/NoData'
export { CustomModalGlobal } from './components/CustomModalGlobal'
export { CustomInput } from './components/CustomInput'
export { CustomLoadingButton } from './components/CustomLoadingButton'
export { CustomCircularLoading } from './components/CustomCircularLoading'
export { CustomRoundedButton } from './components/CustomRoudedButton'
export { CarneOptionsModal } from './components/CarneOptionsModal'
