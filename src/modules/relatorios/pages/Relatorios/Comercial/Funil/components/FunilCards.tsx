import React from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { 
  Users, 
  UserCheck, 
  TrendingUp
} from 'lucide-react';
import { Skeleton } from '@/shared/components/ui/skeleton';
import type { FunilSummary } from '../hooks/useFunilVendas';

interface FunilCardsProps {
  summary: FunilSummary | null;
  isLoading: boolean;
}

export const FunilCards: React.FC<FunilCardsProps> = ({ summary, isLoading }) => {
  const kpis = [
    {
      title: "Novos Leads",
      value: summary?.novos_leads ?? 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Matrículas Realizadas",
      value: summary?.matriculas_realizadas ?? 0,
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Taxa de Conversão",
      value: `${summary?.taxa_conversao ?? 0}%`,
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-50"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{kpi.title}</p>
                <p className="text-3xl font-black text-zinc-900 group-hover:text-indigo-600 transition-colors">
                  {kpi.value}
                </p>
              </div>
              <div className={`p-3 rounded-2xl ${kpi.bg} ${kpi.color}`}>
                <kpi.icon className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
