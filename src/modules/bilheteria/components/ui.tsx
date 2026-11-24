import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export function PageHeader({
  title,
  highlight,
  description,
  actions,
}: {
  title: string
  highlight?: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          {title}
          {highlight ? (
            <>
              {' '}
              <span className="text-indigo-600">{highlight}</span>
            </>
          ) : null}
        </h1>
        {description ? <p className="mt-1 text-[14px] text-zinc-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-transparent px-6 py-14 text-center">
      <div className="mb-4 rounded-full bg-zinc-100 p-4 text-zinc-400">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-zinc-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-zinc-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function LoadingBlock({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-20 text-sm text-zinc-400">
      <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
      {label}
    </div>
  )
}

const STATUS_STYLES: Record<string, string> = {
  disponivel: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  vendido: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  'vendido (cortesia)': 'bg-violet-50 text-violet-700 border-violet-100',
  utilizado: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  aguardando_pagamento: 'bg-amber-50 text-amber-700 border-amber-100',
  pago: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  cancelado: 'bg-rose-50 text-rose-600 border-rose-100',
  planejamento: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  aberto: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  ensaios: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  concluido: 'bg-emerald-50 text-emerald-600 border-emerald-100',
}

const STATUS_LABELS: Record<string, string> = {
  disponivel: 'Disponível',
  vendido: 'Vendido',
  'vendido (cortesia)': 'Vendido (cortesia)',
  utilizado: 'Utilizado',
  aguardando_pagamento: 'Aguardando pagamento',
  pago: 'Pago',
  cancelado: 'Cancelado',
  planejamento: 'Planejamento',
  aberto: 'Aberto',
  ensaios: 'Ensaios',
  concluido: 'Concluído',
}

export function StatusBadge({ value }: { value?: string | null }) {
  if (!value) {
    return <span className="text-xs text-zinc-400">—</span>
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold',
        STATUS_STYLES[value] ?? 'bg-zinc-100 text-zinc-600 border-zinc-200',
      )}
    >
      {STATUS_LABELS[value] ?? value}
    </span>
  )
}

export function StatChip({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: React.ReactNode
  tone?: 'default' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet'
}) {
  const tones = {
    default: 'border-zinc-100 bg-white',
    indigo: 'border-indigo-100 bg-indigo-50/60',
    emerald: 'border-emerald-100 bg-emerald-50/60',
    amber: 'border-amber-100 bg-amber-50/60',
    rose: 'border-rose-100 bg-rose-50/60',
    violet: 'border-violet-100 bg-violet-50/60',
  }
  return (
    <div className={cn('rounded-2xl border p-4 shadow-sm', tones[tone])}>
      <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-zinc-900">{value}</p>
    </div>
  )
}

export function formatMoney(value: number) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDataBr(iso?: string | null) {
  if (!iso) return '—'
  const [y, m, d] = iso.slice(0, 10).split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}
