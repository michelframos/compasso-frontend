import React from 'react'
import { format } from 'date-fns'
import type { DiarioPresenca, DiarioTurma } from '../../../types'

const CELULA: Record<DiarioPresenca, { sigla: string; className: string }> = {
  presente: { sigla: 'P', className: 'text-emerald-600 bg-emerald-50' },
  falta: { sigla: 'F', className: 'text-rose-600 bg-rose-50' },
  falta_justificada: { sigla: 'J', className: 'text-amber-600 bg-amber-50' },
}

interface DiarioGradeProps {
  diario: DiarioTurma
  frequencias: Record<number, number | null>
}

export const DiarioGrade: React.FC<DiarioGradeProps> = ({ diario, frequencias }) => (
  <div className="space-y-2">
    <div className="overflow-x-auto rounded-2xl border border-zinc-100 bg-white shadow-sm">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-zinc-50 border-b border-zinc-100">
            <th className="sticky left-0 z-10 bg-zinc-50 px-3 py-2 font-bold text-[11px] uppercase text-zinc-400 min-w-[150px]">
              Aluno
            </th>
            {diario.aulas.map((aula) => (
              <th key={aula.id} className="px-1 py-2 text-center font-bold text-[10px] text-zinc-500 border-l border-zinc-100 min-w-[44px]">
                {format(new Date(`${aula.data}T00:00:00`), 'dd/MM')}
              </th>
            ))}
            <th className="px-2 py-2 text-center font-bold text-[10px] uppercase text-zinc-400 border-l border-zinc-100 min-w-[52px]">
              Freq.
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50">
          {diario.alunos.map((aluno) => {
            const frequencia = frequencias[aluno.id_aluno]
            return (
              <tr key={aluno.id_aluno}>
                <td className="sticky left-0 z-10 bg-white px-3 py-2 font-semibold text-zinc-800 max-w-[180px] truncate">
                  {aluno.nome}
                  {aluno.status !== 'ativa' && (
                    <span className="ml-1 text-[9px] font-bold uppercase text-zinc-400">({aluno.status})</span>
                  )}
                </td>
                {diario.aulas.map((aula) => {
                  const presenca = aula.presencas[aluno.id_aluno]
                  const celula = presenca ? CELULA[presenca] : null
                  return (
                    <td key={aula.id} className="p-1 text-center border-l border-zinc-50">
                      <span
                        className={`inline-flex w-7 h-7 items-center justify-center rounded-lg font-black ${celula?.className ?? 'text-zinc-300'}`}
                      >
                        {celula?.sigla ?? '-'}
                      </span>
                    </td>
                  )
                })}
                <td
                  className={`px-2 py-2 text-center font-bold border-l border-zinc-50 ${
                    frequencia === null ? 'text-zinc-300' : frequencia < 75 ? 'text-rose-600' : 'text-zinc-700'
                  }`}
                >
                  {frequencia === null ? '-' : `${frequencia}%`}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
    <div className="flex flex-wrap gap-3 text-[10px] font-bold uppercase text-zinc-400">
      <span><span className="text-emerald-600">P</span> Presente</span>
      <span><span className="text-rose-600">F</span> Falta</span>
      <span><span className="text-amber-600">J</span> Justificada</span>
      <span><span className="text-zinc-300">-</span> Não lançado</span>
    </div>
  </div>
)
