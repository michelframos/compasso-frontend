import React from 'react';
import { StatCard } from '@/modules/relatorios/components/Dashboard/StatCard';
import { BadgeAlert, Wallet } from 'lucide-react';
import type { InadimplenciaSummary } from '../hooks/useInadimplencia';

interface InadimplenciaCardsProps {
  summary: InadimplenciaSummary;
  isLoading?: boolean;
}

export const InadimplenciaCards: React.FC<InadimplenciaCardsProps> = ({ summary, isLoading }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <StatCard
        title="Total em Atraso"
        value={isLoading ? '...' : formatCurrency(summary.total_atraso)}
        icon={Wallet}
        variant="danger"
      />
      <StatCard
        title="Mensalidades Vencidas"
        value={isLoading ? '...' : summary.quantidade_vencidos}
        icon={BadgeAlert}
        variant="warning"
      />
    </div>
  );
};
