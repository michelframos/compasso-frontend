import { useForm, type Resolver } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import * as z from 'zod';

import api from '@/shared/lib/axios';

import { toast } from 'sonner';

import { getErrorMessage } from '@/shared/lib/utils';

import type { Conta } from '../types';



const contaSchema = z.object({

  id_categoria: z.union([z.number(), z.string()]).transform(v => parseInt(v as string, 10)).refine(val => !isNaN(val) && val > 0, { message: 'A categoria é obrigatória' }),

  descricao: z.string().min(3, 'A descrição deve ter pelo menos 3 caracteres'),

  valor: z.union([z.number(), z.string()]).transform(v => {

    if (typeof v === 'string') return parseFloat(v.replace(',', '.'));

    return v as number;

  }).refine(val => !isNaN(val) && val > 0, { message: 'O valor deve ser maior que zero' }),

  data_vencimento: z.string().min(10, 'Data de vencimento é obrigatória'),

  status: z.enum(['pendente', 'pago', 'cancelado', 'atrasado']),

  tipo: z.enum(['receita', 'despesa']),

  observacoes: z.string().nullable().optional().or(z.literal('')),

  id_aluno: z.union([z.number(), z.string()]).nullable().optional().transform(v => !v || v === '0' || v === '' ? null : Number(v)),

  id_matricula: z.union([z.number(), z.string()]).nullable().optional().transform(v => !v || v === '0' || v === '' ? null : Number(v)),

  repeticao: z.enum(['diaria', 'semanal', 'mensal']).nullable().optional().transform(v => !v ? null : v),

  quantidade_repeticoes: z.union([z.number(), z.string()]).nullable().optional().transform(v => !v || v === '' ? null : Number(v)),

  notificar: z.boolean().default(true),

});



export type ContaFormValues = z.infer<typeof contaSchema>;



export const useContaForm = (onSuccess: (id?: number) => void, initialData?: Conta) => {

  const form = useForm<ContaFormValues>({

    resolver: zodResolver(contaSchema) as Resolver<ContaFormValues>,

    defaultValues: {

      id_categoria: initialData?.id_categoria || '',

      descricao: initialData?.descricao || '',

      valor: initialData?.valor || '',

      data_vencimento: initialData?.data_vencimento ? initialData.data_vencimento.split('T')[0] : '', // simple cast

      status: initialData?.status || 'pendente',

      tipo: initialData?.tipo || 'despesa',

      observacoes: initialData?.observacoes || '',

      id_aluno: initialData?.id_aluno || null,

      id_matricula: initialData?.id_matricula || null,

      repeticao: null,

      quantidade_repeticoes: 1,

      notificar: initialData?.notificar ?? true,

    } as ContaFormValues,

  });



  const onSubmit = async (values: ContaFormValues) => {

    try {

      if (initialData?.id) {

        await api.put(`/contas/${initialData.id}`, values);

        toast.success('Conta atualizada com sucesso!');

        onSuccess(initialData.id);

      } else {

        const response = await api.post('/contas', values);

        toast.success('Conta cadastrada com sucesso!');

        onSuccess(response.data.data?.id || response.data.id);

      }

    } catch (err: unknown) {

      toast.error(getErrorMessage(err, 'Erro ao salvar conta'));

      console.error('Error saving conta:', err);

    }

  };



  return {

    form,

    onSubmit: form.handleSubmit(onSubmit),

    isLoading: form.formState.isSubmitting,

  };

};
