import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { LayoutGrid } from 'lucide-react';
import type { OccupancyData } from './hooks/useDashboardData';

interface OccupancyHeatmapProps {
  data: OccupancyData | null;
}

const DIA_LABEL: Record<string, string> = {
  segunda: 'Seg',
  terca: 'Ter',
  quarta: 'Qua',
  quinta: 'Qui',
  sexta: 'Sex',
  sabado: 'Sáb',
  domingo: 'Dom',
};

function cellColor(percentual: number, turmas: number): string {
  if (!turmas) return 'bg-zinc-100';
  if (percentual >= 90) return 'bg-rose-500';
  if (percentual >= 70) return 'bg-amber-400';
  if (percentual >= 40) return 'bg-indigo-400';
  return 'bg-emerald-400';
}

export const OccupancyHeatmap: React.FC<OccupancyHeatmapProps> = ({ data }) => {
  const lookup = useMemo(() => {
    const map = new Map<string, OccupancyData['cells'][number]>();
    data?.cells.forEach((cell) => map.set(`${cell.dia}|${cell.hora}`, cell));
    return map;
  }, [data]);

  const horasAtivas = useMemo(() => {
    const horas = data?.horas ?? [];
    return horas.filter((hora) =>
      (data?.dias ?? []).some((dia) => (lookup.get(`${dia}|${hora}`)?.turmas ?? 0) > 0)
    );
  }, [data, lookup]);

  const dias = (data?.dias ?? []).filter((dia) =>
    dia !== 'domingo' || (data?.horas ?? []).some((hora) => (lookup.get(`domingo|${hora}`)?.turmas ?? 0) > 0)
  );
  const horas = horasAtivas;

  if (!data || horas.length === 0) {
    return null;
  }

  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold text-zinc-900 flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-indigo-500" />
          Ocupação de Horários
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
            <div className="min-w-[480px]">
              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: `48px repeat(${dias.length}, minmax(0, 1fr))` }}
              >
                <div />
                {dias.map((dia) => (
                  <div key={dia} className="text-[10px] font-bold text-zinc-400 text-center uppercase">
                    {DIA_LABEL[dia] || dia}
                  </div>
                ))}
                {horas.map((hora) => (
                  <React.Fragment key={hora}>
                    <div className="text-[10px] font-bold text-zinc-400 flex items-center">{hora}</div>
                    {dias.map((dia) => {
                      const cell = lookup.get(`${dia}|${hora}`);
                      const percentual = cell?.percentual ?? 0;
                      const turmas = cell?.turmas ?? 0;
                      return (
                        <div
                          key={`${dia}-${hora}`}
                          title={
                            turmas
                              ? `${DIA_LABEL[dia]} ${hora} · ${cell?.alunos}/${cell?.capacidade} alunos (${percentual}%)`
                              : `${DIA_LABEL[dia]} ${hora} · livre`
                          }
                          className={`h-6 rounded-md ${cellColor(percentual, turmas)}`}
                        />
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 text-[10px] font-bold text-zinc-400 uppercase">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-zinc-100 inline-block" /> Livre</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-400 inline-block" /> Baixa</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-400 inline-block" /> Média</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400 inline-block" /> Alta</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-500 inline-block" /> Cheia</span>
            </div>
      </CardContent>
    </Card>
  );
};
