import { useState, useCallback } from 'react';
import { useInstrumentoStore } from '@/modules/instrumentos';
import api from '@/shared/lib/axios';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/lib/utils';
import type { Instrumento } from '../types';

export const useAlunoInstrumentos = (onSuccess?: () => void) => {
    const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
    const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
    const [selectedInstrumento, setSelectedInstrumento] = useState<Instrumento | null>(null);
    const [availableInstrumentos, setAvailableInstrumentos] = useState<Instrumento[]>([]);
    const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
    
    const { devolverInstrumento } = useInstrumentoStore();

    const fetchAvailableInstrumentos = useCallback(async () => {
        setIsLoadingAvailable(true);
        try {
            const response = await api.get('/instrumentos', {
                params: { status: 'disponivel', per_page: 100 }
            });
            setAvailableInstrumentos(response.data.data);
        } catch (error) {
            console.error('Erro ao buscar instrumentos disponíveis:', error);
            toast.error(getErrorMessage(error, 'Erro ao carregar instrumentos disponíveis'));
        } finally {
            setIsLoadingAvailable(false);
        }
    }, []);



    const handleReturn = async (instrumentoId: number) => {
        const success = await devolverInstrumento(instrumentoId);
        if (success) {
            setIsReturnDialogOpen(false);
            setSelectedInstrumento(null);
            if (onSuccess) onSuccess();
        }
        return success;
    };

    return {
        isLoanModalOpen,
        setIsLoanModalOpen,
        isReturnDialogOpen,
        setIsReturnDialogOpen,
        selectedInstrumento,
        setSelectedInstrumento,
        availableInstrumentos,
        isLoadingAvailable,
        fetchAvailableInstrumentos,
        handleReturn
    };
};
