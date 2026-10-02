import { useState, useCallback } from 'react';
import api from '@/shared/lib/axios';
import { AxiosError } from 'axios';

export type Aluno = {
  id: number;
  id_usuario: number;
  observacoes: string | null;
  usuario: {
    id: number;
    nome: string;
    email: string;
    telefone: string | null;
  };
}

export type Matricula = {
  id: number;
  id_aluno: number;
  id_turma: number;
  data: string;
  status: string | null;
  aluno: Aluno;
}

export type TurmaHorario = {
  id: number;
  id_turma: number;
  dia_semana: number;
  hora_inicio: string;
  hora_fim: string;
}

export type Turma = {
  id: number;
  id_curso: number;
  id_nivel: number;
  maximo_alunos: number;
  descricao: string | null;
  status: string;
  curso: { id: number; nome: string };
  nivel: { id: number; nome: string };
  horarios: TurmaHorario[];
  matriculas: Matricula[];
}

export type Professor = {
  id: number;
  id_usuario: number;
  comissao?: number | null;
  salario_fixo?: number | null;
  valor_hora_aula?: number | null;
  observacoes: string | null;
  usuario: {
    id: number;
    nome: string;
    email: string;
    cpf: string;
    telefone: string | null;
    whatsapp: string | null;
    role: string;
  };
  turmas?: Turma[];
}

export const useProfessores = () => {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfessores = useCallback(async (sortBy?: string, sortOrder?: 'asc' | 'desc', search?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/professores', {
        params: {
          sort_by: sortBy,
          sort_order: sortOrder,
          search: search
        }
      });
      setProfessores(response.data.data);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Erro ao carregar professores';
      setError(errorMessage);
      console.error('Error fetching professores:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteProfessor = async (id: number) => {
    try {
      await api.delete(`/professores/${id}`);
      setProfessores(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err: unknown) {
      console.error('Error deleting professor:', err);
      throw err;
    }
  };



  return {
    professores,
    isLoading,
    error,
    fetchProfessores,
    deleteProfessor,
  };
};
