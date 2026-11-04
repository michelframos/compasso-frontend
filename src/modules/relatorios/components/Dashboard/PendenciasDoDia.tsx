import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Award,
  CalendarClock,
  CalendarPlus,
  ClipboardCheck,
  RefreshCw,
  Wallet,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import type { PendenciaItem } from './hooks/useDashboardData'

const ICONS: Record<string, React.ElementType> = {
  certificados_elegiveis: Award,
  solicitacoes_aula: CalendarClock,
  reposicoes: CalendarPlus,
  chamadas_pendentes: ClipboardCheck,
  contas_vencidas: Wallet,
}

interface PendenciasDoDiaProps {
  items: PendenciaItem[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  canNavigateHref?: (href: string) => boolean
}

function variantClasses(variant?: string, ativo?: boolean) {
  if (!ativo) {
    return 'border-zinc-100 bg-white text-zinc-400'
  }
  if (variant === 'danger') {
    return 'border-rose-100 bg-rose-50/80 text-rose-700 hover:ring-rose-200'
  }
  if (variant === 'warning') {
    return 'border-amber-100 bg-amber-50/80 text-amber-800 hover:ring-amber-200'
  }
  return 'border-indigo-100 bg-indigo-50/70 text-indigo-800 hover:ring-indigo-200'
}

export const PendenciasDoDia: React.FC<PendenciasDoDiaProps> = ({
  items,
  isLoading,
  error,
  onRetry,
  canNavigateHref,
}) => {
  const navigate = useNavigate()
  const ativos = items.filter((item) => item.count > 0)

  if (error) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4">
        <p className="text-sm font-medium text-rose-700">{error}</p>
        {onRetry && (
          <Button variant="outline" size="sm" className="h-8 shrink-0 gap-1.5 rounded-full" onClick={onRetry}>
            <RefreshCw className="h-3.5 w-3.5" />
            Tentar de novo
          </Button>
        )}
      </div>
    )
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-indigo-600" />
        <h2 className="text-xl font-black text-zinc-900">Pendências do dia</h2>
        {!isLoading && (
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-bold text-zinc-500">
            {ativos.length} aberta{ativos.length === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] rounded-2xl" />
          ))}
        </div>
      ) : ativos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-4 py-6 text-center">
          <p className="text-sm font-bold text-zinc-900">Nenhuma pendência no momento</p>
          <p className="mt-1 text-xs text-zinc-500">Quando houver ações urgentes, elas aparecem aqui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {ativos.map((item) => {
            const Icon = ICONS[item.key] ?? ClipboardCheck
            const navegavel = canNavigateHref ? canNavigateHref(item.href) : true
            return (
              <button
                key={item.key}
                type="button"
                disabled={!navegavel}
                onClick={() => navegavel && navigate(item.href)}
                className={`rounded-2xl border p-4 text-left shadow-sm transition-all hover:cursor-pointer hover:shadow-md hover:ring-1 disabled:cursor-default disabled:opacity-60 ${variantClasses(item.variant, true)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">{item.label}</p>
                    <p className="mt-1 text-2xl font-black tabular-nums">{item.count}</p>
                  </div>
                  <div className="rounded-xl bg-white/70 p-2">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
