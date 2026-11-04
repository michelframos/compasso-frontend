import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/shared/lib/axios';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { useState, useEffect } from 'react';
import { getErrorMessage } from '@/shared/lib/utils';

const espetaculoSchema = z.object({
  titulo: z.string().min(3, 'O título deve ter pelo menos 3 caracteres'),
  data_evento: z.string().min(10, 'A data é obrigatória'),
  hora_evento: z.string().optional().or(z.literal('')),
  local: z.string().min(3, 'O local é obrigatório'),
  status: z.enum(['planejamento', 'aberto', 'concluido', 'cancelado']),
  observacoes: z.string().optional().or(z.literal('')),
  contrato_id: z.number().nullable().optional(),
  validade_ingresso_inicio: z.string().optional().or(z.literal('')),
  validade_ingresso_fim: z.string().optional().or(z.literal('')),
  id_template_ingresso: z.number().nullable().optional(),
  valor_ingresso_padrao: z.number().nullable().optional(),
});

export type EspetaculoFormValues = z.infer<typeof espetaculoSchema>;

export const useEspetaculoForm = (onSuccess: (id?: number) => void, initialData?: import('../types').Espetaculo) => {
  const [fullEspetaculoData, setFullEspetaculoData] = useState<import('../types').Espetaculo | null>(null);
  const [isFetchingFullData, setIsFetchingFullData] = useState(false);

  const { reset, ...form } = useForm<EspetaculoFormValues>({
    resolver: zodResolver(espetaculoSchema) as Resolver<EspetaculoFormValues>,
    defaultValues: {
      titulo: initialData?.titulo || '',
      data_evento: initialData?.data_evento || '',
      hora_evento: initialData?.hora_evento || '',
      local: initialData?.local || '',
      status: initialData?.status || 'planejamento',
      observacoes: initialData?.observacoes || '',
      contrato_id: initialData?.contrato_id || null,
      validade_ingresso_inicio: initialData?.validade_ingresso_inicio?.slice(0, 16) || '',
      validade_ingresso_fim: initialData?.validade_ingresso_fim?.slice(0, 16) || '',
      id_template_ingresso: initialData?.id_template_ingresso || null,
      valor_ingresso_padrao: initialData?.valor_ingresso_padrao ?? null,
    },
  });

  useEffect(() => {
    const fetchFullData = async () => {
      if (initialData?.id) {
        setIsFetchingFullData(true);
        try {
          const response = await api.get(`/espetaculos/${initialData.id}`);
          const data = response.data.data || response.data;
          setFullEspetaculoData(data);
          
          reset({
            titulo: data.titulo,
            data_evento: data.data_evento,
            hora_evento: data.hora_evento || '',
            local: data.local,
            status: data.status,
            observacoes: data.observacoes || '',
            contrato_id: data.contrato_id || null,
            validade_ingresso_inicio: data.validade_ingresso_inicio
              ? String(data.validade_ingresso_inicio).slice(0, 16)
              : '',
            validade_ingresso_fim: data.validade_ingresso_fim
              ? String(data.validade_ingresso_fim).slice(0, 16)
              : '',
            id_template_ingresso: data.id_template_ingresso || null,
            valor_ingresso_padrao: data.valor_ingresso_padrao ?? null,
          });
        } catch (error) {
          console.error('Error fetching full espetaculo data:', error);
          toast.error(getErrorMessage(error, 'Erro ao carregar dados do espetáculo.'));
        } finally {
          setIsFetchingFullData(false);
        }
      }
    };

    fetchFullData();
  }, [initialData?.id, reset]);

  const onSubmit = async (values: EspetaculoFormValues) => {
    const payload = {
      ...values,
      hora_evento: values.hora_evento || null,
      validade_ingresso_inicio: values.validade_ingresso_inicio || null,
      validade_ingresso_fim: values.validade_ingresso_fim || null,
      id_template_ingresso: values.id_template_ingresso || null,
      valor_ingresso_padrao: values.valor_ingresso_padrao ?? null,
    };
    try {
      if (initialData?.id) {
        await api.put(`/espetaculos/${initialData.id}`, payload);
        toast.success('Espetáculo atualizado com sucesso!');
        onSuccess(initialData.id);
      } else {
        const response = await api.post('/espetaculos', payload);
        toast.success('Espetáculo cadastrado com sucesso!');
        onSuccess(response.data.data?.id || response.data.id);
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erro ao salvar espetáculo.'));
      console.error('Error saving espetaculo:', err);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading: form.formState.isSubmitting,
    fullEspetaculoData,
    isFetchingFullData,
  };
};
