import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, GraduationCap, User } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { apelidoTurma, nomeTurma } from '../../../lib/formatters'
import type { AlunoDoProfessor } from '../../../types'

type Matricula = AlunoDoProfessor['matriculas'][number]

const VinculoMatricula: React.FC<{ matricula: Matricula }> = ({ matricula }) => {
  const individual = matricula.tipo === 'curso'
  const Icone = individual ? User : GraduationCap
  const rotulo = individual
    ? `${nomeTurma({ descricao: null, curso: matricula.curso, nivel: matricula.nivel })} · Individual`
    : apelidoTurma({ descricao: matricula.turma?.descricao ?? null, curso: matricula.curso, nivel: matricula.nivel })

  return (
    <span
      className={`inline-flex items-center gap-1 max-w-full px-2 py-1 rounded-lg border text-[11px] font-semibold ${
        individual ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-zinc-50 border-zinc-100 text-zinc-600'
      }`}
    >
      <Icone className="w-3 h-3 shrink-0" />
      <span className="truncate">{rotulo}</span>
    </span>
  )
}

export const AlunoCard: React.FC<{ aluno: AlunoDoProfessor }> = ({ aluno }) => {
  const nome = aluno.nome ?? 'Aluno'
  const turmas = aluno.matriculas.filter((m) => m.id_turma)
  const destino = turmas.length === 1 ? `/professor/alunos/${aluno.id}?turma=${turmas[0].id_turma}` : `/professor/alunos/${aluno.id}`

  return (
    <Link to={destino} className="block">
      <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow h-full">
        <CardContent className="p-4 flex items-center gap-3">
          {aluno.foto_url ? (
            <img src={aluno.foto_url} alt={nome} className="w-11 h-11 rounded-xl object-cover border border-zinc-100 shrink-0" />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-lg font-black text-indigo-600 shrink-0">
              {nome.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1 flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
            <div className="min-w-0 md:w-1/3 md:shrink-0">
              <p className="font-bold text-zinc-900 truncate">{nome}</p>
              {aluno.email && <p className="text-xs text-zinc-500 truncate">{aluno.email}</p>}
            </div>
            <div className="min-w-0 flex-1 flex flex-wrap gap-1.5">
              {aluno.matriculas.map((m) => (
                <VinculoMatricula key={m.id} matricula={m} />
              ))}
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-zinc-300 shrink-0" />
        </CardContent>
      </Card>
    </Link>
  )
}
