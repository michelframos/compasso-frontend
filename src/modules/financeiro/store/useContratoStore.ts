import { create } from 'zustand';
import api from '@/shared/lib/axios';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/lib/utils';

export interface Contrato {
  id: number;
  nome: string;
  conteudo: string;
  created_at: string;
  updated_at: string;
}

interface ContratoStore {
  contratos: Contrato[];
  isLoading: boolean;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
  } | null;
  fetchContratos: (page?: number, sort_by?: string, sort_order?: 'asc' | 'desc', search?: string) => Promise<void>;
  addContrato: (data: Partial<Contrato>) => Promise<number | null>;
  updateContrato: (id: number, data: Partial<Contrato>) => Promise<boolean>;
  deleteContrato: (id: number) => Promise<boolean>;
}

export const useContratoStore = create<ContratoStore>((set, get) => ({
  contratos: [],
  isLoading: false,
  pagination: null,

  fetchContratos: async (page = 1, sort_by = 'nome', sort_order = 'asc', search = '') => {
    set({ isLoading: true });
    try {
      const response = await api.get('/contratos', {
        params: { page, sort_by, sort_order, search }
      });
      
      const { data, meta } = response.data;
      
      set({
        contratos: data,
        pagination: {
          current_page: meta.current_page,
          last_page: meta.last_page,
          total: meta.total,
        }
      });
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
      toast.error(getErrorMessage(error, 'Erro ao carregar lista de contratos'));
    } finally {
      set({ isLoading: false });
    }
  },

  addContrato: async (data) => {
    try {
      const response = await api.post('/contratos', data);
      toast.success('Contrato cadastrado com sucesso!');
      get().fetchContratos();
      return response.data.data?.id || response.data.id;
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Erro ao cadastrar contrato'));
      return null;
    }
  },

  updateContrato: async (id, data) => {
    try {
      await api.put(`/contratos/${id}`, data);
      toast.success('Contrato atualizado com sucesso!');
      get().fetchContratos();
      return true;
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Erro ao atualizar contrato'));
      return false;
    }
  },

  deleteContrato: async (id) => {
    try {
      await api.delete(`/contratos/${id}`);
      toast.success('Contrato excluído com sucesso!');
      get().fetchContratos();
      return true;
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Erro ao excluir contrato'));
      return false;
    }
  }
}));
