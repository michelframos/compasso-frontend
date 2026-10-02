import { useCallback } from 'react';
import api from '@/shared/lib/axios';
import { AxiosError } from 'axios';
import { useEspetaculoStore } from '@/modules/espetaculos/store/useEspetaculoStore';

export const useEspetaculos = () => {
  const { 
    espetaculos, 
    isLoading, 
    error, 
    setEspetaculos, 
    setPagination, 
    setIsLoading, 
    setError 
  } = useEspetaculoStore();

  const fetchEspetaculos = useCallback(async (sortBy?: string, sortOrder?: 'asc' | 'desc', search?: string, page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/espetaculos', {
        params: {
          sort_by: sortBy,
          sort_order: sortOrder,
          search: search,
          page: page
        }
      });
      setEspetaculos(response.data.data);
      if (response.data.meta) {
        setPagination(response.data.meta);
      }
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Erro ao carregar espetáculos';
      setError(errorMessage);
      console.error('Error fetching espetaculos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [setEspetaculos, setPagination, setIsLoading, setError]);

  const deleteEspetaculo = async (id: number) => {
    try {
      await api.delete(`/espetaculos/${id}`);
      setEspetaculos(espetaculos.filter(p => p.id !== id));
      return true;
    } catch (err: unknown) {
      console.error('Error deleting espetaculo:', err);
      throw err;
    }
  };

  return {
    espetaculos,
    isLoading,
    error,
    fetchEspetaculos,
    deleteEspetaculo,
  };
};
