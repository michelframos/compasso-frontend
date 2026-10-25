import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarClock, CheckCircle2, ClipboardCheck, Clock, Users } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { AULA_STATUS, AULA_TIPO } from '../constants'
import { hora, tituloAula } from '../lib/formatters'
import type { AulaDoProfessor } from '../types'

interface AulaCardProps {
  aula: AulaDoProfessor
  mostrarData?: boolean
  textoChamada?: string
  onChamada?: (aula: AulaDoProfessor) => void
  onAlterar?: (aula: AulaDoProfessor) => void
}

export const AulaCard: React.FC<AulaCardProps> = ({ aula, mostrarData = false, textoChamada = 'Chamada', onChamada, onAlterar }) => {
  const data = new Date(`${aula.data}T00:00:00`)
  const status = AULA_STATUS[aula.status ?? 'agendada']
  const cancelada = aula.status === 'cancelada'
  const alteravel = (aula.status ?? 'agendada') === 'agendada' && aula.data.substring(0, 10) >= format(new Date(), 'yyyy-MM-dd')
  const chamadaFeita = (aula.presencas_count ?? 0) > 0
  const totalAlunos = aula.aluno_especifico ? 1 : aula.turma?.matriculas?.length ?? 0

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-2xl border bg-white transition-all ${
        cancelada ? 'border-zinc-100 opacity-60' : 'border-zinc-100 shadow-sm'
      }`}
    >
      <div className="flex flex-col items-center justify-center min-w-[52px] h-14 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 shrink-0">
        {mostrarData ? (
          <>
            <span className="text-[10px] font-black uppercase leading-none capitalize">
              {format(data, 'EEE', { locale: ptBR })}
            </span>
            <span className="text-lg font-black leading-tight">{format(data, 'dd')}</span>
            <span className="text-[9px] font-bold leading-none">{format(data, 'MMM', { locale: ptBR })}</span>
          </>
        ) : (
          <>
            <Clock className="w-4 h-4 mb-0.5" />
            <span className="text-sm font-black leading-tight">{hora(aula.hora_inicio)}</span>
          </>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-zinc-900 truncate">{tituloAula(aula)}</p>
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px] text-zinc-500 font-medium">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {hora(aula.hora_inicio)} - {hora(aula.hora_termino)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {totalAlunos} {totalAlunos === 1 ? 'aluno' : 'alunos'}
          </span>
        </div>
        <div className="flex items-center flex-wrap gap-1.5 mt-2">
          {aula.tipo !== 'regular' && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-purple-50 text-purple-600 border-purple-100">
              {AULA_TIPO[aula.tipo] ?? aula.tipo}
            </span>
          )}
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.className}`}>{status.label}</span>
          {chamadaFeita && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-600 border-emerald-100">
              <CheckCircle2 className="w-3 h-3" />
              Chamada feita
            </span>
          )}
        </div>
      </div>

      {onAlterar && alteravel && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => onAlterar(aula)}
          aria-label="Alterar aula"
          title="Cancelar, repor ou pedir substituto"
          className="shrink-0 h-10 w-10 rounded-full text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 hover:cursor-pointer"
        >
          <CalendarClock className="w-4 h-4" />
        </Button>
      )}

      {onChamada && !cancelada && (
        <Button
          type="button"
          onClick={() => onChamada(aula)}
          className="shrink-0 h-10 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 font-bold text-xs gap-1.5 px-4 hover:cursor-pointer"
        >
          <ClipboardCheck className="w-4 h-4" />
          <span className="hidden sm:inline">{textoChamada}</span>
        </Button>
      )}
    </div>
  )
}
