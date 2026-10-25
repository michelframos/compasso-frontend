import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Pencil, Trash2 } from 'lucide-react'
import { AVALIACAO_TIPOS, CONCEITOS } from '../../constants'
import { apelidoTurma } from '../../lib/formatters'
import type { AvaliacaoAluno } from '../../types'

interface AvaliacaoItemProps {
  avaliacao: AvaliacaoAluno
  /** Na turma, cada item mostra o aluno; na ficha, a turma. */
  exibir: 'aluno' | 'turma'
  onEditar: (avaliacao: AvaliacaoAluno) => void
  onExcluir: (avaliacao: AvaliacaoAluno) => void
}

const corDaNota = (nota: number) => (nota >= 7 ? 'text-emerald-600' : nota >= 5 ? 'text-amber-600' : 'text-rose-600')

export const AvaliacaoItem: React.FC<AvaliacaoItemProps> = ({ avaliacao, exibir, onEditar, onExcluir }) => {
  const conceito = avaliacao.conceito ? CONCEITOS[avaliacao.conceito] : null
  const contexto =
    exibir === 'aluno' ? avaliacao.aluno?.nome ?? 'Aluno' : avaliacao.turma ? apelidoTurma(avaliacao.turma) : 'Aulas individuais'

  return (
    <div className="p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm flex gap-4">
      <div className="w-14 shrink-0 flex flex-col items-center justify-center rounded-xl bg-zinc-50 border border-zinc-100 py-2">
        {avaliacao.nota !== null ? (
          <span className={`text-xl font-black leading-none ${corDaNota(avaliacao.nota)}`}>
            {avaliacao.nota.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
          </span>
        ) : (
          <span className="text-xl font-black leading-none text-zinc-300">—</span>
        )}
        <span className="text-[9px] font-bold uppercase text-zinc-400 mt-1">nota</span>
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-zinc-900 truncate">{contexto}</p>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="px-2 py-0.5 rounded-full border border-zinc-200 bg-zinc-50 text-[10px] font-bold uppercase text-zinc-600">
                {AVALIACAO_TIPOS[avaliacao.tipo]}
              </span>
              {conceito && (
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${conceito.className}`}>
                  {conceito.label}
                </span>
              )}
            </div>
          </div>

          {avaliacao.pode_editar && (
            <div className="flex gap-1 shrink-0 -mt-1 -mr-1">
              <button
                type="button"
                onClick={() => onEditar(avaliacao)}
                className="p-2 rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 hover:cursor-pointer"
                aria-label="Editar avaliação"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onExcluir(avaliacao)}
                className="p-2 rounded-full text-zinc-400 hover:bg-rose-50 hover:text-rose-600 hover:cursor-pointer"
                aria-label="Excluir avaliação"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {avaliacao.comentario && (
          <p className="text-sm text-zinc-700 whitespace-pre-line break-words">{avaliacao.comentario}</p>
        )}

        <p className="text-[11px] text-zinc-400">
          {format(new Date(`${avaliacao.data}T00:00:00`), "d 'de' MMM yyyy", { locale: ptBR })} ·{' '}
          {avaliacao.pode_editar ? 'Você' : avaliacao.professor?.nome ?? 'Professor'}
        </p>
      </div>
    </div>
  )
}
