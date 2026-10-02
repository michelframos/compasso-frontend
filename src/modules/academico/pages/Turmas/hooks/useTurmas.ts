import { useState, useCallback } from 'react';
import api from '@/shared/lib/axios';
import { AxiosError } from 'axios';
import type { Turma, PaginatedResponse, PaginationMeta, TurmaStatus } from '../types';

export const useTurmas = () => {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTurmas = useCallback(async (page = 1, sortBy?: string, sortOrder?: 'asc' | 'desc', search?: string, status?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<PaginatedResponse<Turma>>('/turmas', {
        params: {
          page,
          sort_by: sortBy,
          sort_order: sortOrder,
          search: search,
          status: status
        }
      });
      
      const payload = response.data;
      setTurmas(payload.data);
      setPagination(payload.meta);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Erro ao carregar turmas';
      setError(errorMessage);
      console.error('Error fetching turmas:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTurma = async (id: number) => {
    try {
      await api.delete(`/turmas/${id}`);
      setTurmas(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (err: unknown) {
      console.error('Error deleting turma:', err);
      throw err;
    }
  };

  const updateTurmaStatus = async (id: number, status: string) => {
    try {
      setIsLoading(true);
      await api.patch(`/turmas/${id}/status`, { status });
      setTurmas(prev => prev.map(t => t.id === id ? { ...t, status: status as TurmaStatus } : t));
      return true;
    } catch (err: unknown) {
      console.error('Error updating turma status:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTurma = async (id: number) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/turmas/${id}`);
      return response.data.data as Turma;
    } catch (err: unknown) {
      console.error(`Error fetching turma ${id}:`, err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    turmas,
    pagination,
    isLoading,
    error,
    fetchTurmas,
    fetchTurma,
    deleteTurma,
    updateTurmaStatus,
  };
};
