import { useState, useCallback, useEffect } from 'react';
import api from '@/shared/lib/axios';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/lib/utils';
import type { ApresentacaoAluno } from '../types';

export const useApresentacaoParticipantes = (apresentacaoId: number, turmaId: number) => {
  const [participantes, setParticipantes] = useState<ApresentacaoAluno[]>([]);
  const [alunosTurma, setAlunosTurma] = useState<{ id: number; nome: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingFaturas, setIsGeneratingFaturas] = useState(false);

  const fetchParticipantes = useCallback(async () => {
    if (!apresentacaoId) return;
    setIsLoading(true);
    try {
      const response = await api.get(`/apresentacoes/${apresentacaoId}`);
      // Assumindo que o backend retorna os participantes no objeto da apresentação
      // Se não, precisaremos de um endpoint específico ou filtrar a listagem geral
      setParticipantes(response.data.data.participantes || []);
    } catch (error) {
      console.error('Erro ao buscar participantes:', error);
      toast.error(getErrorMessage(error, 'Não foi possível carregar os participantes.'));
    } finally {
      setIsLoading(false);
    }
  }, [apresentacaoId]);

  const fetchAlunosTurma = useCallback(async () => {
    if (!turmaId) return;
    try {
      // Aqui buscamos a turma, que retorna 'matriculas' com os alunos vinculados
      const response = await api.get(`/turmas/${turmaId}`);
      
      const matriculas = response.data.data.matriculas || [];
      const alunosMapeados = matriculas
        .map((m: { aluno: { id: number, usuario?: { nome: string } } }) => m.aluno)
        .filter(Boolean)
        .map((aluno: { id: number, usuario?: { nome: string } }) => ({
          id: aluno.id,
          nome: aluno.usuario?.nome || 'Aluno Sem Nome'
        }));

      setAlunosTurma(alunosMapeados);
    } catch (error) {
      console.error('Erro ao buscar alunos da turma:', error);
    }
  }, [turmaId]);

  useEffect(() => {
    if (apresentacaoId) fetchParticipantes();
    if (turmaId) fetchAlunosTurma();
  }, [apresentacaoId, turmaId, fetchParticipantes, fetchAlunosTurma]);

  const toggleParticipacao = async (alunoId: number) => {
    const participante = participantes.find(p => p.id_aluno === alunoId);
    
    try {
      if (participante) {
        // Remover participação
        await api.delete(`/apresentacoes-alunos/${participante.id}`);
        setParticipantes(prev => prev.filter(p => p.id_aluno !== alunoId));
        toast.success('Participante removido com sucesso!');
      } else {
        // Adicionar participação
        const response = await api.post('/apresentacoes-alunos', {
          id_apresentacao: apresentacaoId,
          id_aluno: alunoId
        });
        setParticipantes(prev => [...prev, response.data.data]);
        toast.success('Participante adicionado com sucesso!');
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erro ao processar participação'));
    }
  };

  const updateFigurino = async (id: number, data: Partial<ApresentacaoAluno>) => {
    try {
      const response = await api.put(`/apresentacoes-alunos/${id}`, data);
      setParticipantes(prev => prev.map(p => p.id === id ? response.data.data : p));
      toast.success('Dados do figurino atualizados!');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erro ao atualizar figurino'));
    }
  };

  const gerarCobrancasEmLote = async (participantesIds: number[], dataVencimento: string) => {
    if (!participantesIds.length) return false;
    
    setIsGeneratingFaturas(true);
    try {
      const response = await api.post(`/apresentacoes/${apresentacaoId}/gerar-cobrancas-figurino`, {
        participantes_ids: participantesIds,
        data_vencimento: dataVencimento
      });
      
      toast.success(response.data.message || 'Faturas geradas com sucesso!');
      return true;
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erro ao gerar faturas.'));
      return false;
    } finally {
      setIsGeneratingFaturas(false);
    }
  };

  return {
    participantes,
    alunosTurma,
    isLoading,
    isGeneratingFaturas,
    toggleParticipacao,
    updateFigurino,
    gerarCobrancasEmLote,
    refresh: fetchParticipantes
  };
};
