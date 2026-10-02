import { useForm, type Resolver } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import * as z from 'zod';

import api from '@/shared/lib/axios';

import { toast } from 'sonner';

import { getErrorMessage } from '@/shared/lib/utils';

import type { Curso } from '../types';



const cursoSchema = z.object({

  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),

  descricao: z.string().optional().or(z.literal('')),

  contrato_id: z.coerce.number().optional().nullable(),

});



export type CursoFormValues = z.infer<typeof cursoSchema>;



export const useCursoForm = (onSuccess: (id?: number) => void, initialData?: Curso) => {

  const form = useForm<CursoFormValues>({

    resolver: zodResolver(cursoSchema) as Resolver<CursoFormValues>,

    defaultValues: {

      nome: initialData?.nome || '',

      descricao: initialData?.descricao || '',

      contrato_id: initialData?.contrato_id || null,

    },

  });



  const handleManualSubmit = async () => {

    const isValid = await form.trigger();

    

    if (!isValid) {

    console.log("Erros de validação:", form.formState.errors);

    return;

  }



    const values = form.getValues();

      await onSubmit(values);

  };



  const onSubmit = async (values: CursoFormValues) => {

    try {

      if (initialData?.id) {

        await api.put(`/cursos/${initialData.id}`, values);

        toast.success('Curso atualizado com sucesso!');

        onSuccess(initialData.id);

      } else {

        const response = await api.post('/cursos', values);

        toast.success('Curso cadastrado com sucesso!');

        onSuccess(response.data.data?.id || response.data.id);

      }

    } catch (err: unknown) {

      toast.error(getErrorMessage(err, 'Erro ao salvar curso'));

      console.error('Error saving curso:', err);

    }

  };



  return {

    form,

    handleManualSubmit,

    onSubmit: form.handleSubmit(onSubmit),

    isLoading: form.formState.isSubmitting,

  };

};
