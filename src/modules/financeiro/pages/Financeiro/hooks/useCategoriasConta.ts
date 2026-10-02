import { useState, useCallback } from 'react';
import api from '@/shared/lib/axios';
import { AxiosError } from 'axios';
import type { CategoriaConta, CategoriaContaFormData, PaginationMeta, PaginatedResponse } from '../types';

export const useCategoriasConta = () => {
  const [categorias, setCategorias] = useState<CategoriaConta[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategorias = useCallback(async (
    page = 1,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    search?: string,
    tipo?: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<PaginatedResponse<CategoriaConta>>('/categorias-contas', {
        params: {
          page,
          sort_by: sortBy,
          sort_order: sortOrder,
          search,
          tipo
        }
      });
      
      const payload = response.data;
      setCategorias(payload.data);
      setPagination(payload.meta);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Erro ao carregar categorias';
      setError(errorMessage);
      console.error('Error fetching categorias:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCategoria = async (data: CategoriaContaFormData) => {
    try {
      const response = await api.post<{ data: CategoriaConta }>('/categorias-contas', data);
      return response.data.data;
    } catch (err: unknown) {
      console.error('Error creating categoria:', err);
      throw err;
    }
  };

  const updateCategoria = async (id: number, data: CategoriaContaFormData) => {
    try {
      const response = await api.put<{ data: CategoriaConta }>(`/categorias-contas/${id}`, data);
      return response.data.data;
    } catch (err: unknown) {
      console.error('Error updating categoria:', err);
      throw err;
    }
  };

  const deleteCategoria = async (id: number) => {
    try {
      await api.delete(`/categorias-contas/${id}`);
      setCategorias(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err: unknown) {
      console.error('Error deleting categoria:', err);
      throw err;
    }
  };

  return {
    categorias,
    pagination,
    isLoading,
    error,
    fetchCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria,
  };
};
