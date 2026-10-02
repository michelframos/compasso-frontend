import { create } from 'zustand';
import type { Aluno } from '@/modules/pessoas/pages/Alunos/types';
import type { PaginationMeta } from '@/modules/academico';

interface AlunoState {
  alunos: Aluno[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  setAlunos: (alunos: Aluno[]) => void;
  setPagination: (pagination: PaginationMeta | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAlunoStore = create<AlunoState>((set) => ({
  alunos: [],
  pagination: null,
  isLoading: false,
  error: null,
  setAlunos: (alunos) => set({ alunos }),
  setPagination: (pagination) => set({ pagination }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
