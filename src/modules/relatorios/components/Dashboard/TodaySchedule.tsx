import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Clock, User, Users, GraduationCap, Calendar } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import type { AgendaItem } from './hooks/useDashboardData';

interface TodayScheduleProps {
  agenda: AgendaItem[];
}

const STATUS_LABEL: Record<string, string> = {
  agendada: 'Agendada',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

const TIPO_LABEL: Record<string, string> = {
  regular: 'Regular',
  reposicao: 'Reposição',
  reforco: 'Reforço',
  extra: 'Extra',
};

function isAulaAgora(item: AgendaItem): boolean {
  if (item.status !== 'agendada' || !item.time) return false;
  const now = new Date();
  const [h1, m1] = item.time.split(':').map(Number);
  const [h2, m2] = (item.horaTermino || item.time).split(':').map(Number);
  const start = h1 * 60 + (m1 || 0);
  const end = h2 * 60 + (m2 || 0);
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= start && cur < end;
}

function tituloAula(item: AgendaItem): string {
  if (item.aluno && (!item.turmaId || item.tipo !== 'regular')) {
    return item.aluno;
  }
  return item.course || item.turma || 'Aula';
}

function subtituloAula(item: AgendaItem): string | null {
  const parts = [item.nivel, item.turma, item.course && item.aluno ? item.course : null]
    .filter((part, index, arr) => part && arr.indexOf(part) === index);
  return parts.length ? parts.join(' · ') : null;
}

export const TodaySchedule: React.FC<TodayScheduleProps> = ({ agenda }) => {
  const navigate = useNavigate();

  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold text-zinc-900">Agenda de Hoje</CardTitle>
        <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-100 font-bold">
          {agenda.length} {agenda.length === 1 ? 'Aula' : 'Aulas'}
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className={agenda.length === 0 ? '' : 'max-h-[420px] overflow-y-auto custom-scrollbar'}>
          <div className="p-4 space-y-3">
            {agenda.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                <Calendar className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-sm">Nenhuma aula agendada para hoje.</p>
              </div>
            ) : (
              agenda.map((item) => {
                const agora = isAulaAgora(item);
                const label = STATUS_LABEL[item.status] || item.status;
                const tipoLabel = TIPO_LABEL[item.tipo] || item.tipo;
                const subtitle = subtituloAula(item);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(item.turmaId ? `/turmas/${item.turmaId}` : '/agenda')}
                    className={`w-full text-left flex items-center gap-4 p-3 rounded-xl border transition-all group ${
                      agora
                        ? 'border-indigo-300 bg-indigo-50/80 ring-1 ring-indigo-100'
                        : 'border-zinc-100 hover:border-indigo-100 hover:bg-zinc-50'
                    }`}
                  >
                    <div className={`flex flex-col items-center justify-center min-w-[64px] py-1.5 rounded-lg transition-colors ${
                      agora ? 'bg-indigo-600 text-white' : 'bg-zinc-100 group-hover:bg-indigo-600 group-hover:text-white'
                    }`}>
                      <Clock className="w-3 h-3 mb-1 opacity-60" />
                      <span className="text-xs font-black">{item.time?.substring(0, 5)}</span>
                      {item.horaTermino && (
                        <span className="text-[9px] font-bold opacity-70">{item.horaTermino.substring(0, 5)}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-bold text-zinc-900 truncate">{tituloAula(item)}</span>
                        {item.tipo && item.tipo !== 'regular' && (
                          <Badge variant="outline" className={`h-5 px-1.5 text-[9px] font-black uppercase shrink-0 ${
                            item.tipo === 'reposicao' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                            item.tipo === 'reforco' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                            'border-indigo-200 bg-indigo-50 text-indigo-700'
                          }`}>
                            {tipoLabel}
                          </Badge>
                        )}
                      </div>
                      {subtitle && (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 min-w-0">
                          <GraduationCap className="w-3 h-3 shrink-0 text-indigo-400" />
                          <span className="truncate">{subtitle}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                        {item.teacher && (
                          <span className="flex items-center gap-1 min-w-0 truncate">
                            <User className="w-3 h-3 shrink-0" />
                            <span className="truncate">{item.teacher}</span>
                          </span>
                        )}
                        {item.alunosCount > 0 && (
                          <span className="flex items-center gap-1 shrink-0">
                            <Users className="w-3 h-3" />
                            {item.aluno || item.alunosCount === 1
                              ? 'Individual'
                              : `${item.alunosCount} alunos`}
                          </span>
                        )}
                      </div>
                    </div>

                    <Badge className={`h-6 text-[10px] font-black uppercase shrink-0 ${
                      agora ? 'bg-indigo-600 hover:bg-indigo-700' :
                      item.status === 'concluida' ? 'bg-emerald-500 hover:bg-emerald-600' :
                      item.status === 'cancelada' ? 'bg-rose-500 hover:bg-rose-600' :
                      'bg-indigo-500 hover:bg-indigo-600'
                    }`}>
                      {agora ? 'Agora' : label}
                    </Badge>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
