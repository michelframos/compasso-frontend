import { createContext, useContext } from 'react'

export type LayoutMode = 'tenant' | 'platform'

const LayoutModeContext = createContext<LayoutMode>('tenant')

export const LayoutModeProvider = LayoutModeContext.Provider

export function useLayoutMode(): LayoutMode {
  return useContext(LayoutModeContext)
}
