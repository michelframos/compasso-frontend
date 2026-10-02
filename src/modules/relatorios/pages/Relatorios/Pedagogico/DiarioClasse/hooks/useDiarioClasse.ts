import { useState, useCallback, useEffect } from 'react';
import { getDiarioClasse } from '@/modules/relatorios/api/relatorios';
import { useReportStore } from '@/modules/relatorios/store/useReportStore';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/lib/utils';

export interface DiarioAluno {
  id_aluno: number;
  nome: string;
  data_matricula: string;
  status: string;
}

export interface DiarioHorario {
  dia_semana: string;
  hora_inicio: string;
  hora_termino: string;
}

export interface DiarioAula {
  id: number;
  data: string;
  hora_inicio: string;
  conteudo_dado: string | null;
  presencas: Record<number, string>; // { id_aluno: status }
}

export interface DiarioData {
  id: number;
  descricao: string;
  curso: string;
  nivel: string;
  professor: string;
  status: string;
  horarios: DiarioHorario[];
  aulas: DiarioAula[];
  alunos: DiarioAluno[];
}

export const useDiarioClasse = () => {
  const { id_turma, data_inicio, data_fim } = useReportStore();
  const [data, setData] = useState<DiarioData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDiario = useCallback(async () => {
    if (!id_turma || id_turma === 'all') {
      setData(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await getDiarioClasse({ id_turma, data_inicio, data_fim });
      setData(response);
    } catch (error: unknown) {
      console.error('Erro ao buscar diário de classe:', error);
      toast.error(getErrorMessage(error, 'Erro ao carregar o diário de classe.'));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [id_turma, data_inicio, data_fim]);

  useEffect(() => {
    fetchDiario();
  }, [fetchDiario]);

  return {
    data,
    isLoading,
  };
};
