import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import type { FichaAluno } from '../../../types'
import { nomeTurma } from '../../../lib/formatters'

type Matricula = FichaAluno['matriculas'][number]

const StatusMatricula: React.FC<{ status: string | null }> = ({ status }) => (
  <span
    className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
      status === 'ativa' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'
    }`}
  >
    {status || 'Pendente'}
  </span>
)

const ConteudoMatricula: React.FC<{ matricula: Matricula }> = ({ matricula }) => {
  const individual = matricula.tipo === 'curso'
  const titulo = individual
    ? nomeTurma({ descricao: null, curso: matricula.curso, nivel: matricula.nivel })
    : nomeTurma(matricula.turma)
  const detalhes = [
    individual ? 'Aulas individuais' : matricula.turma?.descricao,
    matricula.data && `Matrícula em ${format(new Date(`${matricula.data}T00:00:00`), 'dd/MM/yyyy')}`,
  ].filter(Boolean)

  return (
    <div className="min-w-0 flex-1">
      <p className="text-sm font-bold text-zinc-900 truncate">{titulo}</p>
      <p className="text-xs text-zinc-500 truncate">{detalhes.join(' · ')}</p>
    </div>
  )
}

export const MatriculasLista: React.FC<{ matriculas: FichaAluno['matriculas'] }> = ({ matriculas }) => (
  <div className="rounded-3xl bg-white border border-zinc-100 shadow-sm divide-y divide-zinc-50 overflow-hidden">
    {matriculas.map((matricula) =>
      matricula.id_turma ? (
        <Link
          key={matricula.id}
          to={`/professor/turmas/${matricula.id_turma}`}
          className="flex items-center gap-3 p-4 hover:bg-zinc-50/60 transition-colors"
        >
          <ConteudoMatricula matricula={matricula} />
          <StatusMatricula status={matricula.status} />
          <ChevronRight className="w-4 h-4 text-zinc-300 shrink-0" />
        </Link>
      ) : (
        <div key={matricula.id} className="flex items-center gap-3 p-4">
          <ConteudoMatricula matricula={matricula} />
          <StatusMatricula status={matricula.status} />
          <span className="w-4 shrink-0" />
        </div>
      )
    )}
  </div>
)
