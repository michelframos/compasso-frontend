import { create } from 'zustand';
import type { Espetaculo } from '../pages/Espetaculos/types';
import type { PaginationMeta } from '@/modules/academico';

interface EspetaculoState {
  espetaculos: Espetaculo[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  setEspetaculos: (espetaculos: Espetaculo[]) => void;
  setPagination: (pagination: PaginationMeta | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useEspetaculoStore = create<EspetaculoState>((set) => ({
  espetaculos: [],
  pagination: null,
  isLoading: false,
  error: null,
  setEspetaculos: (espetaculos) => set({ espetaculos }),
  setPagination: (pagination) => set({ pagination }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
