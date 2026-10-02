import { useState, useCallback, useEffect } from 'react';
import { getFunilVendas } from '@/modules/relatorios/api/relatorios';
import { useReportStore } from '@/modules/relatorios/store/useReportStore';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/lib/utils';

export interface FunilStatusData {
  status: string;
  label: string;
  value: number;
}

export interface FunilSummary {
  novos_leads: number;
  matriculas_realizadas: number;
  taxa_conversao: number;
  leads_por_status: FunilStatusData[];
}

export interface EvolucaoLeads {
  data: string;
  total: number;
}

export const useFunilVendas = () => {
  const { data_inicio, data_fim } = useReportStore();
  const [summary, setSummary] = useState<FunilSummary | null>(null);
  const [charts, setCharts] = useState<{ evolucao_leads: EvolucaoLeads[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFunilVendas = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getFunilVendas({ data_inicio, data_fim });
      setSummary(response.summary);
      setCharts(response.charts);
    } catch (error) {
      console.error('Erro ao buscar funil de vendas:', error);
      toast.error(getErrorMessage(error, 'Erro ao carregar o relatório de funil de vendas.'));
    } finally {
      setIsLoading(false);
    }
  }, [data_inicio, data_fim]);

  useEffect(() => {
    fetchFunilVendas();
  }, [fetchFunilVendas]);

  return {
    summary,
    charts,
    isLoading,
    refresh: fetchFunilVendas,
  };
};
