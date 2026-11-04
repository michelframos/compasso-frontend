import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { MatriculaDoAluno } from '../../../types'
import { rotuloHorario, rotuloPeriodo, rotuloStatus, tituloMatricula } from '../lib/rotulos'

export function MatriculaCard({ matricula }: { matricula: MatriculaDoAluno }) {
  const detalhe = [matricula.curso?.nome, matricula.nivel?.nome].filter(Boolean).join(' · ')

  return (
    <Link
      to={`/aluno/matriculas/${matricula.id}`}
      className="block rounded-2xl border border-zinc-200 bg-white p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">{rotuloStatus(matricula.status)}</p>
          <h2 className="mt-1 text-base font-bold text-zinc-900">{tituloMatricula(matricula)}</h2>
          {detalhe && <p className="mt-0.5 text-sm text-zinc-500">{detalhe}</p>}
        </div>
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-zinc-300" />
      </div>
      <p className="mt-3 text-sm text-zinc-600">{matricula.professor?.nome ?? 'Professor a definir'}</p>
      <p className="mt-1 text-sm text-zinc-500">{rotuloHorario(matricula.horarios)}</p>
      <p className="mt-1 text-xs text-zinc-400">{rotuloPeriodo(matricula.periodo)}</p>
    </Link>
  )
}
