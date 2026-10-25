import type { LucideIcon } from 'lucide-react'

export interface LayoutMenuItem {
  icon: LucideIcon
  path: string
  label: string
  roles?: string[]
  /** Quando true, admin não herda o item automaticamente. */
  somenteRoles?: boolean
  modulo?: string
}
