import { currentMonthKey, useDashboardData } from '@/modules/relatorios/components/Dashboard/hooks/useDashboardData';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useHasModulo } from '@/shared/hooks/useHasModulo';
import {
  Users,
  DollarSign,
  AlertCircle,
  TrendingUp,
  UserPlus,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

export const useHomePage = () => {
  const { user } = useAuthStore();
  const hasFinanceiro = useHasModulo('financeiro');
  const hasLeads = useHasModulo('leads');
  const [mes, setMes] = useState(currentMonthKey);
  const dashboard = useDashboardData(mes, { carregarFinanceiro: hasFinanceiro });

  const iconMap: Record<string, React.ElementType> = {
    Users,
    DollarSign,
    AlertCircle,
    TrendingUp,
    UserPlus,
  };

  const statsVisiveis = useMemo(() => {
    return (dashboard.resumo.data?.stats ?? []).filter((stat) => {
      if (!stat.modulo) return true;
      if (stat.modulo === 'financeiro') return hasFinanceiro;
      if (stat.modulo === 'leads') return hasLeads;
      return true;
    });
  }, [dashboard.resumo.data?.stats, hasFinanceiro, hasLeads]);

  return {
    user,
    mes,
    setMes,
    iconMap,
    hasFinanceiro,
    hasLeads,
    statsVisiveis,
    ...dashboard,
  };
};
