import { useState, useCallback } from 'react';
import api from '@/shared/lib/axios';

export interface Mensalidade {
  id: number;
  id_categoria: number;
  id_aluno: number | null;
  id_matricula: number | null;
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: 'pendente' | 'pago' | 'vencido' | 'pago_parcialmente' | 'cancelado';
  tipo: string;
  observacoes: string | null;
  numero_parcela: number | null;
  quantidade_parcelas: number | null;
  mes_referencia: number | null;
  ano_referencia: number | null;
  saldo_devedor: number;
  categoria?: {
    id: number;
    nome: string;
  };
}

export interface GerarMensalidadesParams {
  valor: number;
  quantidade_parcelas: number;
  dia_vencimento: number;
  data_inicio: string;
  id_categoria?: number;
  observacoes?: string;
}

interface useMensalidadesReturn {
  mensalidades: Mensalidade[];
  isLoading: boolean;
  isGenerating: boolean;
  fetchMensalidades: () => Promise<void>;
  gerarMensalidades: (params: GerarMensalidadesParams) => Promise<boolean>;
}

export function useMatriculaMensalidades(matriculaId: number): useMensalidadesReturn {
  const [mensalidades, setMensalidades] = useState<Mensalidade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchMensalidades = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/matriculas/${matriculaId}/mensalidades`);
      const payload = response.data;
      const data = payload && typeof payload === 'object' && 'data' in payload && Array.isArray(payload.data)
        ? payload.data
        : (Array.isArray(payload) ? payload : []);
      
      setMensalidades(data);
    } catch (error) {
      console.error('Erro ao buscar mensalidades:', error);
      setMensalidades([]);
    } finally {
      setIsLoading(false);
    }
  }, [matriculaId]);

  const gerarMensalidades = async (params: GerarMensalidadesParams): Promise<boolean> => {
    setIsGenerating(true);
    try {
      await api.post(`/matriculas/${matriculaId}/gerar-mensalidades`, params);
      await fetchMensalidades();
      return true;
    } catch (error) {
      console.error('Erro ao gerar mensalidades:', error);
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return { mensalidades, isLoading, isGenerating, fetchMensalidades, gerarMensalidades };
}
