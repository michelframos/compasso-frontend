import React from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import { linkFichaAluno } from '../../../lib/formatters'
import type { FrequenciaDoAluno } from '../../../types'

const percentualPresenca = (aluno: FrequenciaDoAluno) =>
  aluno.total_aulas > 0 ? Math.round((aluno.total_presencas / aluno.total_aulas) * 100) : 0

const corPercentual = (percentual: number) => {
  if (percentual >= 75) return { texto: 'text-emerald-600', barra: 'bg-emerald-500' }
  if (percentual >= 50) return { texto: 'text-amber-600', barra: 'bg-amber-500' }
  return { texto: 'text-rose-600', barra: 'bg-rose-500' }
}

interface AlunoFrequenciaItemProps {
  aluno: FrequenciaDoAluno
  idTurma: number | null
}

export const AlunoFrequenciaItem: React.FC<AlunoFrequenciaItemProps> = ({ aluno, idTurma }) => {
  const percentual = percentualPresenca(aluno)
  const cor = corPercentual(percentual)
  const faltasNaoJustificadas = aluno.total_faltas - aluno.total_justificadas

  return (
    <Link to={linkFichaAluno(aluno.id, idTurma)} className="block">
      <div
        className={`p-4 rounded-2xl bg-white border shadow-sm hover:shadow-md transition-shadow flex items-center gap-3 ${
          aluno.em_risco ? 'border-rose-200' : 'border-zinc-100'
        }`}
      >
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="font-bold text-zinc-900 truncate">{aluno.nome_aluno}</p>
            <span className={`text-sm font-black shrink-0 ${cor.texto}`}>{percentual}%</span>
          </div>

          <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
            <div className={`h-full rounded-full ${cor.barra}`} style={{ width: `${percentual}%` }} />
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-bold">
            <span className="text-zinc-500 font-semibold">
              {aluno.total_aulas} {aluno.total_aulas === 1 ? 'aula' : 'aulas'}
            </span>
            <span className="text-emerald-600">P {aluno.total_presencas}</span>
            <span className="text-rose-600">F {faltasNaoJustificadas}</span>
            <span className="text-amber-600">J {aluno.total_justificadas}</span>
            {aluno.faltas_consecutivas > 0 && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] ${
                  aluno.em_risco ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                }`}
              >
                {aluno.em_risco && <AlertTriangle className="w-3 h-3" />}
                {aluno.faltas_consecutivas} {aluno.faltas_consecutivas === 1 ? 'falta seguida' : 'faltas seguidas'}
              </span>
            )}
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-zinc-300 shrink-0" />
      </div>
    </Link>
  )
}
