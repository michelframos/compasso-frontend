import { useCallback, useState } from 'react';
import api from '@/shared/lib/axios';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/lib/utils';
import { useAlunoStore } from '@/modules/pessoas/store/useAlunoStore';
import { enviarAcessoAluno } from '../../../api/alunos';
import type { AlunoPaginatedResponse } from '../types';

export const useAlunos = () => {
  const { 
    alunos, 
    pagination, 
    isLoading, 
    error, 
    setAlunos, 
    setPagination, 
    setIsLoading, 
    setError 
  } = useAlunoStore();

  const fetchAlunos = useCallback(async (page = 1, sortBy?: string, sortOrder?: 'asc' | 'desc', search?: string, perPage = 15) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<AlunoPaginatedResponse>('/alunos', {
        params: {
          page,
          sort_by: sortBy,
          sort_order: sortOrder,
          search: search,
          per_page: perPage
        }
      });
      
      setAlunos(response.data.data);
      setPagination(response.data.meta);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Erro ao carregar alunos';
      setError(errorMessage);
      console.error('Error fetching alunos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [setAlunos, setPagination, setIsLoading, setError]);

  const deleteAluno = async (id: number) => {
    try {
      await api.delete(`/alunos/${id}`);
      setAlunos(alunos.filter(a => a.id !== id));
      return true;
    } catch (err: unknown) {
      console.error('Error deleting aluno:', err);
      throw err;
    }
  };

  const [enviandoAcessoId, setEnviandoAcessoId] = useState<number | null>(null);

  const enviarAcesso = async (id: number) => {
    setEnviandoAcessoId(id);
    try {
      const { message } = await enviarAcessoAluno(id);
      toast.success(message);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Não foi possível enviar o acesso ao aluno.'));
    } finally {
      setEnviandoAcessoId(null);
    }
  };

  return {
    alunos,
    pagination,
    isLoading,
    error,
    fetchAlunos,
    deleteAluno,
    enviarAcesso,
    enviandoAcessoId,
  };
};
