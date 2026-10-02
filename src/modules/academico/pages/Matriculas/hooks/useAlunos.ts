import { useState, useCallback } from 'react';
import api from '@/shared/lib/axios';
import { AxiosError } from 'axios';
import type { Aluno, PaginatedResponse } from '../types';

export const useAlunos = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlunos = useCallback(async (sortBy?: string, sortOrder?: 'asc' | 'desc', search?: string, perPage = 100) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<PaginatedResponse<Aluno> | Aluno[]>('/alunos', {
        params: { 
          sort_by: sortBy,
          sort_order: sortOrder,
          search, 
          per_page: perPage 
        }
      });
      
      // Defensive parsing of the response
      if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
        setAlunos(response.data.data);
      } else if (Array.isArray(response.data)) {
        setAlunos(response.data);
      } else {
        console.warn('Unexpected response format from /alunos:', response.data);
        setAlunos([]);
      }
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Erro ao carregar alunos';
      setError(errorMessage);
      console.error('Error fetching alumnos:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    alunos,
    isLoading,
    error,
    fetchAlunos,
  };
};
