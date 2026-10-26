import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarOff, Check, X } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import type { StatusJustificativa } from '../../api/justificativasFaltas'
import { useJustificativasFaltas } from './hooks/useJustificativasFaltas'

const FILTROS: { valor: StatusJustificativa; label: string }[] = [
  { valor: 'pendente', label: 'Pendentes' },
  { valor: 'aceita', label: 'Aceitas' },
  { valor: 'recusada', label: 'Recusadas' },
]

function dataDaAula(data: string) {
  return format(new Date(`${data}T00:00:00`), "d 'de' MMM", { locale: ptBR })
}

export const JustificativasFaltasPage: React.FC = () => {
  const { status, setStatus, pedidos, isLoading, decidindoId, decidir } = useJustificativasFaltas()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Justificativas de <span className="text-indigo-600">falta</span>
        </h1>
        <p className="mt-1 text-[14px] text-zinc-500">
          Avisos de ausência e justificativas enviados pelos alunos. Ao aceitar, a falta fica justificada.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTROS.map((filtro) => (
          <button
            key={filtro.valor}
            type="button"
            onClick={() => setStatus(filtro.valor)}
            className={`h-9 rounded-full border px-4 text-xs font-bold transition-all hover:cursor-pointer ${
              status === filtro.valor
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
            }`}
          >
            {filtro.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : pedidos.length === 0 ? (
        <Card className="border-2 border-dashed border-zinc-200 bg-transparent shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-zinc-100 p-4 text-zinc-400">
              <CalendarOff className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Nenhuma justificativa {status === 'pendente' ? 'pendente' : 'nesta lista'}</h3>
            <p className="mx-auto mt-1 max-w-xs text-zinc-500">
              Os pedidos aparecem aqui quando o aluno avisa uma ausência ou justifica uma falta.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {pedidos.map((pedido) => (
            <Card key={pedido.id} className="border-zinc-200 shadow-none">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{pedido.aluno.nome ?? 'Aluno'}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {pedido.tipo === 'aviso_previo' ? 'Aviso de ausência' : 'Justificativa'}
                      {pedido.aula ? ` · ${pedido.aula.turma ?? 'Turma'} · ${dataDaAula(pedido.aula.data)}` : ''}
                      {pedido.aula?.hora_inicio ? ` · ${pedido.aula.hora_inicio}` : ''}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-zinc-700">{pedido.motivo}</p>
                {pedido.anexo_url && (
                  <a href={pedido.anexo_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600">
                    Ver anexo
                  </a>
                )}
                {pedido.status === 'pendente' && (
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      disabled={decidindoId === pedido.id}
                      onClick={() => void decidir(pedido.id, 'recusada')}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-zinc-200 px-4 text-xs font-bold text-zinc-600 hover:cursor-pointer hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      Recusar
                    </button>
                    <button
                      type="button"
                      disabled={decidindoId === pedido.id}
                      onClick={() => void decidir(pedido.id, 'aceita')}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-emerald-600 px-4 text-xs font-bold text-white shadow-lg shadow-emerald-100 hover:cursor-pointer hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      Aceitar
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
