import { create } from 'zustand';
import api from '@/shared/lib/axios';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/lib/utils';

export interface Instrumento {
  id: number;
  nome: string;
  tipo: string;
  numero_serie?: string;
  status: 'disponivel' | 'emprestado' | 'manutencao' | 'inativo';
  id_aluno?: number;
  data_emprestimo?: string;
  observacoes?: string;
  aluno?: {
    id: number;
    usuario?: {
      nome: string;
    };
  };
  created_at: string;
  updated_at: string;
}

interface InstrumentoStore {
  instrumentos: Instrumento[];
  isLoading: boolean;
  pagination: {
    current_page: number;
    last_page: number;
    total: number;
  };
  fetchInstrumentos: (page?: number, status?: string) => Promise<void>;
  addInstrumento: (data: Partial<Instrumento>) => Promise<number | null>;
  updateInstrumento: (id: number, data: Partial<Instrumento>) => Promise<number | null>;
  deleteInstrumento: (id: number) => Promise<boolean>;
  emprestarInstrumento: (id: number, data: {
    id_aluno: number;
    data_emprestimo: string;
    contrato_id?: number | null;
    contrato_gerado?: string | null;
    gerar_conta?: boolean;
    valor_conta?: number;
    data_vencimento_conta?: string;
    id_categoria_conta?: number | null;
  }) => Promise<boolean>;
  devolverInstrumento: (id: number) => Promise<boolean>;
}

export const useInstrumentoStore = create<InstrumentoStore>((set, get) => ({
  instrumentos: [],
  isLoading: false,
  pagination: {
    current_page: 1,
    last_page: 1,
    total: 0,
  },

  fetchInstrumentos: async (page = 1, status) => {
    set({ isLoading: true });
    try {
      const response = await api.get('/instrumentos', {
        params: { page, status }
      });
      set({
        instrumentos: response.data.data,
        pagination: {
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          total: response.data.total,
        }
      });
    } catch (error) {
      console.error('Erro ao buscar instrumentos:', error);
      toast.error(getErrorMessage(error, 'Erro ao carregar lista de instrumentos'));
    } finally {
      set({ isLoading: false });
    }
  },

  addInstrumento: async (data) => {
    try {
      const response = await api.post('/instrumentos', data);
      toast.success('Instrumento cadastrado com sucesso!');
      get().fetchInstrumentos();
      return response.data.data?.id || response.data.id;
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Erro ao cadastrar instrumento'));
      return null;
    }
  },

  updateInstrumento: async (id, data) => {
    try {
      await api.put(`/instrumentos/${id}`, data);
      toast.success('Instrumento atualizado com sucesso!');
      get().fetchInstrumentos();
      return id;
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Erro ao atualizar instrumento'));
      return null;
    }
  },

  deleteInstrumento: async (id) => {
    try {
      await api.delete(`/instrumentos/${id}`);
      toast.success('Instrumento excluído com sucesso!');
      get().fetchInstrumentos();
      return true;
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Erro ao excluir instrumento'));
      return false;
    }
  },

  emprestarInstrumento: async (id, data) => {
    try {
      await api.post(`/instrumentos/${id}/emprestar`, data);
      toast.success('Empréstimo realizado com sucesso!');
      get().fetchInstrumentos();
      return true;
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Erro ao realizar empréstimo'));
      return false;
    }
  },

  devolverInstrumento: async (id) => {
    try {
      await api.post(`/instrumentos/${id}/devolver`);
      toast.success('Devolução realizada com sucesso!');
      get().fetchInstrumentos();
      return true;
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Erro ao realizar devolução'));
      return false;
    }
  }
}));
