import { create } from 'zustand';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface ReportFilters {
  data_inicio: string;
  data_fim: string;
  id_turma: string;
  limite_faltas: number;
  setDataInicio: (data: string) => void;
  setDataFim: (data: string) => void;
  setIdTurma: (id: string) => void;
  setLimiteFaltas: (limite: number) => void;
  resetFilters: () => void;
}

export const useReportStore = create<ReportFilters>((set) => ({
  data_inicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
  data_fim: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  id_turma: '',
  limite_faltas: 3,
  
  setDataInicio: (data) => set({ data_inicio: data }),
  setDataFim: (data) => set({ data_fim: data }),
  setIdTurma: (id) => set({ id_turma: id }),
  setLimiteFaltas: (limite) => set({ limite_faltas: limite }),
  
  resetFilters: () => set({
    data_inicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    data_fim: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    id_turma: '',
    limite_faltas: 3,
  }),
}));
