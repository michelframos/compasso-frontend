import type { ResumoFrequencia } from '../../../types'

function percentualTexto(resumo: ResumoFrequencia) {
  if (resumo.percentual === null) return '—'
  return `${resumo.percentual.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
}

function faixa(percentual: number | null) {
  if (percentual === null) return 'neutro' as const
  if (percentual >= 80) return 'bom' as const
  if (percentual >= 60) return 'alerta' as const
  return 'risco' as const
}

const TOM = {
  bom: {
    barra: 'bg-emerald-500',
    valor: 'text-emerald-700',
    fundo: 'border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-white',
  },
  alerta: {
    barra: 'bg-amber-500',
    valor: 'text-amber-700',
    fundo: 'border-amber-100 bg-gradient-to-br from-amber-50/80 via-white to-white',
  },
  risco: {
    barra: 'bg-rose-500',
    valor: 'text-rose-700',
    fundo: 'border-rose-100 bg-gradient-to-br from-rose-50/80 via-white to-white',
  },
  neutro: {
    barra: 'bg-indigo-500',
    valor: 'text-indigo-600',
    fundo: 'border-zinc-200 bg-white',
  },
}

export function percentualCurto(resumo: ResumoFrequencia) {
  if (resumo.percentual === null) return '—'
  return `${Math.round(resumo.percentual)}%`
}

export function ResumoFrequenciaCard({ resumo }: { resumo: ResumoFrequencia }) {
  const nivel = faixa(resumo.percentual)
  const tom = TOM[nivel]
  const largura = Math.min(Math.max(resumo.percentual ?? 0, 0), 100)

  return (
    <section className={`overflow-hidden rounded-2xl border p-4 sm:p-5 ${tom.fundo}`}>
      <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-600">Presença</p>
      <p className={`mt-1 text-4xl font-black tracking-tight ${tom.valor}`}>{percentualTexto(resumo)}</p>

      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-zinc-100">
        <div className={`h-full rounded-full transition-all ${tom.barra}`} style={{ width: `${largura}%` }} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Contador label="Presenças" valor={resumo.presentes} tom="emerald" />
        <Contador label="Faltas" valor={resumo.ausentes} tom="rose" destaque={resumo.ausentes > 0} />
        <Contador label="Justificadas" valor={resumo.justificados} tom="amber" />
      </div>
    </section>
  )
}

function Contador({
  label,
  valor,
  tom,
  destaque = false,
}: {
  label: string
  valor: number
  tom: 'emerald' | 'rose' | 'amber'
  destaque?: boolean
}) {
  const classes = {
    emerald: destaque ? 'bg-emerald-50 text-emerald-800' : 'bg-zinc-50 text-zinc-800',
    rose: destaque ? 'bg-rose-50 text-rose-800' : 'bg-zinc-50 text-zinc-800',
    amber: destaque ? 'bg-amber-50 text-amber-800' : 'bg-zinc-50 text-zinc-800',
  }[tom]

  const labelTom = {
    emerald: 'text-emerald-700',
    rose: 'text-rose-700',
    amber: 'text-amber-700',
  }[tom]

  return (
    <div className={`rounded-xl px-3 py-2.5 ${classes}`}>
      <p className={`text-[10px] font-bold uppercase tracking-wide ${destaque ? labelTom : 'text-zinc-400'}`}>{label}</p>
      <p className="mt-0.5 text-xl font-black tabular-nums">{valor}</p>
    </div>
  )
}
