import { useForm, type Resolver } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import * as z from 'zod';

import api from '@/shared/lib/axios';

import { toast } from 'sonner';

import { AxiosError } from 'axios';

import { useState, useEffect, useCallback, useMemo } from 'react';

import { getErrorMessage } from '@/shared/lib/utils';

import type { Matricula } from '../types';



const matriculaSchema = z.object({

  id_aluno:      z.string().min(1, 'Selecione um aluno'),

  tipo:          z.enum(['turma', 'curso']).default('turma'),

  id_turma:      z.string().optional().or(z.literal('')),

  id_curso:      z.string().optional().or(z.literal('')),

  id_nivel:      z.string().optional().or(z.literal('')),

  id_professor:  z.string().optional().or(z.literal('')),

  data:          z.string().min(1, 'A data é obrigatória'),

  status:        z.string().default('ativa'),

  observacoes:   z.string().optional().or(z.literal('')),

  motivo_transferencia: z.string().optional().or(z.literal('')),

  id_lead:       z.coerce.number().optional().nullable(),

  contrato_id:   z.coerce.number().optional().nullable(),

  contrato_gerado: z.string().optional().nullable(),

}).superRefine((data, ctx) => {

  if (data.tipo === 'turma') {

    if (!data.id_turma || data.id_turma === '') {

      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Selecione uma turma', path: ['id_turma'] });

    }

  }

  if (data.tipo === 'curso') {

    if (!data.id_curso || data.id_curso === '') {

      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Selecione um curso', path: ['id_curso'] });

    }

    if (!data.id_nivel || data.id_nivel === '') {

      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Selecione um nível', path: ['id_nivel'] });

    }

    if (!data.id_professor || data.id_professor === '') {

      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Selecione um professor', path: ['id_professor'] });

    }

  }

});



export type MatriculaFormValues = z.infer<typeof matriculaSchema>;



export const useMatriculaForm = (

  onSuccess: (id?: number) => void,

  initialData?: {

    id?: number;

    defaultTurmaId?: string;

    defaultAlunoId?: string;

    defaultLeadId?: string;

  }

) => {

  const [fullMatriculaData, setFullMatriculaData] = useState<Matricula | null>(null);

  const [isFetchingFullData, setIsFetchingFullData] = useState(false);



  const { reset, ...form } = useForm<MatriculaFormValues>({

    resolver: zodResolver(matriculaSchema) as Resolver<MatriculaFormValues>,

    defaultValues: {

      id_aluno:     initialData?.defaultAlunoId || '',

      tipo:         'turma',

      id_turma:     initialData?.defaultTurmaId || '',

      id_curso:     '',

      id_nivel:     '',

      id_professor: '',

      data:         new Date().toISOString().split('T')[0],

      status:       'ativa',

      observacoes:  '',

      motivo_transferencia: '',

      id_lead:      initialData?.defaultLeadId ? Number(initialData.defaultLeadId) : null,

      contrato_id:  null,

      contrato_gerado: null,

    },

  });



  const fetchFullData = useCallback(async () => {

    if (initialData?.id) {

      setIsFetchingFullData(true);

      try {

        const response = await api.get(`/matriculas/${initialData.id}`);



        let data = response.data;

        if (data && data.data && typeof data.data === 'object' && 'id' in data.data) {

          data = data.data;

        } else if (data && data.data && typeof data.data === 'object' && !('id' in data.data)) {

          console.warn('Ambiguous data structure in fetchFullData:', data);

        }



        if (!data || typeof data !== 'object' || !('id' in data)) {

          throw new Error('Formato de dados inválido recebido do servidor');

        }



        setFullMatriculaData(data);



        reset({

          id_aluno:     String(data.id_aluno),

          tipo:         data.tipo || 'turma',

          id_turma:     data.id_turma ? String(data.id_turma) : '',

          id_curso:     data.id_curso ? String(data.id_curso) : '',

          id_nivel:     data.id_nivel ? String(data.id_nivel) : '',

          id_professor: data.id_professor ? String(data.id_professor) : '',

          data:         data.data,

          status:       data.status,

          observacoes:  data.observacoes || '',

          motivo_transferencia: '',

          id_lead:      data.id_lead || null,

          contrato_id:  data.contrato_id || null,

          contrato_gerado: data.contrato_gerado || null,

        });

      } catch (error) {

        console.error('Error fetching full matricula data:', error);

        toast.error(getErrorMessage(error, 'Erro ao carregar dados da matrícula.'));

      } finally {

        setIsFetchingFullData(false);

      }

    }

  }, [initialData?.id, reset]);



  useEffect(() => {

    fetchFullData();

  }, [fetchFullData]);



  const onSubmit = useCallback(async (values: MatriculaFormValues) => {

    try {

      // Limpar campos irrelevantes de acordo com o tipo

      const payload = { ...values };

      if (payload.tipo === 'turma') {

        payload.id_curso     = '';

        payload.id_nivel     = '';

        payload.id_professor = '';

      } else {

        payload.id_turma = '';

      }



      if (initialData?.id) {

        await api.put(`/matriculas/${initialData.id}`, payload);

        toast.success('Matrícula atualizada com sucesso!');

        await fetchFullData();

        onSuccess(initialData.id);

      } else {

        const response = await api.post('/matriculas', payload);

        toast.success('Matrícula realizada com sucesso!');

        onSuccess(response.data.data?.id || response.data.id);

      }

    } catch (err: unknown) {

      toast.error(getErrorMessage(err, 'Erro ao salvar matrícula.'));

      console.error('Error saving matricula:', err);

    }

  }, [initialData?.id, onSuccess, fetchFullData]);



  const result = useMemo(() => ({

    form,

    onSubmit: form.handleSubmit(onSubmit),

    isLoading: form.formState.isSubmitting,

    fullMatriculaData,

    isFetchingFullData,

  }), [form, onSubmit, fullMatriculaData, isFetchingFullData]);



  return result;

};
