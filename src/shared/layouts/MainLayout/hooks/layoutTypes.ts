import type { LucideIcon } from 'lucide-react'

export interface LayoutMenuItem {
  icon: LucideIcon
  path: string
  label: string
  roles?: string[]
  modulo?: string
}
