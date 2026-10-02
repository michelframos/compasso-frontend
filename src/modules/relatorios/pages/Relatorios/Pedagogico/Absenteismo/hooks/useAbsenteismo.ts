import { useState, useCallback, useEffect } from 'react';
import { getAbsenteismo } from '@/modules/relatorios/api/relatorios';
import { useReportStore } from '@/modules/relatorios/store/useReportStore';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/lib/utils';

export interface AbsenteismoData {
  id: number;
  nome_aluno: string;
  total_presencas: number;
  total_faltas: number;
  total_justificadas: number;
  total_aulas: number;
  taxa_absenteismo: number;
  faltas_consecutivas: number;
  em_risco: boolean;
}

export interface AbsenteismoSummary {
  total_alunos: number;
  media_absenteismo: number;
  alunos_em_risco: number;
}

export const useAbsenteismo = () => {
  const { data_inicio, data_fim, id_turma, limite_faltas } = useReportStore();
  const [data, setData] = useState<AbsenteismoData[]>([]);
  const [summary, setSummary] = useState<AbsenteismoSummary>({
    total_alunos: 0,
    media_absenteismo: 0,
    alunos_em_risco: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchAbsenteismo = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAbsenteismo({
          data_inicio,
          data_fim,
          id_turma: id_turma || undefined,
          limite_faltas: limite_faltas || 3,
        });
      setData(response.data);
      setSummary(response.summary);
    } catch (error) {
      console.error('Erro ao buscar absenteísmo:', error);
      toast.error(getErrorMessage(error, 'Erro ao carregar o relatório de absenteísmo.'));
    } finally {
      setIsLoading(false);
    }
  }, [data_inicio, data_fim, id_turma, limite_faltas]);

  useEffect(() => {
    fetchAbsenteismo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    summary,
    isLoading,
    refresh: fetchAbsenteismo,
  };
};
