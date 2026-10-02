import { useState, useEffect, useCallback } from 'react';
import api from '@/shared/lib/axios';

export interface AulaAgendamento {
    id: number;
    data: string;
    hora_inicio: string;
    hora_termino: string;
    tipo: 'regular' | 'reposicao' | 'reforco' | 'extra';
    status?: 'agendada' | 'concluida' | 'cancelada';
    conteudo_dado?: string;
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
}

export const useAlunoAgendamentos = (alunoId: number | undefined) => {
    const [agendamentos, setAgendamentos] = useState<AulaAgendamento[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchAgendamentos = useCallback(async () => {
        if (!alunoId) return;
        setIsLoading(true);
        try {
            const response = await api.get('/aulas-turmas', {
                params: { id_aluno: alunoId }
            });
            const data = response.data?.data ?? response.data ?? [];
            // Ordenar por data desc, depois hora_inicio desc
            const sorted = [...data].sort((a: AulaAgendamento, b: AulaAgendamento) => {
                const dateCompare = b.data.localeCompare(a.data);
                if (dateCompare !== 0) return dateCompare;
                return b.hora_inicio.localeCompare(a.hora_inicio);
            });
            setAgendamentos(sorted);
        } catch (error) {
            console.error('Erro ao buscar agendamentos do aluno:', error);
        } finally {
            setIsLoading(false);
        }
    }, [alunoId]);

    useEffect(() => {
        fetchAgendamentos();
    }, [fetchAgendamentos]);

    return { agendamentos, isLoading, refetch: fetchAgendamentos };
};
