import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { DiarioTurma } from '../../../types'

export const ConteudosLista: React.FC<{ aulas: DiarioTurma['aulas'] }> = ({ aulas }) => (
  <div className="space-y-2">
    {aulas.map((aula) => {
      const data = new Date(`${aula.data}T00:00:00`)
      return (
        <div key={aula.id} className="flex gap-3 p-3 rounded-2xl bg-white border border-zinc-100">
          <div className="flex flex-col items-center justify-center w-14 shrink-0 border-r border-zinc-100 pr-3">
            <span className="text-[10px] font-black uppercase text-indigo-500">{format(data, 'EEE', { locale: ptBR })}</span>
            <span className="text-base font-black text-zinc-900">{format(data, 'dd/MM')}</span>
          </div>
          <p className="flex-1 text-sm text-zinc-700 whitespace-pre-line self-center">
            {aula.conteudo_dado || <span className="text-zinc-400 italic">Conteúdo não informado.</span>}
          </p>
        </div>
      )
    })}
  </div>
)
