import { useAuthStore } from '@/shared/store/useAuthStore'

export type ModuloAppKey =
  | 'leads'
  | 'financeiro'
  | 'espetaculos'
  | 'instrumentos'
  | 'relatorios'
  | (string & {})

export function useHasModulo(modulo: ModuloAppKey): boolean {
  const modulos = useAuthStore((s) => s.tenant?.modulos) ?? []
  return modulos.includes(modulo)
}

export function useHasAnyModulo(...modulos: ModuloAppKey[]): boolean {
  const allowed = useAuthStore((s) => s.tenant?.modulos) ?? []
  return modulos.some((m) => allowed.includes(m))
}
