import { useForm, type Resolver } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import * as z from 'zod';

import api from '@/shared/lib/axios';

import { toast } from 'sonner';

import { getErrorMessage } from '@/shared/lib/utils';

import type { Nivel } from '../types';



const nivelSchema = z.object({

  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),

  observacoes: z.string().optional().or(z.literal('')),

  curso_id: z.preprocess(

    (a) => (a === '' || a === undefined || a === null ? null : parseInt(a as string, 10)),

    z.number().optional().nullable()

  ),

  ordem: z.preprocess(

    (a) => (a === '' || a === undefined || a === null ? null : parseInt(a as string, 10)),

    z.number().optional().nullable()

  ),

  idade_minima: z.preprocess(

    (a) => (a === '' || a === undefined || a === null ? null : parseInt(a as string, 10)),

    z.number().min(0, 'A idade não pode ser negativa').optional().nullable()

  ),

  idade_maxima: z.preprocess(

    (a) => (a === '' || a === undefined || a === null ? null : parseInt(a as string, 10)),

    z.number().min(0, 'A idade não pode ser negativa').optional().nullable()

  ),

  cor_identificacao: z.string().optional().nullable().or(z.literal('')),

  expectativas_aprendizado: z.string().optional().nullable().or(z.literal('')),

}).refine(data => {

  if (data.idade_minima != null && data.idade_maxima != null && data.idade_minima > data.idade_maxima) {

    return false;

  }

  return true;

}, {

  message: "Idade máxima não pode ser menor que a mínima",

  path: ["idade_maxima"]

});



export type NivelFormValues = z.infer<typeof nivelSchema>;



export const useNivelForm = (onSuccess: (id?: number) => void, initialData?: Nivel) => {

  const form = useForm<NivelFormValues>({

    resolver: zodResolver(nivelSchema) as Resolver<NivelFormValues>,

    defaultValues: {

      nome: initialData?.nome || '',

      observacoes: initialData?.observacoes || '',

      curso_id: initialData?.curso_id ?? null,

      ordem: initialData?.ordem ?? null,

      idade_minima: initialData?.idade_minima ?? null,

      idade_maxima: initialData?.idade_maxima ?? null,

      cor_identificacao: initialData?.cor_identificacao || '',

      expectativas_aprendizado: initialData?.expectativas_aprendizado || '',

    },

  });



  const onSubmit = async (values: NivelFormValues) => {

    try {

      if (initialData?.id) {

        await api.put(`/niveis/${initialData.id}`, values);

        toast.success('Nível atualizado com sucesso!');

        onSuccess(initialData.id);

      } else {

        const response = await api.post('/niveis', values);

        toast.success('Nível cadastrado com sucesso!');

        onSuccess(response.data.data?.id || response.data.id);

      }

    } catch (err: unknown) {

      toast.error(getErrorMessage(err, 'Erro ao salvar nível'));

      console.error('Error saving nivel:', err);

    }

  };



  return {

    form,

    onSubmit: form.handleSubmit(onSubmit),

    isLoading: form.formState.isSubmitting,

  };

};
