import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Users, AlertTriangle, Percent, Loader2 } from 'lucide-react';
import type { AbsenteismoSummary } from '../hooks/useAbsenteismo';

import { useReportStore } from '@/modules/relatorios/store/useReportStore';

interface AbsenteismoCardsProps {
  summary: AbsenteismoSummary;
  isLoading: boolean;
}

export const AbsenteismoCards: React.FC<AbsenteismoCardsProps> = ({ summary, isLoading }) => {
  const { limite_faltas } = useReportStore();
  const cards = [
    {
      title: "Total de Alunos",
      value: summary.total_alunos,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Média de Absenteísmo",
      value: `${summary.media_absenteismo}%`,
      icon: Percent,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Alunos em Risco",
      value: summary.alunos_em_risco,
      icon: AlertTriangle,
      color: summary.alunos_em_risco > 0 ? "text-red-600" : "text-emerald-600",
      bg: summary.alunos_em_risco > 0 ? "bg-red-50" : "bg-emerald-50",
      description: `${limite_faltas} ou mais faltas consecutivas`
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {cards.map((card) => (
        <Card key={card.title} className="border-none shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-xl ${card.bg}`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
            ) : (
              <>
                <div className="text-2xl font-black text-zinc-900">{card.value}</div>
                {card.description && (
                  <p className="text-[10px] font-medium text-zinc-400 mt-1 uppercase">
                    {card.description}
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
