import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Lead } from './useLeads';

const leadSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100),
  email: z.string().email('Email inválido').max(100).nullable().or(z.literal('')),
  telefone: z.string().max(20).nullable().or(z.literal('')),
  status: z.enum(['novo', 'contatado', 'matriculado', 'perdido']),
  observacoes: z.string().nullable().or(z.literal('')),
});

export type LeadFormValues = z.infer<typeof leadSchema>;

export const useLeadForm = (onSubmit: (data: LeadFormValues) => Promise<boolean>, initialData?: Lead) => {
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema) as Resolver<LeadFormValues>,
    defaultValues: {
      nome: initialData?.nome || '',
      email: initialData?.email || '',
      telefone: initialData?.telefone || '',
      status: initialData?.status || 'novo',
      observacoes: initialData?.observacoes || '',
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

  return {
    form,
    handleManualSubmit,
    isLoading: form.formState.isSubmitting,
  };
};
