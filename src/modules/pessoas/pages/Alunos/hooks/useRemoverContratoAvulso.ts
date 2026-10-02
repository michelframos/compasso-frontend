import { useState } from 'react';
import { toast } from 'sonner';
import api from '@/shared/lib/axios';
import { getErrorMessage } from '@/shared/lib/utils';
import type { AlunoContrato } from '../types';

export const useRemoverContratoAvulso = (alunoId: number | undefined, onSuccess: () => void) => {
    const [contratoParaRemover, setContratoParaRemover] = useState<AlunoContrato | null>(null);
    const [isRemoving, setIsRemoving] = useState(false);

    const confirmarRemocao = (contrato: AlunoContrato) => {
        setContratoParaRemover(contrato);
    };

    const cancelarRemocao = () => {
        setContratoParaRemover(null);
    };

    const executarRemocao = async () => {
        if (!alunoId || !contratoParaRemover) return;
        setIsRemoving(true);

        try {
            await api.delete(`/alunos/${alunoId}/contratos-avulsos/${contratoParaRemover.id}`);
            toast.success('Contrato removido com sucesso!');
            setContratoParaRemover(null);
            onSuccess();
        } catch (error) {
            console.error('Erro ao remover contrato:', error);
            toast.error(getErrorMessage(error, 'Erro ao remover o contrato. Tente novamente.'));
        } finally {
            setIsRemoving(false);
        }
    };

    return {
        contratoParaRemover,
        isRemoving,
        confirmarRemocao,
        cancelarRemocao,
        executarRemocao,
    };
};
