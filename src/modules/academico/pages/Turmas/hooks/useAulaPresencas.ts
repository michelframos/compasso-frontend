import { useState, useCallback } from 'react';

import api from '@/shared/lib/axios';

import { toast } from 'sonner';

import { getErrorMessage } from '@/shared/lib/utils';

import type { AulaPresenca, SyncAulaPresencasPayload } from '../types';



export const useAulaPresencas = (aulaId?: number) => {

    const [presencas, setPresencas] = useState<AulaPresenca[]>([]);

    const [isLoading, setIsLoading] = useState(false);

    const [isSaving, setIsSaving] = useState(false);



    const fetchPresencas = useCallback(async () => {

        if (!aulaId) return;

        setIsLoading(true);

        try {

            const response = await api.get(`/aulas-turmas/${aulaId}/presencas`);

            const fetchedData = response.data?.data ?? response.data ?? [];

            setPresencas(fetchedData);

        } catch (error: any) {

            console.error('Erro ao buscar presenças:', error);

            toast.error(getErrorMessage(error, 'Erro ao carregar lista de chamada.'));

        } finally {

            setIsLoading(false);

        }

    }, [aulaId]);



    const syncPresencas = async (payload: SyncAulaPresencasPayload) => {

        if (!aulaId) return false;

        setIsSaving(true);

        try {

            await api.post(`/aulas-turmas/${aulaId}/presencas/sync`, payload);

            toast.success('Lista de chamada salva com sucesso!');

            await fetchPresencas(); // Recarrega os dados para garantir sincronia

            return true;

        } catch (error: any) {

            console.error('Erro ao salvar presenças:', error);

            toast.error(getErrorMessage(error, 'Erro ao salvar lista de chamada.'));

            return false;

        } finally {

            setIsSaving(false);

        }

    };



    return {

        presencas,

        isLoading,

        isSaving,

        fetchPresencas,

        syncPresencas

    };

};
