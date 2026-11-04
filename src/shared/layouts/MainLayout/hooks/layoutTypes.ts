import type { LucideIcon } from 'lucide-react'

export interface LayoutMenuLeaf {
  icon: LucideIcon
  path: string
  label: string
  roles?: string[]
  /** Quando true, admin não herda o item automaticamente. */
  somenteRoles?: boolean
  modulo?: string
}

/** Alias para itens do rodapé / links simples. */
export type LayoutMenuItem = LayoutMenuLeaf

export interface LayoutMenuGroup {
  id: string
  label: string
  icon: LucideIcon
  children: LayoutMenuLeaf[]
  roles?: string[]
  modulo?: string
}

export type LayoutNavEntry = LayoutMenuLeaf | LayoutMenuGroup

export function isLayoutMenuGroup(entry: LayoutNavEntry): entry is LayoutMenuGroup {
  return 'children' in entry && Array.isArray((entry as LayoutMenuGroup).children)
}

export function isLayoutMenuLeaf(entry: LayoutNavEntry): entry is LayoutMenuLeaf {
  return 'path' in entry && typeof (entry as LayoutMenuLeaf).path === 'string'
}
