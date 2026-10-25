import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Clock, Users } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { TURMA_STATUS } from '../../../constants'
import { diaSemana, hora, nomeTurma, ordenarHorarios } from '../../../lib/formatters'
import type { TurmaDoProfessor } from '../../../types'

export const TurmaCard: React.FC<{ turma: TurmaDoProfessor }> = ({ turma }) => {
  const status = TURMA_STATUS[turma.status] ?? TURMA_STATUS.planejamento
  const horarios = ordenarHorarios(turma.horarios)

  return (
    <Link to={`/professor/turmas/${turma.id}`} className="block">
      <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow h-full">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-zinc-900 truncate">{nomeTurma(turma)}</p>
              {turma.descricao && <p className="text-sm text-zinc-500 truncate">{turma.descricao}</p>}
            </div>
            <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${status.className}`}>
              {status.label}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {horarios.length === 0 ? (
              <span className="text-[11px] text-zinc-400">Sem horários fixos</span>
            ) : (
              horarios.map((h) => (
                <span
                  key={h.id}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-50 border border-zinc-100 text-[11px] font-semibold text-zinc-600"
                >
                  <Clock className="w-3 h-3 text-zinc-400" />
                  {diaSemana(h.dia_semana, true)} {hora(h.hora_inicio)}-{hora(h.hora_termino)}
                </span>
              ))
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-zinc-600 font-medium">
              <Users className="w-4 h-4 text-indigo-500" />
              {turma.alunos_ativos_count ?? 0}
              <span className="text-zinc-400">/ {turma.maximo_alunos} alunos</span>
            </span>
            <ChevronRight className="w-4 h-4 text-zinc-300" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
