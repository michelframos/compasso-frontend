import { useCallback, useState } from 'react';
import api from '@/shared/lib/axios';
import { AxiosError } from 'axios';

export interface Responsavel {
    id: number;
    id_usuario: number;
    observacoes: string | null;
    usuario: {
        id: number;
        nome: string;
        email: string | null;
        cpf: string | null;
        telefone: string | null;
        whatsapp: string | null;
        cep: string | null;
        rua: string | null;
        numero: string | null;
        complemento: string | null;
        bairro: string | null;
        id_estado: number | null;
        id_cidade: number | null;
    };
}

export const useResponsaveis = () => {
    const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchResponsaveis = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await api.get<Responsavel[]>('/responsaveis');
            setResponsaveis(response.data);
        } catch (err: unknown) {
            const axiosError = err as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Erro ao carregar responsáveis';
            setError(errorMessage);
            console.error('Error fetching responsaveis:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        responsaveis,
        isLoading,
        error,
        fetchResponsaveis,
    };
};
