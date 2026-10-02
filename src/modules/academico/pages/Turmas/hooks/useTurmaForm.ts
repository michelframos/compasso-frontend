import { useForm, type Resolver } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import * as z from 'zod';

import api from '@/shared/lib/axios';

import { toast } from 'sonner';

import { AxiosError } from 'axios';

import { getErrorMessage } from '@/shared/lib/utils';

import { useState, useEffect, useCallback } from 'react';

import { syncTurmaContratos } from '@/lib/contrato-sync-utils';







import type { Turma } from '../types';



const turmaSchema = z.object({

  id_curso: z.coerce.number().min(1, 'Selecione um curso'),

  id_nivel: z.coerce.number().min(1, 'Selecione um nível'),

  id_professor: z.coerce.number().nullable().optional(),

  maximo_alunos: z.coerce.number().min(1, 'Mínimo de 1 aluno'),

  descricao: z.string().max(255).optional().or(z.literal('')),

  observacoes: z.string().optional().or(z.literal('')),

  status: z.enum(['planejamento', 'aberta', 'em_andamento', 'pausada', 'concluida', 'cancelada']).default('planejamento'),

  valor_mensalidade: z.coerce.number().min(0).optional().or(z.literal(0)),

  percentual_comissao_especifico: z.coerce.number().min(0).max(100).optional().or(z.literal(0)),

  valor_hora_aula_especifico: z.coerce.number().min(0).optional().or(z.literal(0)),

  tipo_agendamento: z.enum(['datas', 'quantidade']).default('datas'),

  data_inicio: z.string().min(1, 'Início é obrigatório').nullable().optional(),

  data_fim: z.string().nullable().optional(),

  quantidade_aulas: z.coerce.number().min(1, 'Mínimo de 1 aula').nullable().optional(),

  contrato_id: z.coerce.number().optional().nullable(),

  horarios: z.array(z.object({

    dia_semana: z.string(),

    hora_inicio: z.string().min(1, 'Obrigatório'),

    hora_termino: z.string().min(1, 'Obrigatório')

  }).refine((data) => data.hora_termino > data.hora_inicio, {

    message: 'Deve ser maior que início',

    path: ['hora_termino']

  })).default([]),

});



export type TurmaFormValues = z.infer<typeof turmaSchema>;



export const useTurmaForm = (onSuccess: (id?: number) => void, initialData?: Turma) => {

  const [isLoadingData, setIsLoadingData] = useState(false);

  const [fullTurmaData, setFullTurmaData] = useState<Turma | null>(null);

  

  const { reset, ...form } = useForm<TurmaFormValues>({

    resolver: zodResolver(turmaSchema) as Resolver<TurmaFormValues>,

    defaultValues: {

      id_curso: initialData?.id_curso || 0,

      id_nivel: initialData?.id_nivel || 0,

      id_professor: initialData?.id_professor || null,

      maximo_alunos: initialData?.maximo_alunos || 20,

      descricao: initialData?.descricao || '',

      observacoes: initialData?.observacoes || '',

      status: initialData?.status || 'planejamento',

      valor_mensalidade: initialData?.valor_mensalidade || 0,

      percentual_comissao_especifico: initialData?.percentual_comissao_especifico || 0,

      valor_hora_aula_especifico: initialData?.valor_hora_aula_especifico || 0,

      tipo_agendamento: initialData?.tipo_agendamento || 'datas',

      data_inicio: initialData?.data_inicio || '',

      data_fim: initialData?.data_fim || '',

      quantidade_aulas: initialData?.quantidade_aulas || null,

      contrato_id: initialData?.contrato_id || null,

      horarios: (initialData?.horarios || []).map((h: NonNullable<Turma['horarios']>[0]) => ({

        ...h,

        hora_inicio: h.hora_inicio?.substring(0, 5) || '',

        hora_termino: h.hora_termino?.substring(0, 5) || ''

      })),

    },

  });



  const fetchFullData = useCallback(async () => {



    if (initialData?.id) {

      setIsLoadingData(true);

      try {

        const response = await api.get(`/turmas/${initialData.id}`);

        const data = response.data.data || response.data;

        setFullTurmaData(data);

        

        reset({

          id_curso: data.id_curso,

          id_nivel: data.id_nivel,

          id_professor: data.id_professor,

          maximo_alunos: data.maximo_alunos,

          descricao: data.descricao || '',

          observacoes: data.observacoes || '',

          status: data.status,

          valor_mensalidade: data.valor_mensalidade || 0,

          percentual_comissao_especifico: data.percentual_comissao_especifico || 0,

          valor_hora_aula_especifico: data.valor_hora_aula_especifico || 0,

          tipo_agendamento: data.tipo_agendamento || 'datas',

          data_inicio: data.data_inicio || '',

          data_fim: data.data_fim || '',

          quantidade_aulas: data.quantidade_aulas || null,

          contrato_id: data.contrato_id || null,

          horarios: (data.horarios || []).map((h: NonNullable<Turma['horarios']>[0]) => ({

            ...h,

            hora_inicio: h.hora_inicio?.substring(0, 5) || '',

            hora_termino: h.hora_termino?.substring(0, 5) || ''

          })),

        });

      } catch (error) {

        console.error('Error fetching full turma data:', error);

        toast.error(getErrorMessage(error, 'Erro ao carregar dados da turma.'));

      } finally {

        setIsLoadingData(false);

      }

    }

  }, [initialData?.id, reset]);



  useEffect(() => {

    fetchFullData();

  }, [fetchFullData]);



  useEffect(() => {

    window.addEventListener('refreshTurmaData', fetchFullData);

    return () => window.removeEventListener('refreshTurmaData', fetchFullData);

  }, [fetchFullData]);





  const onSubmit = async (values: TurmaFormValues) => {

    try {

      if (initialData?.id) {

        await api.put(`/turmas/${initialData.id}`, values);

        

        // Sincronizar contratos de todas as matrículas desta turma

        await syncTurmaContratos(initialData.id);

        

        toast.success('Turma atualizada com sucesso!');

        onSuccess(initialData.id);

      } else {

        const response = await api.post('/turmas', values);

        toast.success('Turma cadastrada com sucesso!');

        onSuccess(response.data.data?.id || response.data.id);

      }

    } catch (err: unknown) {

      toast.error(getErrorMessage(err, 'Erro ao salvar turma.'));

      console.error('Error saving turma:', err);

    }

  };



  return {

    form,

    onSubmit: form.handleSubmit(onSubmit),

    isLoading: form.formState.isSubmitting,

    isLoadingData,

    fullTurmaData

  };

};


