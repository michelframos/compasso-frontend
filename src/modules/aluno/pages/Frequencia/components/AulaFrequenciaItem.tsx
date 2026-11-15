import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { AulaFrequencia, JustificativaDoAluno, ReposicaoDoAluno } from '../../../types'

const STATUS: Record<AulaFrequencia['status'], { label: string; classe: string }> = {
  presente: { label: 'Presente', classe: 'bg-emerald-50 text-emerald-700' },
  ausente: { label: 'Falta', classe: 'bg-rose-50 text-rose-700' },
  justificado: { label: 'Justificada', classe: 'bg-amber-50 text-amber-700' },
}

export function AulaFrequenciaItem({
  aula,
  pedido,
  reposicao,
  onJustificar,
  onRepor,
}: {
  aula: AulaFrequencia
  pedido?: JustificativaDoAluno
  reposicao?: ReposicaoDoAluno
  onJustificar: (aula: AulaFrequencia) => void
  onRepor: (aula: AulaFrequencia) => void
}) {
  const status = STATUS[aula.status] ?? { label: aula.status, classe: 'bg-zinc-100 text-zinc-600' }
  const data = format(new Date(`${aula.data}T00:00:00`), "EEE, d 'de' MMM", { locale: ptBR })
  const enviada = pedido && pedido.status !== 'recusada'
  const reposicaoAberta = reposicao && reposicao.status !== 'recusada'
  const falta = aula.status === 'ausente'

  return (
    <li
      className={`rounded-xl border px-3 py-3 ${
        falta ? 'border-rose-100 bg-rose-50/50' : 'border-transparent bg-zinc-50/80'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold capitalize text-zinc-800">{data}</p>
          <p className="mt-0.5 text-xs tabular-nums text-zinc-500">
            {aula.hora_inicio}–{aula.hora_termino}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${status.classe}`}>{status.label}</span>
      </div>

      {falta && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {enviada ? (
            <span className="inline-flex h-8 items-center rounded-full bg-white px-3 text-xs font-semibold text-zinc-500 ring-1 ring-zinc-200">
              {pedido.status === 'aceita' ? 'Justificativa aceita' : 'Justificativa enviada'}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onJustificar(aula)}
              className="inline-flex h-8 items-center rounded-full bg-indigo-50 px-3 text-xs font-bold text-indigo-600 transition-colors hover:bg-indigo-600 hover:text-white"
            >
              Justificar
            </button>
          )}
          {reposicaoAberta ? (
            <span className="inline-flex h-8 items-center rounded-full bg-white px-3 text-xs font-semibold text-zinc-500 ring-1 ring-zinc-200">
              {reposicao.status === 'aprovada' ? 'Reposição aprovada' : 'Reposição enviada'}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onRepor(aula)}
              className="inline-flex h-8 items-center rounded-full bg-white px-3 text-xs font-bold text-indigo-600 ring-1 ring-indigo-100 transition-colors hover:bg-indigo-600 hover:text-white"
            >
              Pedir reposição
            </button>
          )}
        </div>
      )}
    </li>
  )
}
