import { useState, useCallback, useEffect } from 'react';
import { AxiosError } from 'axios';
import {
  getDashboardResumo,
  getDashboardFinanceiro,
  getDashboardOperacional,
  getDashboardPendencias,
} from '@/modules/relatorios/api/dashboard';

export interface DashboardStats {
  title: string;
  value: string;
  icon: string;
  href?: string;
  modulo?: string;
  variant?: 'danger' | 'success' | 'warning' | 'default';
  trend?: {
    value: number;
    isUp: boolean;
  } | null;
}

export interface ChartData {
  name: string;
  value: number;
  rate?: number;
}

export interface RecentPayment {
  id: number;
  name: string;
  date: string;
  amount: string;
  status: 'Pago' | 'Pendente';
}

export interface AgendaItem {
  id: number;
  turmaId: number | null;
  time: string;
  horaTermino: string | null;
  course: string | null;
  nivel: string | null;
  turma: string | null;
  teacher: string | null;
  tipo: string;
  aluno: string | null;
  alunosCount: number;
  status: string;
}

export interface BirthdayItem {
  id: number;
  name: string;
  day: number;
  type: string;
}

export interface OverdueAccount {
  id: number;
  name: string;
  description: string | null;
  dueDate: string;
  daysOverdue: number;
  amount: string;
}

export interface ConversaoStage {
  name: string;
  label: string;
  value: number;
}

export interface ConversaoData {
  stages: ConversaoStage[];
  leads: number;
  matriculas: number;
  rate: number;
}

export interface OccupancyCell {
  dia: string;
  hora: string;
  alunos: number;
  capacidade: number;
  turmas: number;
  percentual: number;
}

export interface OccupancyData {
  dias: string[];
  horas: string[];
  cells: OccupancyCell[];
}

export interface PendenciaItem {
  key: string;
  label: string;
  count: number;
  href: string;
  variant?: 'danger' | 'warning' | 'default';
}

export interface DashboardResumoPayload {
  mes: string;
  leadsAtivos: number;
  stats: DashboardStats[];
}

export interface DashboardFinanceiroPayload {
  mes: string;
  revenueData: ChartData[];
  fluxoRecebimentoData: ChartData[];
  inadimplenciaData: ChartData[];
  inadimplenciaItens: OverdueAccount[];
  recentPayments: RecentPayment[];
}

export interface DashboardOperacionalPayload {
  mes: string;
  agendaHoje: AgendaItem[];
  alunosAusentes: Array<{ id: number; name: string }>;
  aniversariantes: BirthdayItem[];
  conversaoData: ConversaoData;
  distributionData: ChartData[];
  ocupacaoHorarios: OccupancyData;
}

export interface DashboardPendenciasPayload {
  items: PendenciaItem[];
}

export interface SectionState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

function emptySection<T>(loading = true): SectionState<T> {
  return { data: null, isLoading: loading, error: null };
}

function errorMessage(err: unknown, fallback: string): string {
  const axiosError = err as AxiosError<{ message: string }>;
  return axiosError.response?.data?.message || axiosError.message || fallback;
}

export const currentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

type UseDashboardDataOptions = {
  carregarFinanceiro?: boolean;
};

export const useDashboardData = (mes: string, options: UseDashboardDataOptions = {}) => {
  const carregarFinanceiro = options.carregarFinanceiro !== false;

  const [resumo, setResumo] = useState<SectionState<DashboardResumoPayload>>(emptySection);
  const [financeiro, setFinanceiro] = useState<SectionState<DashboardFinanceiroPayload>>(
    emptySection(carregarFinanceiro),
  );
  const [operacional, setOperacional] = useState<SectionState<DashboardOperacionalPayload>>(emptySection);
  const [pendencias, setPendencias] = useState<SectionState<DashboardPendenciasPayload>>(emptySection);

  const fetchResumo = useCallback(async () => {
    setResumo((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = (await getDashboardResumo(mes)) as DashboardResumoPayload;
      setResumo({ data, isLoading: false, error: null });
    } catch (err) {
      setResumo({ data: null, isLoading: false, error: errorMessage(err, 'Erro ao carregar resumo do dashboard') });
    }
  }, [mes]);

  const fetchFinanceiro = useCallback(async () => {
    if (!carregarFinanceiro) {
      setFinanceiro({ data: null, isLoading: false, error: null });
      return;
    }
    setFinanceiro((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = (await getDashboardFinanceiro(mes)) as DashboardFinanceiroPayload;
      setFinanceiro({ data, isLoading: false, error: null });
    } catch (err) {
      setFinanceiro({ data: null, isLoading: false, error: errorMessage(err, 'Erro ao carregar dados financeiros') });
    }
  }, [carregarFinanceiro, mes]);

  const fetchOperacional = useCallback(async () => {
    setOperacional((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = (await getDashboardOperacional(mes)) as DashboardOperacionalPayload;
      setOperacional({ data, isLoading: false, error: null });
    } catch (err) {
      setOperacional({ data: null, isLoading: false, error: errorMessage(err, 'Erro ao carregar dados operacionais') });
    }
  }, [mes]);

  const fetchPendencias = useCallback(async () => {
    setPendencias((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = (await getDashboardPendencias()) as DashboardPendenciasPayload;
      setPendencias({ data, isLoading: false, error: null });
    } catch (err) {
      setPendencias({ data: null, isLoading: false, error: errorMessage(err, 'Erro ao carregar pendências') });
    }
  }, []);

  const refetch = useCallback(async () => {
    await Promise.allSettled([
      fetchResumo(),
      fetchFinanceiro(),
      fetchOperacional(),
      fetchPendencias(),
    ]);
  }, [fetchResumo, fetchFinanceiro, fetchOperacional, fetchPendencias]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    resumo,
    financeiro,
    operacional,
    pendencias,
    refetch,
    refetchResumo: fetchResumo,
    refetchFinanceiro: fetchFinanceiro,
    refetchOperacional: fetchOperacional,
    refetchPendencias: fetchPendencias,
  };
};
