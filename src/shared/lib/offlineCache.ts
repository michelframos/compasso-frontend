import { useAuthStore } from '@/shared/store/useAuthStore'

const PREFIXO = 'compasso:aluno-offline:'

type EntradaCache<T> = {
  salvo_em: string
  dados: T
}

function chaveEscopo(recurso: string, partes: Array<string | number | null | undefined> = []) {
  const { user, tenant } = useAuthStore.getState()
  const base = [tenant?.slug ?? 'sem-tenant', user?.id ?? 'anon', recurso, ...partes]
    .map((parte) => (parte == null || parte === '' ? '_' : String(parte)))
    .join(':')
  return `${PREFIXO}${base}`
}

export function salvarCacheOffline<T>(
  recurso: string,
  dados: T,
  partes: Array<string | number | null | undefined> = [],
) {
  try {
    const entrada: EntradaCache<T> = { salvo_em: new Date().toISOString(), dados }
    localStorage.setItem(chaveEscopo(recurso, partes), JSON.stringify(entrada))
  } catch {
    // Quota ou modo privado: o app continua online sem cache.
  }
}

export function lerCacheOffline<T>(
  recurso: string,
  partes: Array<string | number | null | undefined> = [],
): { dados: T; salvo_em: string } | null {
  try {
    const bruto = localStorage.getItem(chaveEscopo(recurso, partes))
    if (!bruto) return null
    const entrada = JSON.parse(bruto) as EntradaCache<T>
    if (!entrada || typeof entrada !== 'object' || !('dados' in entrada)) return null
    return { dados: entrada.dados, salvo_em: entrada.salvo_em }
  } catch {
    return null
  }
}

export function estaOffline() {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}
