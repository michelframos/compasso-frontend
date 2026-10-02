import { useCallback } from 'react';
import api from '@/shared/lib/axios';
import { AxiosError } from 'axios';
import { useApresentacaoStore } from '@/modules/espetaculos/store/useApresentacaoStore';

export const useApresentacoes = () => {
  const { 
    apresentacoes, 
    isLoading, 
    error, 
    setApresentacoes, 
    setPagination, 
    setIsLoading, 
    setError 
  } = useApresentacaoStore();

  const fetchApresentacoes = useCallback(async (sortBy?: string, sortOrder?: 'asc' | 'desc', search?: string, page: number = 1, espetaculoId?: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/apresentacoes', {
        params: {
          sort_by: sortBy,
          sort_order: sortOrder,
          search: search,
          page: page,
          id_espetaculo: espetaculoId
        }
      });
      setApresentacoes(response.data.data);
      if (response.data.meta) {
        setPagination(response.data.meta);
      }
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Erro ao carregar apresentações';
      setError(errorMessage);
      console.error('Error fetching apresentacoes:', err);
    } finally {
      setIsLoading(false);
    }
  }, [setApresentacoes, setPagination, setIsLoading, setError]);

  const deleteApresentacao = async (id: number) => {
    try {
      await api.delete(`/apresentacoes/${id}`);
      setApresentacoes(apresentacoes.filter(p => p.id !== id));
      return true;
    } catch (err: unknown) {
      console.error('Error deleting apresentacao:', err);
      throw err;
    }
  };

  return {
    apresentacoes,
    isLoading,
    error,
    fetchApresentacoes,
    deleteApresentacao,
  };
};
