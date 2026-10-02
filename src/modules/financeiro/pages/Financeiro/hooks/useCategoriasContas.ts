import { useState, useCallback } from 'react';

import api from '@/shared/lib/axios';

import { AxiosError } from 'axios';

import type { CategoriaConta } from '../types';



export const useCategoriasContas = () => {

  const [categorias, setCategorias] = useState<CategoriaConta[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);



  const fetchCategorias = useCallback(async () => {

    try {

      setIsLoading(true);

      setError(null);

      // Supondo que retorne diretamente o array (sem paginação se per_page=-1) ou paginado

      const response = await api.get<{ data: CategoriaConta[] }>('/categorias-contas');

      setCategorias(response.data.data);

    } catch (err: unknown) {

      const axiosError = err as AxiosError<{ message: string }>;

      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Erro ao carregar categorias';

      setError(errorMessage);

      console.error('Error fetching categorias:', err);

    } finally {

      setIsLoading(false);

    }

  }, []);



  return { categorias, isLoading, error, fetchCategorias };

};
