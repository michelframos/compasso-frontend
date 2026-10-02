import { useState, useCallback, useEffect, useMemo } from 'react';
import { getFluxoCaixa, getFluxoCaixaMovimentos } from '@/modules/relatorios/api/relatorios';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/lib/utils';
import { addMonths, endOfMonth, format, startOfMonth, startOfYear, subMonths } from 'date-fns';

export interface FluxoCaixaCategoria {
  categoria: string;
  tipo: 'receita' | 'despesa';
  valor: number;
}

export interface FluxoCaixaItem {
  periodo: string;
  previsto_entrada: number;
  previsto_saida: number;
  em_aberto_entrada: number;
  em_aberto_saida: number;
  pago_competencia_entrada: number;
  pago_competencia_saida: number;
  realizado_entrada: number;
  realizado_saida: number;
  saldo_previsto: number;
  saldo_realizado: number;
  variacao_entrada: number;
  variacao_saida: number;
  saldo_previsto_acumulado: number;
  saldo_realizado_acumulado: number;
  categorias: FluxoCaixaCategoria[];
}

export interface FluxoCaixaSummary {
  previsto_entrada: number;
  previsto_saida: number;
  realizado_entrada: number;
  realizado_saida: number;
  em_aberto_entrada: number;
  em_aberto_saida: number;
  saldo_previsto: number;
  saldo_realizado: number;
  saldo_realizado_acumulado: number;
  eficiencia_entrada: number;
}

export interface FluxoCaixaMovimento {
  id: number;
  id_conta?: number;
  descricao: string;
  tipo: string;
  titular: string | null;
  categoria: string;
  data: string;
  valor: number;
  saldo_devedor?: number;
  forma_pagamento?: string;
  status?: string;
}

export type FluxoTipoFiltro = '' | 'receita' | 'despesa';
export type FluxoOrigem = 'previsto' | 'realizado';

const defaultInicio = () => format(startOfMonth(subMonths(new Date(), 6)), 'yyyy-MM-dd');
const defaultFim = () => format(endOfMonth(addMonths(new Date(), 3)), 'yyyy-MM-dd');

export const fluxoAtalhos = {
  mesAtual: () => ({
    data_inicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    data_fim: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  }),
  ultimos6: () => ({
    data_inicio: format(startOfMonth(subMonths(new Date(), 5)), 'yyyy-MM-dd'),
    data_fim: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  }),
  padrao: () => ({
    data_inicio: defaultInicio(),
    data_fim: defaultFim(),
  }),
  anoAtual: () => ({
    data_inicio: format(startOfYear(new Date()), 'yyyy-MM-dd'),
    data_fim: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  }),
};

export const useFluxoCaixa = () => {
  const [dataInicio, setDataInicio] = useState(defaultInicio);
  const [dataFim, setDataFim] = useState(defaultFim);
  const [tipo, setTipo] = useState<FluxoTipoFiltro>('');
  const [data, setData] = useState<FluxoCaixaItem[]>([]);
  const [summary, setSummary] = useState<FluxoCaixaSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [movimentosOpen, setMovimentosOpen] = useState(false);
  const [movimentosLoading, setMovimentosLoading] = useState(false);
  const [movimentos, setMovimentos] = useState<FluxoCaixaMovimento[]>([]);
  const [movimentoMeta, setMovimentoMeta] = useState<{ periodo: string; origem: FluxoOrigem } | null>(null);

  const params = useMemo(
    () => ({
      data_inicio: dataInicio,
      data_fim: dataFim,
      tipo: tipo || undefined,
    }),
    [dataInicio, dataFim, tipo]
  );

  const fetchFluxoCaixa = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getFluxoCaixa(params);
      setData(response.data ?? []);
      setSummary(response.summary ?? null);
    } catch (err) {
      const message = getErrorMessage(err, 'Erro ao carregar o relatório de fluxo de caixa.');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    void fetchFluxoCaixa();
  }, [fetchFluxoCaixa]);

  const aplicarAtalho = (atalho: keyof typeof fluxoAtalhos) => {
    const range = fluxoAtalhos[atalho]();
    setDataInicio(range.data_inicio);
    setDataFim(range.data_fim);
  };

  const abrirMovimentos = useCallback(async (periodo: string, origem: FluxoOrigem) => {
    setMovimentoMeta({ periodo, origem });
    setMovimentosOpen(true);
    setMovimentosLoading(true);
    try {
      const response = await getFluxoCaixaMovimentos({
        periodo,
        origem,
        tipo: tipo || undefined,
      });
      setMovimentos(response.data ?? []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível carregar os movimentos do mês.'));
      setMovimentos([]);
    } finally {
      setMovimentosLoading(false);
    }
  }, [tipo]);

  return {
    dataInicio,
    dataFim,
    setDataInicio,
    setDataFim,
    tipo,
    setTipo,
    aplicarAtalho,
    data,
    summary,
    isLoading,
    error,
    refresh: fetchFluxoCaixa,
    movimentosOpen,
    setMovimentosOpen,
    movimentosLoading,
    movimentos,
    movimentoMeta,
    abrirMovimentos,
  };
};
