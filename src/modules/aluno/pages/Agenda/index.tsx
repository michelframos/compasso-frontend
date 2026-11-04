import React, { useState } from 'react'
import { format, isSameDay, isSameMonth, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { JustificativaDialog } from '../../components/JustificativaDialog'
import { useMinhasJustificativas } from '../../hooks/useMinhasJustificativas'
import type { ItemAgenda, JustificativaDoAluno } from '../../types'
import { useAgenda, type VisaoAgenda } from './hooks/useAgenda'

const DIAS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom']

export const AgendaPage: React.FC = () => {
  const { visao, setVisao, ancora, dias, agenda, isLoading, aguardandoDependente, offline, doCache, anterior, proximo, hoje } = useAgenda()
  const { porAula, recarregar } = useMinhasJustificativas()
  const [selecionado, setSelecionado] = useState(() => new Date())
  const [aviso, setAviso] = useState<ItemAgenda | null>(null)
  const itens = agenda?.itens ?? []
  const somenteLeitura = offline || doCache

  if (aguardandoDependente) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h1 className="text-lg font-bold">Agenda</h1>
        <p className="mt-2 text-sm text-zinc-600">Selecione um aluno para ver a agenda dele.</p>
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
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Agenda</h1>
          <p className="mt-1 text-sm capitalize text-zinc-500">{titulo}</p>
          {somenteLeitura && (
            <p className="mt-1 text-xs font-semibold text-amber-700">Somente leitura (dados em cache).</p>
          )}
        </div>
        <div className="inline-flex rounded-full bg-zinc-100 p-1">
          {([
            ['semana', 'Semana'],
            ['mes', 'Mês'],
          ] as [VisaoAgenda, string][]).map(([valor, label]) => (
            <button
              key={valor}
              type="button"
              onClick={() => setVisao(valor)}
              className={`h-8 rounded-full px-3 text-xs font-bold ${visao === valor ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={anterior} className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100" aria-label="Período anterior">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button type="button" onClick={hoje} className="text-sm font-semibold text-indigo-600">
          Hoje
        </button>
        <button type="button" onClick={proximo} className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100" aria-label="Próximo período">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-zinc-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Carregando...</span>
        </div>
      ) : visao === 'semana' ? (
        <div className="space-y-3">
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
        <>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-zinc-400">
            {DIAS.map((dia) => (
              <span key={dia}>{dia}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {dias.map((dia) => {
              const chave = format(dia, 'yyyy-MM-dd')
              const eventos = itens.filter((item) => item.data === chave)
              const ativo = isSameDay(dia, diaAberto)
              return (
                <button
                  key={chave}
                  type="button"
                  onClick={() => setSelecionado(dia)}
                  className={`flex min-h-12 flex-col items-center rounded-xl py-1 text-sm ${
                    ativo ? 'bg-indigo-600 text-white' : isSameMonth(dia, ancora) ? 'bg-white text-zinc-800' : 'bg-zinc-50 text-zinc-300'
                  }`}
                >
                  <span className={isToday(dia) && !ativo ? 'font-bold text-indigo-600' : ''}>{format(dia, 'd')}</span>
                  {eventos.length > 0 && (
                    <span className={`mt-1 h-1.5 w-1.5 rounded-full ${ativo ? 'bg-white' : 'bg-indigo-500'}`} />
                  )}
                </button>
              )
            })}
          </div>
          <section className="space-y-2">
            <h2 className="text-sm font-bold capitalize text-zinc-900">{format(diaAberto, "EEEE, d 'de' MMMM", { locale: ptBR })}</h2>
            {doDia.length === 0 ? <p className="text-sm text-zinc-500">Nada neste dia.</p> : doDia.map((item) => (
              <Evento key={`${item.tipo}-${item.id}`} item={item} pedido={porAula[item.id]} onAvisar={setAviso} somenteLeitura={somenteLeitura} />
            ))}
          </section>
        </>
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
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-3">
      <h2 className={`text-sm font-bold capitalize ${isToday(dia) ? 'text-indigo-600' : 'text-zinc-900'}`}>
        {format(dia, "EEEE, d 'de' MMM", { locale: ptBR })}
      </h2>
      {itens.length === 0 ? (
        <p className="mt-2 text-sm text-zinc-400">Nada neste dia.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {itens.map((item) => (
            <li key={`${item.tipo}-${item.id}`}>
              <Evento item={item} pedido={porAula[item.id]} onAvisar={onAvisar} somenteLeitura={somenteLeitura} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function Evento({
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
  const origem = item.remarcacao?.de?.data
  const destino = item.remarcacao?.para?.data

  return (
    <div className={`rounded-xl px-3 py-2 ${cancelada ? 'bg-amber-50' : 'bg-zinc-50'}`}>
      <div className="flex items-start justify-between gap-2">
        <p className={`text-sm font-semibold text-zinc-900 ${cancelada ? 'line-through' : ''}`}>{item.titulo}</p>
        <span className="shrink-0 text-xs text-zinc-500">{horas}</span>
      </div>
      {item.detalhe && <p className="mt-0.5 text-xs text-zinc-500">{item.detalhe}</p>}
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
        {rotulo(item)}
        {item.status === 'concluida' || item.status === 'concluido' ? ' · Concluída' : ''}
        {cancelada ? ' · Cancelada' : ''}
      </p>
      {origem && <p className="mt-1 text-xs text-zinc-500">Remarcada de {format(new Date(`${origem}T00:00:00`), "d 'de' MMM", { locale: ptBR })}</p>}
      {destino && <p className="mt-1 text-xs text-zinc-500">Remarcada para {format(new Date(`${destino}T00:00:00`), "d 'de' MMM", { locale: ptBR })}</p>}
      {item.tipo === 'aula' && item.status === 'agendada' && !cancelada && !somenteLeitura && (
        pedido && pedido.status !== 'recusada' ? (
          <p className="mt-2 text-xs font-semibold text-zinc-500">
            {pedido.status === 'aceita' ? 'Ausência aceita' : 'Aviso enviado'}
          </p>
        ) : (
          <button type="button" onClick={() => onAvisar(item)} className="mt-2 text-xs font-bold text-indigo-600">
            Avisar ausência
          </button>
        )
      )}
    </div>
  )
}

function rotulo(item: ItemAgenda) {
  if (item.tipo === 'apresentacao') return 'Apresentação'
  if (item.tipo === 'ensaio') return 'Ensaio'
  return item.remarcada ? 'Aula remarcada' : 'Aula'
}
