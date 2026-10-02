import { useState, useCallback, useEffect } from 'react';
import { getAniversariantes } from '@/modules/relatorios/api/relatorios';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/lib/utils';

export interface Aniversariante {
  id: number;
  nome: string;
  dia: number;
  data_aniversario: string;
  telefone: string;
  whatsapp: string;
  role: string;
  tipo: string;
}

export const useAniversariantes = (mes: number) => {
  const [data, setData] = useState<Aniversariante[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAniversariantes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAniversariantes({ mes });
      setData(response);
    } catch (error) {
      console.error('Erro ao buscar aniversariantes:', error);
      toast.error(getErrorMessage(error, 'Erro ao carregar o relatório de aniversariantes.'));
    } finally {
      setIsLoading(false);
    }
  }, [mes]);

  useEffect(() => {
    fetchAniversariantes();
  }, [fetchAniversariantes]);

  return {
    data,
    isLoading,
    refresh: fetchAniversariantes,
  };
};
