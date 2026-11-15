import type { ReactNode } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarClock, Mic2, Music2 } from 'lucide-react'
import type { ItemAgenda, JustificativaDoAluno } from '../../../types'

function Badge({ tom, children }: { tom: 'rose' | 'amber' | 'zinc' | 'indigo' | 'violet'; children: ReactNode }) {
  const classes = {
    rose: 'bg-rose-50 text-rose-700',
    amber: 'bg-amber-50 text-amber-800',
    zinc: 'bg-zinc-100 text-zinc-600',
    indigo: 'bg-indigo-50 text-indigo-700',
    violet: 'bg-violet-50 text-violet-700',
  }[tom]
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${classes}`}>{children}</span>
}

function metaTipo(item: ItemAgenda) {
  if (item.tipo === 'apresentacao') {
    return { Icon: Mic2, rotulo: 'Apresentação', tom: 'violet' as const }
  }
  if (item.tipo === 'ensaio') {
    return { Icon: Music2, rotulo: 'Ensaio', tom: 'violet' as const }
  }
  return {
    Icon: CalendarClock,
    rotulo: item.remarcada ? 'Aula remarcada' : 'Aula',
    tom: 'indigo' as const,
  }
}

export function EventoAgenda({
  item,
  pedido,
  onAvisar,
  somenteLeitura = false,
}: {
  item: ItemAgenda
  pedido?: JustificativaDoAluno
  onAvisar: (item: ItemAgenda) => void
  somenteLeitura?: boolean
}) {
  const horas = item.hora_inicio ? `${item.hora_inicio}${item.hora_termino ? `–${item.hora_termino}` : ''}` : 'Dia todo'
  const cancelada = item.status === 'cancelada' || item.status === 'cancelado'
  const concluida = item.status === 'concluida' || item.status === 'concluido'
  const origem = item.remarcacao?.de?.data
  const destino = item.remarcacao?.para?.data
  const { Icon, rotulo, tom } = metaTipo(item)

  const fundo = cancelada
    ? 'border-rose-100 bg-rose-50/70'
    : item.remarcada
      ? 'border-amber-100 bg-amber-50/50'
      : 'border-zinc-100 bg-white'

  const icone = cancelada
    ? 'bg-rose-100 text-rose-600'
    : tom === 'violet'
      ? 'bg-violet-50 text-violet-600'
      : 'bg-indigo-50 text-indigo-600'

  return (
    <div className={`rounded-xl border px-3 py-3 ${fundo}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${icone}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-semibold text-zinc-900 ${cancelada ? 'line-through decoration-rose-400' : ''}`}>
              {item.titulo}
            </p>
            <span className="shrink-0 text-sm font-bold tabular-nums text-zinc-700">{horas}</span>
          </div>

          {item.detalhe && <p className="mt-0.5 text-xs text-zinc-500">{item.detalhe}</p>}

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge tom={tom}>{rotulo}</Badge>
            {cancelada && <Badge tom="rose">Cancelada</Badge>}
            {!cancelada && item.remarcada && <Badge tom="amber">Remarcada</Badge>}
            {concluida && <Badge tom="zinc">Concluída</Badge>}
          </div>

          {origem && (
            <p className="mt-1.5 text-xs text-zinc-500">
              Remarcada de {format(new Date(`${origem}T00:00:00`), "d 'de' MMM", { locale: ptBR })}
            </p>
          )}
          {destino && (
            <p className="mt-1 text-xs text-zinc-500">
              Remarcada para {format(new Date(`${destino}T00:00:00`), "d 'de' MMM", { locale: ptBR })}
            </p>
          )}

          {item.tipo === 'aula' && item.status === 'agendada' && !cancelada && !somenteLeitura && (
            pedido && pedido.status !== 'recusada' ? (
              <p className="mt-2 text-xs font-semibold text-zinc-500">
                {pedido.status === 'aceita' ? 'Ausência aceita' : 'Aviso enviado'}
              </p>
            ) : (
              <button
                type="button"
                onClick={() => onAvisar(item)}
                className="mt-2 inline-flex h-8 items-center rounded-full bg-indigo-50 px-3 text-xs font-bold text-indigo-600 transition-colors hover:bg-indigo-600 hover:text-white"
              >
                Avisar ausência
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
