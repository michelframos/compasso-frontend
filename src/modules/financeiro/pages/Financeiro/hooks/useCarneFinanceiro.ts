import { useState } from 'react';

import { toast } from 'sonner';

import api from '@/shared/lib/axios';

import { getErrorMessage } from '@/shared/lib/utils';



export function useCarneFinanceiro() {

    const [isGenerating, setIsGenerating] = useState(false);



    const emitirCarne = async (contaIds: number[], options?: { titulo: string, preferencia_dados: 'aluno' | 'responsavel' }) => {

        if (contaIds.length === 0) {

            toast.error('Selecione ao menos uma receita para gerar o carnê.');

            return;

        }



        setIsGenerating(true);

        try {

            const titulo = options?.titulo;

            const preferencia_dados = options?.preferencia_dados || 'aluno';



            const response = await api.post(

                '/carne/gerar',

                { conta_ids: contaIds, titulo, preferencia_dados },

                { responseType: 'blob' }

            );



            const blob = new Blob([response.data], { type: 'application/pdf' });

            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');

            link.href = url;

            link.target = '_blank';

            link.rel = 'noopener noreferrer';

            link.click();

            URL.revokeObjectURL(url);



            toast.success('Carnê gerado com sucesso!');

        } catch (error: unknown) {

            const err = error as { response?: { data?: Blob } };



            // Tentar extrair mensagem de erro do blob

            if (err.response?.data instanceof Blob) {

                const text = await err.response.data.text();

                try {

                    const json = JSON.parse(text);

                    toast.error(getErrorMessage({ response: { data: json } }, 'Erro ao gerar o carnê.'));

                } catch {

                    toast.error('Erro ao gerar o carnê.');

                }

            } else {

                toast.error(getErrorMessage(error, 'Erro ao gerar o carnê. Verifique a configuração PIX.'));

            }

        } finally {

            setIsGenerating(false);

        }

    };



    return { emitirCarne, isGenerating };

}
