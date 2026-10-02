import { useState } from 'react';

import { toast } from 'sonner';

import api from '@/shared/lib/axios';

import { getErrorMessage } from '@/shared/lib/utils';



export function useCarneMatricula() {

    const [isGenerating, setIsGenerating] = useState(false);



    const emitirCarne = async (matriculaId: number, options?: { titulo: string, preferencia_dados: 'aluno' | 'responsavel' }) => {

        setIsGenerating(true);

        try {

            // Busca todos os IDs de conta da matrícula (sem paginação)

            const { data: contasResponse } = await api.get('/contas', {

                params: { id_matricula: matriculaId, per_page: 999, tipo: 'receita' },

            });



            const contaIds: number[] = (contasResponse.data ?? []).map((c: { id: number }) => c.id);



            if (contaIds.length === 0) {

                toast.warning('Esta matrícula não possui mensalidades (receitas) cadastradas.');

                return;

            }



            const titulo = options?.titulo || 'Carnê de Pagamento';

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



            if (err.response?.data instanceof Blob) {

                const text = await err.response.data.text();

                try {

                    const json = JSON.parse(text);

                    toast.error(getErrorMessage({ response: { data: json } }, 'Erro ao gerar o carnê.'));

                } catch {

                    toast.error('Erro ao gerar o carnê.');

                }

            } else {

                toast.error(getErrorMessage(error, 'Erro ao gerar o carnê. Verifique a configuração PIX da escola.'));

            }

        } finally {

            setIsGenerating(false);

        }

    };



    return { emitirCarne, isGenerating };

}
