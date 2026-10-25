import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { FichaAluno, PresencaStatus, ResumoFrequencia } from '../../../types'
import { apelidoTurma } from '../../../lib/formatters'

const STATUS_PRESENCA: Record<PresencaStatus, { sigla: string; label: string; className: string }> = {
  presente: { sigla: 'P', label: 'Presente', className: 'bg-emerald-500 text-white' },
  ausente: { sigla: 'F', label: 'Falta', className: 'bg-rose-500 text-white' },
  justificado: { sigla: 'J', label: 'Falta justificada', className: 'bg-amber-500 text-white' },
}

const corPercentual = (percentual: number | null) => {
  if (percentual === null) return 'text-zinc-400'
  if (percentual >= 75) return 'text-emerald-600'
  if (percentual >= 50) return 'text-amber-600'
  return 'text-rose-600'
}

const corBarra = (percentual: number) => {
  if (percentual >= 75) return 'bg-emerald-500'
  if (percentual >= 50) return 'bg-amber-500'
  return 'bg-rose-500'
}

const Contadores: React.FC<{ resumo: ResumoFrequencia }> = ({ resumo }) => (
  <div className="flex items-center gap-3 text-xs font-bold">
    <span className="text-emerald-600">P {resumo.presentes}</span>
    <span className="text-rose-600">F {resumo.ausentes}</span>
    <span className="text-amber-600">J {resumo.justificados}</span>
  </div>
)

interface FrequenciaResumoProps {
  frequencia: FichaAluno['frequencia']
  matriculas: FichaAluno['matriculas']
}

export const FrequenciaResumo: React.FC<FrequenciaResumoProps> = ({ frequencia, matriculas }) => {
  const turmaPorId = new Map(matriculas.filter((m) => m.turma).map((m) => [m.id_turma, m.turma]))

  if (frequencia.total === 0) {
    return (
      <p className="text-sm text-zinc-400 bg-white rounded-2xl border border-dashed border-zinc-200 p-4 text-center">
        Nenhuma chamada registrada para este aluno nas suas aulas.
      </p>
    )
  }

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-white border border-zinc-100 shadow-sm space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className={`text-3xl font-black ${corPercentual(frequencia.percentual_presenca)}`}>
            {frequencia.percentual_presenca ?? 0}%
          </p>
          <p className="text-xs text-zinc-500">de presença em {frequencia.total} {frequencia.total === 1 ? 'aula' : 'aulas'}</p>
        </div>
        <Contadores resumo={frequencia} />
      </div>

      {frequencia.por_turma.length > 1 && (
        <div className="space-y-3">
          {frequencia.por_turma.map((turma) => (
            <div key={turma.id_turma ?? 'individuais'} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-zinc-700 truncate">
                  {turma.id_turma === null ? 'Aulas individuais' : apelidoTurma(turmaPorId.get(turma.id_turma))}
                </span>
                <span className={`font-bold ${corPercentual(turma.percentual_presenca)}`}>
                  {turma.percentual_presenca === null ? '—' : `${turma.percentual_presenca}%`}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                {turma.percentual_presenca !== null && (
                  <div className={`h-full rounded-full ${corBarra(turma.percentual_presenca)}`} style={{ width: `${turma.percentual_presenca}%` }} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {frequencia.ultimas.length > 0 && (
        <div className="pt-3 border-t border-zinc-100 space-y-2">
          <p className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">Últimas aulas</p>
          <div className="flex flex-wrap gap-1.5">
            {frequencia.ultimas.map((presenca) => {
              const status = STATUS_PRESENCA[presenca.status]
              const data = format(new Date(`${presenca.data}T00:00:00`), 'dd/MM', { locale: ptBR })
              return (
                <div
                  key={presenca.id_aula}
                  title={`${data} · ${status.label}${presenca.observacao ? ` · ${presenca.observacao}` : ''}`}
                  className="flex flex-col items-center gap-1"
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${status.className}`}>
                    {status.sigla}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-semibold">{data}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
