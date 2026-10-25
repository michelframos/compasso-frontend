import React from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, MapPin, Pencil, Trash2 } from 'lucide-react'
import { dataLocal } from '../../lib/formatters'
import type { EnsaioAgendado } from '../../types'

interface EnsaioItemProps {
  ensaio: EnsaioAgendado
  /** Na agenda geral, mostra a apresentação com link para o detalhe. */
  exibirApresentacao?: boolean
  passado?: boolean
  onEditar?: (ensaio: EnsaioAgendado) => void
  onExcluir?: (ensaio: EnsaioAgendado) => void
}

export const EnsaioItem: React.FC<EnsaioItemProps> = ({ ensaio, exibirApresentacao = false, passado = false, onEditar, onExcluir }) => {
  const data = dataLocal(ensaio.data)
  const apresentacao = ensaio.apresentacao
  const editavel = ensaio.pode_editar && !passado && onEditar && onExcluir

  return (
    <div className={`p-3 rounded-2xl bg-white border border-zinc-100 shadow-sm flex gap-3 ${passado ? 'opacity-60' : ''}`}>
      <div className="w-12 shrink-0 flex flex-col items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 py-1.5">
        <span className="text-[10px] font-bold uppercase leading-none">{format(data, 'MMM', { locale: ptBR })}</span>
        <span className="text-lg font-black leading-tight">{format(data, 'd')}</span>
        <span className="text-[9px] font-semibold uppercase leading-none">{format(data, 'EEE', { locale: ptBR })}</span>
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {exibirApresentacao && apresentacao ? (
              <Link
                to={`/professor/apresentacoes/${apresentacao.id}`}
                className="block text-sm font-bold text-zinc-900 truncate hover:text-indigo-600"
              >
                {apresentacao.titulo_musica || 'Apresentação'}
              </Link>
            ) : (
              <p className="text-sm font-bold text-zinc-900">
                {ensaio.pode_editar ? 'Conduzido por você' : ensaio.professor?.nome ?? 'Sem condutor definido'}
              </p>
            )}
            {exibirApresentacao && apresentacao?.espetaculo && (
              <p className="text-xs text-zinc-500 truncate">{apresentacao.espetaculo.titulo}</p>
            )}
          </div>

          {editavel && (
            <div className="flex gap-1 shrink-0 -mt-1 -mr-1">
              <button
                type="button"
                onClick={() => onEditar(ensaio)}
                className="p-2 rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-indigo-600 hover:cursor-pointer"
                aria-label="Editar ensaio"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onExcluir(ensaio)}
                className="p-2 rounded-full text-zinc-400 hover:bg-rose-50 hover:text-rose-600 hover:cursor-pointer"
                aria-label="Excluir ensaio"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-600">
          <span className="inline-flex items-center gap-1 font-semibold">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            {ensaio.hora_inicio}–{ensaio.hora_termino}
          </span>
          {ensaio.local && (
            <span className="inline-flex items-center gap-1 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="truncate">{ensaio.local}</span>
            </span>
          )}
        </div>

        {ensaio.observacoes && <p className="text-xs text-zinc-500 whitespace-pre-line break-words">{ensaio.observacoes}</p>}
      </div>
    </div>
  )
}
