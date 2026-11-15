import React, { useState } from 'react'
import { format, isSameDay, isSameMonth, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { JustificativaDialog } from '../../components/JustificativaDialog'
import { useMinhasJustificativas } from '../../hooks/useMinhasJustificativas'
import type { ItemAgenda, JustificativaDoAluno } from '../../types'
import { EventoAgenda } from './components/EventoAgenda'
import { useAgenda, type VisaoAgenda } from './hooks/useAgenda'

const DIAS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']

function AgendaSkeleton({ visao }: { visao: VisaoAgenda }) {
  if (visao === 'mes') {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-28 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className={`rounded-2xl ${i === 2 ? 'h-28' : 'h-12'}`} />
      ))}
    </div>
  )
}

function EmptyDia() {
  return (
    <p className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-3 py-4 text-center text-sm text-zinc-400">
      Nada neste dia.
    </p>
  )
}

export const AgendaPage: React.FC = () => {
  const {
    visao,
    setVisao,
    ancora,
    dias,
    agenda,
    agendaErro,
    isLoading,
    aguardandoDependente,
    offline,
    doCache,
    anterior,
    proximo,
    hoje,
  } = useAgenda()
  const { porAula, recarregar } = useMinhasJustificativas()
  const [selecionado, setSelecionado] = useState(() => new Date())
  const [aviso, setAviso] = useState<ItemAgenda | null>(null)
  const itens = agenda?.itens ?? []
  const somenteLeitura = offline || doCache

  const irParaHoje = () => {
    const agora = new Date()
    setSelecionado(agora)
    hoje()
  }

  if (aguardandoDependente) {
    return (
      <section className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-200 bg-white px-5 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Users className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-lg font-bold text-zinc-900">Selecione um aluno</h1>
        <p className="mt-2 max-w-sm text-sm text-zinc-600">
          Use o seletor no topo da tela para escolher o dependente e ver a agenda dele.
        </p>
      </section>
    )
  }

  const titulo =
    visao === 'semana'
      ? `${format(dias[0], "d 'de' MMM", { locale: ptBR })} – ${format(dias[dias.length - 1], "d 'de' MMM", { locale: ptBR })}`
      : format(ancora, 'MMMM yyyy', { locale: ptBR })

  const diaAberto = dias.some((dia) => isSameDay(dia, selecionado)) ? selecionado : dias[0]
  const doDia = itens.filter((item) => item.data === format(diaAberto, 'yyyy-MM-dd'))

  return (
    <div className="space-y-4 pb-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Agenda</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="text-sm capitalize text-zinc-500">{titulo}</p>
            {somenteLeitura && (
              <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                Somente leitura
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full bg-zinc-100 p-1">
            {([
              ['semana', 'Semana'],
              ['mes', 'Mês'],
            ] as [VisaoAgenda, string][]).map(([valor, label]) => (
              <button
                key={valor}
                type="button"
                onClick={() => setVisao(valor)}
                className={`h-8 rounded-full px-3 text-xs font-bold ${
                  visao === valor ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="inline-flex items-center rounded-full border border-zinc-200 bg-white">
            <button
              type="button"
              onClick={anterior}
              className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-50"
              aria-label="Período anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={irParaHoje} className="px-2 text-xs font-bold text-indigo-600">
              Hoje
            </button>
            <button
              type="button"
              onClick={proximo}
              className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-50"
              aria-label="Próximo período"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <AgendaSkeleton visao={visao} />
      ) : agendaErro && !agenda ? (
        <section className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/40 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-rose-800">Não foi possível carregar a agenda.</p>
          <p className="mt-1 text-sm text-rose-700/80">Tente novamente em instantes ou mude o período.</p>
        </section>
      ) : visao === 'semana' ? (
        <div className="space-y-2">
          {dias.map((dia) => (
            <DiaSemana
              key={dia.toISOString()}
              dia={dia}
              itens={itens.filter((item) => item.data === format(dia, 'yyyy-MM-dd'))}
              porAula={porAula}
              onAvisar={setAviso}
              somenteLeitura={somenteLeitura}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3">
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-zinc-400">
              {DIAS.map((dia) => (
                <span key={dia} className="py-1">
                  {dia}
                </span>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {dias.map((dia) => {
                const chave = format(dia, 'yyyy-MM-dd')
                const eventos = itens.filter((item) => item.data === chave)
                const ativo = isSameDay(dia, diaAberto)
                const noMes = isSameMonth(dia, ancora)

                return (
                  <button
                    key={chave}
                    type="button"
                    onClick={() => setSelecionado(dia)}
                    className={`flex min-h-[3.25rem] flex-col items-center rounded-xl px-0.5 py-1.5 text-sm transition-colors ${
                      ativo
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                        : noMes
                          ? 'bg-zinc-50 text-zinc-800 hover:bg-indigo-50'
                          : 'bg-transparent text-zinc-300'
                    }`}
                  >
                    <span
                      className={`${isToday(dia) && !ativo ? 'font-black text-indigo-600' : ativo ? 'font-bold' : ''}`}
                    >
                      {format(dia, 'd')}
                    </span>
                    {eventos.length > 0 && (
                      <span className="mt-1 flex items-center gap-0.5">
                        {eventos.slice(0, 3).map((evento, i) => (
                          <span
                            key={`${evento.tipo}-${evento.id}-${i}`}
                            className={`h-1.5 w-1.5 rounded-full ${
                              ativo
                                ? 'bg-white'
                                : evento.status === 'cancelada' || evento.status === 'cancelado'
                                  ? 'bg-rose-500'
                                  : evento.tipo === 'apresentacao' || evento.tipo === 'ensaio'
                                    ? 'bg-violet-500'
                                    : 'bg-indigo-500'
                            }`}
                          />
                        ))}
                        {eventos.length > 3 && (
                          <span className={`text-[9px] font-bold ${ativo ? 'text-white/80' : 'text-zinc-400'}`}>
                            +{eventos.length - 3}
                          </span>
                        )}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <section className="space-y-2">
            <h2 className="text-sm font-bold capitalize text-zinc-900">
              {format(diaAberto, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </h2>
            {doDia.length === 0 ? (
              <EmptyDia />
            ) : (
              doDia.map((item) => (
                <EventoAgenda
                  key={`${item.tipo}-${item.id}`}
                  item={item}
                  pedido={porAula[item.id]}
                  onAvisar={setAviso}
                  somenteLeitura={somenteLeitura}
                />
              ))
            )}
          </section>
        </div>
      )}

      <JustificativaDialog
        aberto={aviso !== null}
        tipo="aviso_previo"
        idAula={aviso?.id ?? null}
        titulo={aviso ? `${aviso.titulo} · ${aviso.data}` : ''}
        onFechar={() => setAviso(null)}
        onEnviada={recarregar}
      />
    </div>
  )
}

function DiaSemana({
  dia,
  itens,
  porAula,
  onAvisar,
  somenteLeitura,
}: {
  dia: Date
  itens: ItemAgenda[]
  porAula: Record<number, JustificativaDoAluno>
  onAvisar: (item: ItemAgenda) => void
  somenteLeitura: boolean
}) {
  const hoje = isToday(dia)
  const vazio = itens.length === 0

  if (vazio) {
    return (
      <section
        className={`flex items-center justify-between gap-3 rounded-xl border border-dashed px-3 py-2.5 ${
          hoje ? 'border-indigo-200 bg-indigo-50/40' : 'border-zinc-200 bg-transparent'
        }`}
      >
        <h2 className={`text-sm font-semibold capitalize ${hoje ? 'text-indigo-700' : 'text-zinc-500'}`}>
          {format(dia, "EEEE, d 'de' MMM", { locale: ptBR })}
          {hoje && <span className="ml-2 text-[11px] font-bold uppercase tracking-wide">Hoje</span>}
        </h2>
        <span className="text-xs font-medium text-zinc-400">Livre</span>
      </section>
    )
  }

  return (
    <section
      className={`rounded-2xl border p-3 ${
        hoje ? 'border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-white to-white' : 'border-zinc-200 bg-white'
      }`}
    >
      <h2 className={`text-sm font-bold capitalize ${hoje ? 'text-indigo-700' : 'text-zinc-900'}`}>
        {format(dia, "EEEE, d 'de' MMM", { locale: ptBR })}
        {hoje && (
          <span className="ml-2 inline-flex rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Hoje
          </span>
        )}
      </h2>
      <ul className="mt-2 space-y-2">
        {itens.map((item) => (
          <li key={`${item.tipo}-${item.id}`}>
            <EventoAgenda item={item} pedido={porAula[item.id]} onAvisar={onAvisar} somenteLeitura={somenteLeitura} />
          </li>
        ))}
      </ul>
    </section>
  )
}
