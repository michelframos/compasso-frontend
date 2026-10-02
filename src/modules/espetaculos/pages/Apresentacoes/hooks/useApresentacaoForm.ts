import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/shared/lib/axios';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/lib/utils';
import type { Apresentacao } from '../types';
import { useState, useEffect } from 'react';

const apresentacaoSchema = z.object({
  id_espetaculo: z.coerce.number().min(1, 'Selecione um espetáculo'),
  id_turma: z.coerce.number().min(1, 'Selecione uma turma'),
  titulo_musica: z.string().min(2, 'O título da música deve ter pelo menos 2 caracteres'),
  ordem_entrada: z.coerce.number().min(1, 'A ordem de entrada é obrigatória'),
  duracao_estimada: z.string().min(5, 'A duração estimada é obrigatória (ex: 00:05)'),
});

export type ApresentacaoFormValues = z.infer<typeof apresentacaoSchema>;

export const useApresentacaoForm = (onSuccess: (id?: number) => void, initialData?: Apresentacao) => {
  const [fullApresentacaoData, setFullApresentacaoData] = useState<Apresentacao | null>(null);
  const [isFetchingFullData, setIsFetchingFullData] = useState(false);

  const { reset, ...form } = useForm<ApresentacaoFormValues>({
    resolver: zodResolver(apresentacaoSchema) as Resolver<ApresentacaoFormValues>,
    defaultValues: {
      id_espetaculo: initialData?.id_espetaculo || 0,
      id_turma: initialData?.id_turma || 0,
      titulo_musica: initialData?.titulo_musica || '',
      ordem_entrada: initialData?.ordem_entrada || 1,
      duracao_estimada: initialData?.duracao_estimada || '00:05:00',
    },
  });

  useEffect(() => {
    const fetchFullData = async () => {
      if (initialData?.id) {
        setIsFetchingFullData(true);
        try {
          const response = await api.get(`/apresentacoes/${initialData.id}`);
          const data = response.data.data || response.data;
          setFullApresentacaoData(data);
          
          reset({
            id_espetaculo: data.id_espetaculo,
            id_turma: data.id_turma,
            titulo_musica: data.titulo_musica,
            ordem_entrada: data.ordem_entrada,
            duracao_estimada: data.duracao_estimada,
          });
        } catch (error) {
          console.error('Error fetching full apresentacao data:', error);
          toast.error(getErrorMessage(error, 'Erro ao carregar dados da apresentação.'));
        } finally {
          setIsFetchingFullData(false);
        }
      }
    };

    fetchFullData();
  }, [initialData?.id, reset]);

  const onSubmit = async (values: ApresentacaoFormValues) => {
    try {
      if (initialData?.id) {
        await api.put(`/apresentacoes/${initialData.id}`, values);
        toast.success('Apresentação atualizada com sucesso!');
        onSuccess(initialData.id);
      } else {
        const response = await api.post('/apresentacoes', values);
        toast.success('Apresentação cadastrada com sucesso!');
        onSuccess(response.data.data?.id || response.data.id);
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erro ao salvar apresentação'));
      console.error('Error saving apresentacao:', err);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading: form.formState.isSubmitting,
    fullApresentacaoData,
    isFetchingFullData,
  };
};
