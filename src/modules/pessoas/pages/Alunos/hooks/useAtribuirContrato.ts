import { useState, useEffect } from 'react';

import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import * as z from 'zod';

import { toast } from 'sonner';

import { getErrorMessage } from '@/shared/lib/utils';

import api from '@/shared/lib/axios';

import { substituirPlaceholders } from '@/lib/contrato-utils';

import { useContratos } from '@/modules/financeiro';



const atribuirContratoSchema = z.object({

    tipo_vinculo: z.enum(['matricula', 'instrumento', 'avulso']),

    id_item: z.string().optional(),

    contrato_id: z.string().min(1, 'Selecione um template de contrato'),

    contrato_gerado: z.string().nullable(),

}).superRefine((data, ctx) => {

    if (data.tipo_vinculo !== 'avulso' && (!data.id_item || data.id_item === '')) {

        ctx.addIssue({

            code: z.ZodIssueCode.custom,

            message: "Selecione um item",

            path: ["id_item"]

        });

    }

});



type AtribuirContratoFormValues = z.infer<typeof atribuirContratoSchema>;



export const useAtribuirContrato = (alunoId: number | undefined, onSuccess: () => void) => {

    const [isLoading, setIsLoading] = useState(false);

    const { contratos, fetchContratos } = useContratos();



    const form = useForm<AtribuirContratoFormValues>({

        resolver: zodResolver(atribuirContratoSchema),

        defaultValues: {

            tipo_vinculo: 'matricula',

            id_item: '',

            contrato_id: '',

            contrato_gerado: null,

        },

    });



    const { watch, setValue } = form;

    const tipoVinculo = watch('tipo_vinculo');

    const idItem = watch('id_item');

    const contratoId = watch('contrato_id');



    useEffect(() => {

        fetchContratos(1, 'nome', 'asc');

    }, [fetchContratos]);



    // Lógica para gerar o snapshot quando os campos mudam

    useEffect(() => {

        if (!contratoId || !alunoId || (tipoVinculo !== 'avulso' && !idItem)) {

            setValue('contrato_gerado', null);

            return;

        }



        const gerarSnapshot = async () => {

            try {

                const contrato = contratos.find(c => c.id === Number(contratoId));

                if (!contrato) return;



                const alunoRes = await api.get(`/alunos/${alunoId}`);

                const alunoData = alunoRes.data.data;

                const payload: { aluno: Record<string, unknown>; turma?: Record<string, unknown>; data_matricula?: string; instrumento?: Record<string, unknown>; data_emprestimo?: string } = { aluno: alunoData };



                if (tipoVinculo !== 'avulso') {

                    const itemRes = await api.get(tipoVinculo === 'matricula' ? `/matriculas/${idItem}` : `/instrumentos/${idItem}`);

                    const itemData = itemRes.data.data;



                    if (tipoVinculo === 'matricula') {

                        payload.turma = itemData.turma;

                        payload.data_matricula = itemData.data;

                    } else {

                        payload.instrumento = itemData;

                        payload.data_emprestimo = itemData.data_emprestimo;

                    }

                }



                const conteudoGerado = substituirPlaceholders(contrato.conteudo, payload);

                setValue('contrato_gerado', conteudoGerado);

            } catch (error) {

                console.error('Erro ao gerar snapshot do contrato:', error);

            }

        };



        gerarSnapshot();

    }, [contratoId, idItem, alunoId, tipoVinculo, contratos, setValue]);



    const onSubmit = async (data: AtribuirContratoFormValues) => {

        if (!alunoId) return;

        setIsLoading(true);



        try {

            if (data.tipo_vinculo === 'avulso') {

                await api.post(`/alunos/${alunoId}/contratos-avulsos`, {

                    contrato_id: Number(data.contrato_id),

                    contrato_gerado: data.contrato_gerado

                });

            } else {

                const endpoint = data.tipo_vinculo === 'matricula' 

                    ? `/matriculas/${data.id_item}` 

                    : `/instrumentos/${data.id_item}`;

                

                await api.put(endpoint, {

                    contrato_id: Number(data.contrato_id),

                    contrato_gerado: data.contrato_gerado

                });

            }



            toast.success('Contrato atribuído com sucesso!');

            onSuccess();

        } catch (error: unknown) {

            console.error('Erro ao atribuir contrato:', error);

            toast.error(getErrorMessage(error, 'Erro ao atribuir contrato. Verifique os dados e tente novamente.'));

        } finally {

            setIsLoading(false);

        }

    };



    return {

        form,

        onSubmit: form.handleSubmit(onSubmit),

        isLoading,

        contratos

    };

};
