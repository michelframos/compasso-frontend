import React from 'react'
import { ArrowRight, Check, X } from 'lucide-react'
import type { ModoDecisao } from '../hooks/useProgressoes'
import type { StatusProgressao, SugestaoProgressao } from '../types'

const STATUS: Record<StatusProgressao, { label: string; className: string }> = {
  pendente: { label: 'Pendente', className: 'bg-amber-100 text-amber-700' },
  aprovada: { label: 'Aprovada', className: 'bg-emerald-100 text-emerald-700' },
  rejeitada: { label: 'Rejeitada', className: 'bg-rose-100 text-rose-700' },
}

const data = (valor: string) => new Date(valor).toLocaleDateString('pt-BR')

interface SugestaoProgressaoCardProps {
  sugestao: SugestaoProgressao
  onDecidir: (sugestao: SugestaoProgressao, modo: ModoDecisao) => void
}

export const SugestaoProgressaoCard: React.FC<SugestaoProgressaoCardProps> = ({ sugestao, onDecidir }) => {
  const status = STATUS[sugestao.status]
  const matricula = sugestao.matricula
  const vinculo =
    matricula?.tipo === 'curso'
      ? `${matricula.curso?.nome ?? 'Curso'} · Aulas individuais`
      : `${matricula?.curso?.nome ?? 'Curso'} · ${matricula?.turma?.descricao ?? `Turma #${matricula?.turma?.id}`}`

  return (
    <div className="p-5 rounded-2xl bg-white border border-zinc-100 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 shrink-0">
            {sugestao.aluno?.nome?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-zinc-900 truncate">{sugestao.aluno?.nome ?? 'Aluno'}</p>
            <p className="text-[11px] text-zinc-500 truncate">{vinculo}</p>
          </div>
        </div>
        <span className={`self-start px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.className}`}>
          {status.label}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-zinc-800">
        <span className="px-2.5 py-1 rounded-lg bg-zinc-100">{sugestao.nivel_atual?.nome ?? 'Nível atual'}</span>
        <ArrowRight className="w-4 h-4 text-indigo-500" />
        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700">{sugestao.nivel_sugerido?.nome}</span>
      </div>

      <div className="text-sm text-zinc-700 whitespace-pre-line break-words">{sugestao.justificativa}</div>
      <p className="text-[11px] text-zinc-400">
        Sugerida por {sugestao.professor?.nome ?? 'professor'} em {data(sugestao.created_at)}
      </p>

      {sugestao.status !== 'pendente' && (
        <p className="text-xs text-zinc-500 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
          {status.label} por {sugestao.decisor?.nome ?? '—'}
          {sugestao.decidido_em && ` em ${data(sugestao.decidido_em)}`}
          {sugestao.turma_destino && ` · transferido para ${sugestao.turma_destino.descricao ?? `turma #${sugestao.turma_destino.id}`}`}
          {sugestao.motivo_decisao && <span className="block mt-1 text-zinc-700">{sugestao.motivo_decisao}</span>}
        </p>
      )}

      {sugestao.status === 'pendente' && (
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => onDecidir(sugestao, 'rejeitada')}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 hover:cursor-pointer"
          >
            <X className="w-4 h-4" />
            Rejeitar
          </button>
          <button
            type="button"
            onClick={() => onDecidir(sugestao, 'aprovada')}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 hover:cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Aprovar
          </button>
        </div>
      )}
    </div>
  )
}
