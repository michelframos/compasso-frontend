import React from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import { linkFichaAluno } from '../../../lib/formatters'
import type { FrequenciaDoAluno } from '../../../types'

interface AlertaAlunosEmRiscoProps {
  alunos: FrequenciaDoAluno[]
  limiteFaltas: number
  idTurma: number | null
}

export const AlertaAlunosEmRisco: React.FC<AlertaAlunosEmRiscoProps> = ({ alunos, limiteFaltas, idTurma }) => (
  <section className="p-4 sm:p-5 rounded-3xl bg-rose-50 border border-rose-100 space-y-3">
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0">
        <AlertTriangle className="w-4 h-4" />
      </div>
      <div>
        <h2 className="font-bold text-rose-900">
          {alunos.length} {alunos.length === 1 ? 'aluno em risco' : 'alunos em risco'}
        </h2>
        <p className="text-sm text-rose-700">
          {limiteFaltas} ou mais faltas seguidas sem justificativa. Vale conversar com o aluno ou o responsável.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {alunos.map((aluno) => (
        <Link
          key={aluno.id}
          to={linkFichaAluno(aluno.id, idTurma)}
          className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-white border border-rose-100 hover:border-rose-200 transition-colors"
        >
          <div className="min-w-0">
            <p className="text-sm font-bold text-zinc-900 truncate">{aluno.nome_aluno}</p>
            <p className="text-xs font-semibold text-rose-600">{aluno.faltas_consecutivas} faltas seguidas</p>
          </div>
          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-rose-700 shrink-0">
            Ver ficha
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      ))}
    </div>
  </section>
)
