import React from 'react'
import { format } from 'date-fns'
import { CalendarClock, CalendarRange, Clock } from 'lucide-react'
import { diaSemana, hora, ordenarHorarios } from '../../../lib/formatters'
import type { TurmaDoProfessor } from '../../../types'

const dataBr = (valor: string | null) => (valor ? format(new Date(`${valor.substring(0, 10)}T00:00:00`), 'dd/MM/yyyy') : '—')

export const HorariosTab: React.FC<{ turma: TurmaDoProfessor }> = ({ turma }) => {
  const horarios = ordenarHorarios(turma.horarios)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-zinc-100">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <CalendarRange className="w-3.5 h-3.5" /> Início
          </p>
          <p className="text-sm font-bold text-zinc-800 mt-1">{dataBr(turma.data_inicio)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-zinc-100">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <CalendarRange className="w-3.5 h-3.5" /> Término
          </p>
          <p className="text-sm font-bold text-zinc-800 mt-1">{dataBr(turma.data_fim)}</p>
        </div>
      </div>

      {horarios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-zinc-100 rounded-full text-zinc-400 mb-4">
            <CalendarClock className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">Sem horários fixos</h3>
          <p className="text-zinc-500 max-w-xs mx-auto mt-1 text-sm">As aulas desta turma são agendadas avulsas.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {horarios.map((h) => (
            <div key={h.id} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm">
              <span className="text-sm font-bold text-zinc-800">{diaSemana(h.dia_semana)}</span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600">
                <Clock className="w-4 h-4" />
                {hora(h.hora_inicio)} - {hora(h.hora_termino)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
