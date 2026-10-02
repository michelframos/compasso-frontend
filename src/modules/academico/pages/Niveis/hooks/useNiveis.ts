import { useState, useCallback } from 'react';

import api from '@/shared/lib/axios';

import { AxiosError } from 'axios';

import type { Nivel, PaginatedResponse, PaginationMeta } from '../types';



export const useNiveis = () => {

  const [niveis, setNiveis] = useState<Nivel[]>([]);

  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);



  const fetchNiveis = useCallback(async (page = 1, sortBy?: string, sortOrder?: 'asc' | 'desc', search?: string) => {

    try {

      setIsLoading(true);

      setError(null);

      const response = await api.get<PaginatedResponse<Nivel>>('/niveis', {

        params: {

          page,

          sort_by: sortBy,

          sort_order: sortOrder,

          search: search

        }

      });

      

      const payload = response.data;

      setNiveis(payload.data);

      setPagination(payload.meta);

    } catch (err: unknown) {

      const axiosError = err as AxiosError<{ message: string }>;

      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Erro ao carregar níveis';

      setError(errorMessage);

      console.error('Error fetching niveis:', err);

    } finally {

      setIsLoading(false);

    }

  }, []);



  const deleteNivel = async (id: number) => {

    try {

      await api.delete(`/niveis/${id}`);

      setNiveis(prev => prev.filter(n => n.id !== id));

      return true;

    } catch (err: unknown) {

      console.error('Error deleting nivel:', err);

      throw err;

    }

  };







  return {

    niveis,

    pagination,

    isLoading,

    error,

    fetchNiveis,

    deleteNivel,

  };

};
