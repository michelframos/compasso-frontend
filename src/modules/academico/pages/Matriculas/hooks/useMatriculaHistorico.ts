import { useState, useCallback } from 'react';

import api from '@/shared/lib/axios';

import { toast } from 'sonner';

import { getErrorMessage } from '@/shared/lib/utils';

import type { MatriculaHistorico } from '../types';



export const useMatriculaHistorico = (matriculaId?: number) => {

  const [historico, setHistorico] = useState<MatriculaHistorico[]>([]);

  const [isLoading, setIsLoading] = useState(false);



  const fetchHistorico = useCallback(async () => {

    if (!matriculaId) return;



    setIsLoading(true);

    try {

      const response = await api.get(`/matriculas/${matriculaId}/historico`);

      // O endpoint retorna MatriculaHistoricoResource::collection($historico), 

      const payload = response.data;

      const data = payload && typeof payload === 'object' && 'data' in payload && Array.isArray(payload.data)

        ? payload.data

        : (Array.isArray(payload) ? payload : []);

      

      setHistorico(data);

    } catch (error) {

      console.error('Error fetching matricula historico:', error);

      toast.error(getErrorMessage(error, 'Erro ao carregar histórico de transferências.'));

    } finally {

      setIsLoading(false);

    }

  }, [matriculaId]);



  return {

    historico,

    isLoading,

    fetchHistorico,

  };

};
