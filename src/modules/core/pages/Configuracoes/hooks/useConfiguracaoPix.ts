import { useState, useEffect } from 'react';

import { toast } from 'sonner';

import api from '@/lib/axios';

import { getErrorMessage } from '@/lib/utils';

import type { ConfiguracaoPix, ConfiguracaoPixFormData } from '@/modules/financeiro';



export function useConfiguracaoPix() {

    const [config, setConfig] = useState<ConfiguracaoPix | null>(null);

    const [isLoading, setIsLoading] = useState(true);

    const [isSaving, setIsSaving] = useState(false);



    const carregarConfig = async () => {

        setIsLoading(true);

        try {

            const response = await api.get<ConfiguracaoPix>('/configuracao-pix');

            setConfig(response.data);

        } catch {

            // Pode não ter configuração ainda — é normal

        } finally {

            setIsLoading(false);

        }

    };



    const salvarConfig = async (data: ConfiguracaoPixFormData) => {

        setIsSaving(true);

        try {

            const response = await api.put<ConfiguracaoPix>('/configuracao-pix', data);

            setConfig(response.data);

            toast.success('Configuração PIX salva com sucesso!');

        } catch (error) {

            toast.error(getErrorMessage(error, 'Erro ao salvar a configuração PIX.'));

        } finally {

            setIsSaving(false);

        }

    };



    useEffect(() => {

        carregarConfig();

    }, []);



    return { config, isLoading, isSaving, salvarConfig };

}
