import React from 'react';
import { Users, BookOpen, Clock, CalendarDays, Loader2 } from 'lucide-react';
import type { Turma } from '../hooks/useProfessores';
import { Card, CardContent } from '@/shared/components/ui/card';

interface ProfessorTurmasProps {
  turmas?: Turma[];
  isLoading?: boolean;
}

const DIAS_SEMANA = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
  'Quinta-feira', 'Sexta-feira', 'Sábado'
];

export const ProfessorTurmas: React.FC<ProfessorTurmasProps> = ({ turmas, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm text-zinc-500 font-medium">Carregando turmas e alunos...</p>
      </div>
    );
  }

  if (!turmas || turmas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 bg-zinc-100 rounded-full text-zinc-400 mb-4">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-zinc-900">Nenhuma turma vinculada</h3>
        <p className="text-zinc-500 max-w-xs mx-auto mt-1 text-sm">
          Este professor ainda não possui turmas ou horários atribuídos no sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {turmas.map((turma) => (
        <Card key={turma.id} className="border border-zinc-100 shadow-sm overflow-hidden">
          <div className="bg-zinc-50/50 px-6 py-4 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {turma.curso?.nome ?? 'Sem Curso'}
                </span>
                <span className="px-2 py-0.5 bg-zinc-200 text-zinc-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {turma.nivel?.nome ?? 'Sem Nível'}
                </span>
              </div>
              <h4 className="text-base font-bold text-zinc-900">
                {turma.descricao || `Turma #${turma.id}`}
              </h4>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs text-zinc-600 bg-white px-3 py-1.5 rounded-full border border-zinc-200 shadow-sm">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-bold">{turma.matriculas.length} / {turma.maximo_alunos}</span> Alunos
              </div>

              <div className="flex flex-col gap-1">
                {turma.horarios.map((horario) => (
                  <div key={horario.id} className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
                    <CalendarDays className="w-3 h-3 text-zinc-400" />
                    {DIAS_SEMANA[horario.dia_semana]}
                    <span className="text-zinc-300 mx-1">|</span>
                    <Clock className="w-3 h-3 text-zinc-400" />
                    {horario.hora_inicio?.substring(0, 5) ?? '--:--'} - {horario.hora_fim?.substring(0, 5) ?? '--:--'}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <CardContent className="p-0">
            {turma.matriculas.length === 0 ? (
              <div className="px-6 py-8 text-center bg-white">
                <p className="text-xs text-zinc-400 italic">Nenhum aluno matriculado nesta turma até o momento.</p>
              </div>
            ) : (
              <div className="overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50/30 border-b border-zinc-50">
                        <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Aluno</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Contato</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {turma.matriculas.map((matricula) => (
                        <tr key={matricula.id} className="hover:bg-zinc-50/30 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-[11px] font-bold text-zinc-600 border border-zinc-200">
                                {matricula.aluno?.usuario?.nome?.charAt(0).toUpperCase() ?? '?'}
                              </div>
                              <span className="text-sm font-medium text-zinc-700">{matricula.aluno?.usuario?.nome ?? 'Aluno sem Nome'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex flex-col gap-1">
                              <span className="text-[11px] text-zinc-500">{matricula.aluno?.usuario?.email ?? '-'}</span>
                              {matricula.aluno?.usuario?.telefone && (
                                <span className="text-[11px] text-zinc-400">{matricula.aluno.usuario.telefone}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${matricula.status === 'ativa'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-zinc-100 text-zinc-500'
                              }`}>
                              {matricula.status || 'Pendente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="md:hidden divide-y divide-zinc-50">
                  {turma.matriculas.map((matricula) => (
                    <div key={matricula.id} className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-[11px] font-bold text-indigo-600 border border-indigo-100 shrink-0">
                            {matricula.aluno?.usuario?.nome?.charAt(0).toUpperCase() ?? '?'}
                          </div>
                          <span className="text-sm font-bold text-zinc-900 truncate">
                            {matricula.aluno?.usuario?.nome ?? 'Aluno sem Nome'}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider shrink-0 ${matricula.status === 'ativa'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-zinc-100 text-zinc-500'
                          }`}>
                          {matricula.status || 'Pendente'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-1.5 px-1">
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                          <span className="font-medium truncate">{matricula.aluno?.usuario?.email ?? 'Sem e-mail'}</span>
                        </div>
                        {matricula.aluno?.usuario?.telefone && (
                          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                            <span className="font-medium underline decoration-zinc-200">{matricula.aluno.usuario.telefone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
