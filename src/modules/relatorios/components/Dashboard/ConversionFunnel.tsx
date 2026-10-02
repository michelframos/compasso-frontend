import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';
import type { ConversaoData } from './hooks/useDashboardData';
import { useHasModulo } from '@/shared/hooks/useHasModulo';

interface ConversionFunnelProps {
  data: ConversaoData | null;
}

const STAGE_COLORS: Record<string, string> = {
  novo: 'bg-zinc-400',
  contatado: 'bg-amber-400',
  matriculado: 'bg-indigo-600',
  perdido: 'bg-rose-400',
};

export const ConversionFunnel: React.FC<ConversionFunnelProps> = ({ data }) => {
  const navigate = useNavigate();
  const hasRelatorios = useHasModulo('relatorios');
  const stages = data?.stages ?? [];
  const max = Math.max(...stages.map((s) => s.value), 1);
  const rate = data?.rate ?? 0;

  return (
    <Card className="border-none shadow-sm bg-white">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-bold text-zinc-900 flex items-center gap-2">
          <TrendingUp className="w-4 text-indigo-500" />
          Funil de Leads
        </CardTitle>
        {hasRelatorios && (
        <Button
          variant="ghost"
          size="sm"
          className="text-indigo-600 font-bold gap-1 text-xs h-7 px-2"
          onClick={() => navigate('/relatorios/comercial/funil')}
        >
          Ver funil <ArrowUpRight className="w-3 h-3" />
        </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <div className="flex items-center justify-center">
          <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[11px] font-black border border-indigo-100">
            {rate}% convertidos em matrícula
          </div>
        </div>

        <div className="space-y-3">
          {stages.map((stage) => (
            <div key={stage.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 font-medium">{stage.label}</span>
                <span className="font-bold text-zinc-900">{stage.value}</span>
              </div>
              <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${STAGE_COLORS[stage.name] || 'bg-indigo-500'}`}
                  style={{ width: `${Math.max(4, (stage.value / max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-zinc-400 text-center">
          {data?.matriculas ?? 0} matrículas com lead · {data?.leads ?? 0} leads no período
        </p>
      </CardContent>
    </Card>
  );
};
