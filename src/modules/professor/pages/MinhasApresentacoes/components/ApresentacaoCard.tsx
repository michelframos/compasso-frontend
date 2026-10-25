import React from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarClock, CalendarDays, ChevronRight, Users } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { ESPETACULO_STATUS } from '../../../constants'
import { dataLocal, nomeTurma } from '../../../lib/formatters'
import type { ApresentacaoDoProfessor } from '../../../types'

export const ApresentacaoCard: React.FC<{ apresentacao: ApresentacaoDoProfessor }> = ({ apresentacao }) => {
  const { espetaculo, turma, proximo_ensaio: proximo } = apresentacao
  const status = espetaculo ? ESPETACULO_STATUS[espetaculo.status] ?? ESPETACULO_STATUS.planejamento : null

  return (
    <Link to={`/professor/apresentacoes/${apresentacao.id}`} className="block">
      <Card className="border-none shadow-sm bg-white hover:shadow-md transition-shadow h-full">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-600 truncate">
                {espetaculo?.titulo ?? 'Espetáculo'}
              </p>
              <p className="font-bold text-zinc-900 truncate">{apresentacao.titulo_musica || 'Apresentação'}</p>
              <p className="text-sm text-zinc-500 truncate">
                {turma ? `${nomeTurma(turma)}${turma.minha ? ' · sua turma' : ''}` : 'Sem turma vinculada'}
              </p>
              {espetaculo && (
                <p className="flex items-center gap-1 mt-1 min-w-0 text-xs font-semibold text-zinc-600">
                  <CalendarDays className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                  <span className="whitespace-nowrap">{format(dataLocal(espetaculo.data_evento), 'dd/MM/yyyy')}</span>
                  {espetaculo.local && <span className="min-w-0 font-normal text-zinc-400 truncate">· {espetaculo.local}</span>}
                </p>
              )}
            </div>
            {status && (
              <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${status.className}`}>
                {status.label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-zinc-50 border border-zinc-100 text-xs text-zinc-600">
            <CalendarClock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            {proximo ? (
              <span className="truncate">
                Próximo ensaio:{' '}
                <strong className="text-zinc-800">
                  {format(dataLocal(proximo.data), "d 'de' MMM", { locale: ptBR })} às {proximo.hora_inicio}
                </strong>
                {apresentacao.ensaios_futuros > 1 && ` (+${apresentacao.ensaios_futuros - 1})`}
              </span>
            ) : (
              <span className="text-zinc-400">Nenhum ensaio agendado</span>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-zinc-600 font-medium">
              <Users className="w-4 h-4 text-indigo-500" />
              {apresentacao.total_participantes}
              <span className="text-zinc-400">
                {apresentacao.total_participantes === 1 ? 'participante' : 'participantes'}
                {apresentacao.meus_alunos > 0 && ` · ${apresentacao.meus_alunos} ${apresentacao.meus_alunos === 1 ? 'aluno seu' : 'alunos seus'}`}
              </span>
            </span>
            <ChevronRight className="w-4 h-4 text-zinc-300" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
