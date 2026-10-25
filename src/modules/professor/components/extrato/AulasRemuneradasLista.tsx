import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { apelidoTurma, dataLocal, duracao, moeda } from '../../lib/formatters'
import type { AulaRemunerada } from '../../types'

const rotulo = (aula: AulaRemunerada) => {
  if (aula.turma) return apelidoTurma(aula.turma)
  return ['Aula individual', aula.curso?.nome].filter(Boolean).join(' · ')
}

export const AulasRemuneradasLista: React.FC<{ aulas: AulaRemunerada[] }> = ({ aulas }) => (
  <section className="space-y-3">
    <h2 className="text-[13px] font-black text-zinc-500 uppercase tracking-wider">Aulas concluídas</h2>
    {aulas.length === 0 ? (
      <p className="text-sm text-zinc-500 bg-white rounded-2xl px-4 py-5 shadow-sm">Nenhuma aula concluída neste mês.</p>
    ) : (
      <div className="bg-white rounded-2xl shadow-sm divide-y divide-zinc-100">
        {aulas.map((aula) => (
          <div key={aula.id} className="flex items-center gap-4 px-4 py-3">
            <div className="w-12 shrink-0 text-center">
              <p className="text-lg font-black text-zinc-900 leading-none">{format(dataLocal(aula.data), 'dd')}</p>
              <p className="text-[11px] font-bold uppercase text-zinc-400">{format(dataLocal(aula.data), 'EEE', { locale: ptBR })}</p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-zinc-800 truncate">{rotulo(aula)}</p>
              <p className="text-[12px] text-zinc-500 truncate">
                {aula.hora_inicio}–{aula.hora_termino}
                {aula.aluno?.nome ? ` · ${aula.aluno.nome}` : ''}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-black text-zinc-900">{moeda(aula.valor)}</p>
              <p className="text-[11px] text-zinc-500 whitespace-nowrap">
                {duracao(aula.horas)} × {moeda(aula.valor_hora)}
              </p>
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
)
