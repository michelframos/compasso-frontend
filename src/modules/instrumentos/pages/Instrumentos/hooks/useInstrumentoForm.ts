import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useInstrumentoStore } from '@/modules/instrumentos/store/useInstrumentoStore';
import type { Instrumento } from '@/modules/instrumentos/store/useInstrumentoStore';
import { syncInstrumentoContrato } from '@/lib/contrato-sync-utils';

const instrumentoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.string().min(1, 'Tipo é obrigatório'),
  numero_serie: z.string().optional().or(z.literal('')),
  status: z.enum(['disponivel', 'emprestado', 'manutencao', 'inativo']),
  observacoes: z.string().optional().or(z.literal('')),
});

export type InstrumentoFormValues = z.infer<typeof instrumentoSchema>;

export const useInstrumentoForm = (onSuccess: (id?: number) => void, initialData?: Instrumento) => {
  const { addInstrumento, updateInstrumento } = useInstrumentoStore();

  const form = useForm<InstrumentoFormValues>({
    resolver: zodResolver(instrumentoSchema),
    defaultValues: {
      nome: initialData?.nome || '',
      tipo: initialData?.tipo || '',
      numero_serie: initialData?.numero_serie || '',
      status: initialData?.status || 'disponivel',
      observacoes: initialData?.observacoes || '',
    },
  });

  const onSubmit = async (data: InstrumentoFormValues) => {
    let resultId: number | null = null;
    if (initialData?.id) {
      resultId = await updateInstrumento(initialData.id, data);
    } else {
      resultId = await addInstrumento(data);
    }

    if (resultId) {
      if (initialData?.id) {
          await syncInstrumentoContrato(initialData.id);
      }
      onSuccess(resultId);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading: form.formState.isSubmitting,
  };
};
