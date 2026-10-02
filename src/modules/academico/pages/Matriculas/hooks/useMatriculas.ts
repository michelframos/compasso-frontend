import { useState, useCallback } from 'react';

import api from '@/shared/lib/axios';

import { AxiosError } from 'axios';

import type { Matricula, PaginatedResponse, PaginationMeta } from '../types';



export const useMatriculas = () => {

  const [matriculas, setMatriculas] = useState<Matricula[]>([]);

  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);



  const fetchMatriculas = useCallback(async (

    page: number = 1,

    sortBy: string = 'id',

    sortOrder: 'asc' | 'desc' = 'desc',

    search: string = '',

    status: string = ''

  ) => {

    try {

      setIsLoading(true);

      setError(null);

      const response = await api.get<PaginatedResponse<Matricula>>('/matriculas', {

        params: {

          page,

          sort_by: sortBy,

          sort_order: sortOrder,

          search,

          status

        }

      });

      

      // Ajuste para lidar com a estrutura do ResourceCollection do Laravel (que envolve em 'data')

      // Se o backend usar paginate(), ele retorna um objeto com 'data' e metadados de paginação.

      // O MatriculaResource::collection($matriculas) em conjunto com paginate() no Controller

      // retorna { data: [...], meta: {...}, links: {...} }

      

      setMatriculas(response.data.data);

      setPagination(response.data.meta);

    } catch (err: unknown) {

      const axiosError = err as AxiosError<{ message: string }>;

      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Erro ao carregar matrículas';

      setError(errorMessage);

      console.error('Error fetching matriculas:', err);

    } finally {

      setIsLoading(false);

    }

  }, []);



  const deleteMatricula = async (id: number) => {

    try {

      await api.delete(`/matriculas/${id}`);

      setMatriculas(prev => prev.filter(m => m.id !== id));

      return true;

    } catch (err: unknown) {

      console.error('Error deleting matricula:', err);

      throw err;

    }

  };



  return {

    matriculas,

    pagination,

    isLoading,

    error,

    fetchMatriculas,

    deleteMatricula,

  };

};
