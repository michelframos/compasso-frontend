import { lazy, Suspense, type ComponentType, type ReactNode } from 'react'
import type { RouteObject } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

function LazyPage({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20 text-zinc-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Carregando...</span>
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

/** Helper: lazy + Suspense wrapper for module route elements. */
export function lazyRoute(
  factory: () => Promise<{ default: ComponentType<any> } | Record<string, ComponentType<any>>>,
  exportName?: string,
): RouteObject['element'] {
  const Comp = lazy(async () => {
    const mod = await factory()
    if (exportName && exportName in mod) {
      return { default: (mod as Record<string, ComponentType<any>>)[exportName] }
    }
    if ('default' in mod && mod.default) {
      return { default: mod.default as ComponentType<any> }
    }
    throw new Error(`Lazy route export not found: ${exportName ?? 'default'}`)
  })
  return (
    <LazyPage>
      <Comp />
    </LazyPage>
  )
}
