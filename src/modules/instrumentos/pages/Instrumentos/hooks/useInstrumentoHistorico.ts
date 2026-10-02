import { useState, useCallback } from 'react';
import api from '@/shared/lib/axios';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/lib/utils';

export interface HistoricoInstrumento {
  id: number;
  id_instrumento: number;
  id_aluno: number | null;
  acao: 'emprestimo' | 'devolucao' | 'manutencao';
  data: string;
  observacoes: string | null;
  aluno?: {
    id: number;
    usuario?: {
      nome: string;
    };
  };
}

export const useInstrumentoHistorico = (instrumentoId: number | undefined) => {
  const [historico, setHistorico] = useState<HistoricoInstrumento[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistorico = useCallback(async () => {
    if (!instrumentoId) return;

    setIsLoading(true);
    try {
      const response = await api.get(`/instrumentos/${instrumentoId}/historico`);
      setHistorico(response.data.data);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      toast.error(getErrorMessage(error, 'Não foi possível carregar o histórico do instrumento.'));
    } finally {
      setIsLoading(false);
    }
  }, [instrumentoId]);

  return {
    historico,
    isLoading,
    fetchHistorico,
  };
};
