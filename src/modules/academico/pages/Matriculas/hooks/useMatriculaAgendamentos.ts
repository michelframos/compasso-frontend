import { useState, useEffect, useCallback } from 'react';

import api from '@/shared/lib/axios';



export interface AulaTurmaAgendamento {

    id: number;

    data: string;

    hora_inicio: string;

    hora_termino: string;

    tipo: 'regular' | 'reposicao' | 'reforco' | 'extra';

    status: 'agendada' | 'concluida' | 'cancelada' | null;

    conteudo_dado: string | null;

    turma?: {

        id: number;

        descricao?: string;

        curso?: { nome: string };

        nivel?: { nome: string };

    };

    professor?: {

        usuario?: { nome: string };

    };

    aluno_especifico?: {

        usuario?: { nome: string };

    };

    id_professor?: number;

    id_aluno_especifico?: number;

    id_curso?: number;

    id_nivel?: number;

    id_conta?: number | null;

}



export const useMatriculaAgendamentos = (turmaId: number | undefined, alunoId: number | undefined) => {

    const [agendamentos, setAgendamentos] = useState<AulaTurmaAgendamento[]>([]);

    const [isLoading, setIsLoading] = useState(false);



    const fetchAgendamentos = useCallback(async () => {

        // Requer ao menos o alunoId; turmaId é opcional (matrículas em curso não têm turma)

        if (!alunoId) return;

        setIsLoading(true);

        try {

            const params: Record<string, unknown> = { id_aluno: alunoId };

            if (turmaId) params.id_turma = turmaId;



            const response = await api.get('/aulas-turmas', { params });

            const data = response.data?.data ?? response.data ?? [];

            const sorted = [...data].sort((a: AulaTurmaAgendamento, b: AulaTurmaAgendamento) => {

                const dateCompare = b.data.localeCompare(a.data);

                if (dateCompare !== 0) return dateCompare;

                return b.hora_inicio.localeCompare(a.hora_inicio);

            });

            setAgendamentos(sorted);

        } catch (error) {

            console.error('Erro ao buscar agendamentos da matrícula:', error);

        } finally {

            setIsLoading(false);

        }

    }, [turmaId, alunoId]);



    useEffect(() => {

        fetchAgendamentos();

    }, [fetchAgendamentos]);



    const deleteAgendamento = useCallback(async (id: number, excluirConta: boolean = false) => {

        try {

            await api.delete(`/aulas-turmas/${id}`, {

                params: { excluir_conta: excluirConta }

            });

            await fetchAgendamentos();

            return true;

        } catch (error) {

            console.error('Erro ao excluir agendamento:', error);

            throw error;

        }

    }, [fetchAgendamentos]);



    return { agendamentos, isLoading, refetch: fetchAgendamentos, deleteAgendamento };

};
