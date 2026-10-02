import { useState, useCallback } from 'react';
import api from '@/shared/lib/axios';
import { AxiosError } from 'axios';
import type { Conta, PaginatedResponse, PaginationMeta, ContaFormData, PagamentoFormData, ContaPagamento, PagamentoLoteFormData } from '../types';

export const useContas = () => {
  const [contas, setContas] = useState<Conta[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContas = useCallback(async (
    page = 1, 
    sortBy?: string, 
    sortOrder?: 'asc' | 'desc', 
    search?: string, 
    tipo?: string, 
    status?: string,
    id_aluno?: number,
    id_turma?: number,
    id_curso?: number,
    data_inicio?: string,
    data_fim?: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<PaginatedResponse<Conta>>('/contas', {
        params: {
          page,
          sort_by: sortBy,
          sort_order: sortOrder,
          search,
          tipo,
          status,
          id_aluno,
          id_turma,
          id_curso,
          data_inicio,
          data_fim
        }
      });
      
      const payload = response.data;
      setContas(payload.data);
      setPagination(payload.meta);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Erro ao carregar contas';
      setError(errorMessage);
      console.error('Error fetching contas:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createConta = async (data: ContaFormData) => {
    try {
      const response = await api.post<{ data: Conta }>('/contas', data);
      return response.data.data;
    } catch (err: unknown) {
      console.error('Error creating conta:', err);
      throw err;
    }
  };

  const updateConta = async (id: number, data: ContaFormData) => {
    try {
      const response = await api.put<{ data: Conta }>(`/contas/${id}`, data);
      return response.data.data;
    } catch (err: unknown) {
      console.error('Error updating conta:', err);
      throw err;
    }
  };

  const createPagamento = async (contaId: number, data: PagamentoFormData) => {
    try {
      const response = await api.post<{ data: ContaPagamento }>(`/contas/${contaId}/pagamentos`, data);
      return response.data.data;
    } catch (err: unknown) {
      console.error('Error creating pagamento:', err);
      throw err;
    }
  };

  const createPagamentoLote = async (data: PagamentoLoteFormData) => {
    try {
      const response = await api.post('/contas/pagamentos/lote', data);
      return response.data;
    } catch (err: unknown) {
      console.error('Error creating pagamento in lote:', err);
      throw err;
    }
  };

  const deleteConta = async (id: number) => {
    try {
      await api.delete(`/contas/${id}`);
      setContas(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err: unknown) {
      console.error('Error deleting conta:', err);
      throw err;
    }
  };

  const deletePagamento = async (id: number) => {
    try {
      await api.delete(`/pagamentos/${id}`);
      return true;
    } catch (err: unknown) {
      console.error('Error deleting pagamento:', err);
      throw err;
    }
  };

  return {
    contas,
    pagination,
    isLoading,
    error,
    fetchContas,
    createConta,
    updateConta,
    deleteConta,
    createPagamento,
    createPagamentoLote,
    deletePagamento,
  };
};
