import { currentMonthKey, useDashboardData } from '@/modules/relatorios/components/Dashboard/hooks/useDashboardData';
import { useAuthStore } from '@/shared/store/useAuthStore';
import {
  Users,
  DollarSign,
  AlertCircle,
  TrendingUp,
  UserPlus,
} from 'lucide-react';
import React, { useState } from 'react';

export const useHomePage = () => {
  const { user } = useAuthStore();
  const [mes, setMes] = useState(currentMonthKey);
  const dashboard = useDashboardData(mes);

  const iconMap: Record<string, React.ElementType> = {
    Users,
    DollarSign,
    AlertCircle,
    TrendingUp,
    UserPlus,
  };

  return {
    user,
    mes,
    setMes,
    iconMap,
    ...dashboard,
  };
};
