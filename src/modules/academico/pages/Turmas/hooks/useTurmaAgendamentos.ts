import { useState, useEffect, useCallback } from 'react';
import api from '@/shared/lib/axios';

export interface AulaAgendamento {
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
        matriculas?: Array<{
            id: number;
            status: string;
            aluno?: {
                id: number;
                usuario?: { nome: string };
            };
        }>;
    };
    professor?: {
        id: number;
        usuario?: { nome: string };
    };
    aluno_especifico?: {
        id: number;
        usuario?: { nome: string };
    };
    id_conta?: number | null;
    conta?: {
        id: number;
        valor: string;
        data_vencimento: string;
        status_pagamento: string;
        categoria?: { nome: string };
    };
}

export const useTurmaAgendamentos = (turmaId: number | undefined) => {
    const [agendamentos, setAgendamentos] = useState<AulaAgendamento[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchAgendamentos = useCallback(async () => {
        if (!turmaId) return;
        setIsLoading(true);
        try {
            const response = await api.get('/aulas-turmas', {
                params: { id_turma: turmaId }
            });
            const data = response.data?.data ?? response.data ?? [];
            // Ordenar por data asc, depois hora_inicio asc
            const sorted = [...data].sort((a: AulaAgendamento, b: AulaAgendamento) => {
                const dateCompare = a.data.localeCompare(b.data);
                if (dateCompare !== 0) return dateCompare;
                return a.hora_inicio.localeCompare(b.hora_inicio);
            });
            setAgendamentos(sorted);
        } catch (error) {
            console.error('Erro ao buscar agendamentos da turma:', error);
        } finally {
            setIsLoading(false);
        }
    }, [turmaId]);

    useEffect(() => {
        fetchAgendamentos();
    }, [fetchAgendamentos]);

    return { agendamentos, isLoading, refetch: fetchAgendamentos };
};
