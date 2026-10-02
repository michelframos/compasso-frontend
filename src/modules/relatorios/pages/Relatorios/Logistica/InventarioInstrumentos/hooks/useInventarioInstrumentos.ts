import { useState, useEffect, useCallback } from 'react';
import { getInventarioInstrumentos } from '@/modules/relatorios/api/relatorios';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/lib/utils';

interface Instrumento {
  id: number;
  nome: string;
  tipo: string;
  numero_serie: string;
  status: 'disponivel' | 'emprestado' | 'manutencao';
  data_emprestimo: string | null;
  observacoes: string | null;
  aluno?: {
    id: number;
    usuario: {
      nome: string;
    };
  };
}

interface Summary {
  total: number;
  disponiveis: number;
  emprestados: number;
  manutencao: number;
}

export const useInventarioInstrumentos = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Instrumento[]>([]);
  const [summary, setSummary] = useState<Summary>({
    total: 0,
    disponiveis: 0,
    emprestados: 0,
    manutencao: 0,
  });
  
  const [filters, setFilters] = useState({
    tipo: 'all',
    status: 'all',
    aluno: '',
  });

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getInventarioInstrumentos(filters);
      setData(response.data);
      setSummary(response.summary);
    } catch (error) {
      console.error('Erro ao buscar relatório de inventário:', error);
      toast.error(getErrorMessage(error, 'Não foi possível carregar os dados do inventário.'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReport();
    }, 300); // Debounce para busca por texto

    return () => clearTimeout(timer);
  }, [fetchReport]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return {
    loading,
    data,
    summary,
    filters,
    handleFilterChange,
    refresh: fetchReport,
  };
};
