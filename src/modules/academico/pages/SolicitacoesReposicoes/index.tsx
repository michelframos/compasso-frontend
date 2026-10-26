import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarPlus, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/shared/components/ui/card'
import { getErrorMessage } from '@/shared/lib/utils'
import { listarOpcoesDaReposicao, type AulaReposicaoStaff, type StatusReposicao } from '../../api/solicitacoesReposicoes'
import { useSolicitacoesReposicoes } from './hooks/useSolicitacoesReposicoes'

const FILTROS: { valor: StatusReposicao; label: string }[] = [
  { valor: 'pendente', label: 'Pendentes' },
  { valor: 'aprovada', label: 'Aprovadas' },
  { valor: 'recusada', label: 'Recusadas' },
]

function dataDaAula(data: string) {
  return format(new Date(`${data}T00:00:00`), "d 'de' MMM", { locale: ptBR })
}

function rotulo(aula: AulaReposicaoStaff) {
  return `${dataDaAula(aula.data)} · ${aula.hora_inicio}${aula.turma ? ` · ${aula.turma}` : ''}`
}

function EscolhaDestino({ id, valor, onChange }: { id: number; valor: string; onChange: (valor: string) => void }) {
  const [opcoes, setOpcoes] = useState<AulaReposicaoStaff[]>([])

  useEffect(() => {
    let ativo = true
    listarOpcoesDaReposicao(id)
      .then((lista) => {
        if (ativo) setOpcoes(lista)
      })
      .catch((erro) => {
        if (ativo) toast.error(getErrorMessage(erro, 'Não foi possível carregar as aulas com vaga.'))
      })
    return () => {
      ativo = false
    }
  }, [id])

  return (
    <select
      value={valor}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 w-full rounded-full border border-zinc-200 bg-white px-3 text-xs text-zinc-700"
      aria-label="Aula de destino"
    >
      <option value="">Escolha a aula</option>
      {opcoes.map((aula) => (
        <option key={aula.id} value={aula.id}>
          {rotulo(aula)}
        </option>
      ))}
    </select>
  )
}

export const SolicitacoesReposicoesPage: React.FC = () => {
  const { status, setStatus, pedidos, isLoading, decidindoId, decidir } = useSolicitacoesReposicoes()
  const [destinos, setDestinos] = useState<Record<number, string>>({})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Reposições de <span className="text-indigo-600">aula</span>
        </h1>
        <p className="mt-1 text-[14px] text-zinc-500">
          Pedidos dos alunos para repor uma falta. Ao aprovar, o aluno entra na chamada da aula escolhida.
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
              <CalendarPlus className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Nenhuma reposição {status === 'pendente' ? 'pendente' : 'nesta lista'}</h3>
            <p className="mx-auto mt-1 max-w-xs text-zinc-500">
              Os pedidos aparecem aqui quando o aluno pede para repor uma falta.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {pedidos.map((pedido) => {
            const destinoEscolhido = destinos[pedido.id] ?? ''
            const podeAprovar = pedido.destino !== null || destinoEscolhido !== ''
            return (
              <Card key={pedido.id} className="border-zinc-200 shadow-none">
                <CardContent className="space-y-3 p-4">
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{pedido.aluno.nome ?? 'Aluno'}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      Falta
                      {pedido.perdida ? ` · ${pedido.perdida.turma ?? 'Turma'} · ${dataDaAula(pedido.perdida.data)}` : ''}
                    </p>
                  </div>
                  <p className="text-sm text-zinc-700">{pedido.motivo}</p>
                  {pedido.destino ? (
                    <p className="text-xs font-semibold text-zinc-500">Reposição em {rotulo(pedido.destino)}</p>
                  ) : pedido.status === 'pendente' ? (
                    <EscolhaDestino
                      id={pedido.id}
                      valor={destinoEscolhido}
                      onChange={(valor) => setDestinos((atual) => ({ ...atual, [pedido.id]: valor }))}
                    />
                  ) : null}
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
                        disabled={decidindoId === pedido.id || !podeAprovar}
                        onClick={() => void decidir(pedido.id, 'aprovada', destinoEscolhido === '' ? null : Number(destinoEscolhido))}
                        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-emerald-600 px-4 text-xs font-bold text-white shadow-lg shadow-emerald-100 hover:cursor-pointer hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" />
                        Aprovar
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
