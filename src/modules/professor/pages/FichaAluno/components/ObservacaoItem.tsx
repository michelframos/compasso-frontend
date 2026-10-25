import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { OBSERVACAO_TIPOS } from '../../../constants'
import { apelidoTurma } from '../../../lib/formatters'
import type { ObservacaoAluno } from '../../../types'

interface ObservacaoItemProps {
  observacao: ObservacaoAluno
  onEditar: (observacao: ObservacaoAluno) => void
  onExcluir: (observacao: ObservacaoAluno) => void
}

export const ObservacaoItem: React.FC<ObservacaoItemProps> = ({ observacao, onEditar, onExcluir }) => {
  const tipo = OBSERVACAO_TIPOS[observacao.tipo]
  const editada = observacao.updated_at !== observacao.created_at

  return (
    <div className="p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${tipo.className}`}>{tipo.label}</span>
          {observacao.turma && <span className="text-[11px] font-semibold text-zinc-500">{apelidoTurma(observacao.turma)}</span>}
          {observacao.visivel_responsavel && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600" title="Visível para o responsável">
              <Eye className="w-3.5 h-3.5" />
              Responsável
            </span>
          )}
        </div>

        {observacao.pode_editar && (
          <div className="flex gap-1 shrink-0 -mt-1 -mr-1">
            <button
              type="button"
              onClick={() => onEditar(observacao)}
              className="p-2 rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 hover:cursor-pointer"
              aria-label="Editar observação"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onExcluir(observacao)}
              className="p-2 rounded-full text-zinc-400 hover:bg-rose-50 hover:text-rose-600 hover:cursor-pointer"
              aria-label="Excluir observação"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <p className="text-sm text-zinc-700 whitespace-pre-line break-words">{observacao.texto}</p>

      <p className="text-[11px] text-zinc-400">
        {observacao.pode_editar ? 'Você' : observacao.professor?.nome ?? 'Professor'} ·{' '}
        {format(new Date(observacao.created_at), "d 'de' MMM yyyy, HH:mm", { locale: ptBR })}
        {editada && ' · editada'}
      </p>
    </div>
  )
}
