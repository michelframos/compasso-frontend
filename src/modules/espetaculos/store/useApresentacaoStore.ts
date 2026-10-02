import { create } from 'zustand';
import type { Apresentacao } from '../pages/Apresentacoes/types';
import type { PaginationMeta } from '@/modules/academico';

interface ApresentacaoState {
  apresentacoes: Apresentacao[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  setApresentacoes: (apresentacoes: Apresentacao[]) => void;
  setPagination: (pagination: PaginationMeta | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useApresentacaoStore = create<ApresentacaoState>((set) => ({
  apresentacoes: [],
  pagination: null,
  isLoading: false,
  error: null,
  setApresentacoes: (apresentacoes) => set({ apresentacoes }),
  setPagination: (pagination) => set({ pagination }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
