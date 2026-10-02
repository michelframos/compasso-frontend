import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/shared/lib/axios';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/lib/utils';
import type { CategoriaConta } from '../types';

const categoriaSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  tipo: z.enum(['receita', 'despesa']),
  descricao: z.string().optional().or(z.literal('')),
});

export type CategoriaFormValues = z.infer<typeof categoriaSchema>;

export const useCategoriaForm = (onSuccess: () => void, initialData?: CategoriaConta) => {
  const form = useForm<CategoriaFormValues>({
    resolver: zodResolver(categoriaSchema) as Resolver<CategoriaFormValues>,
    defaultValues: {
      nome: initialData?.nome || '',
      tipo: initialData?.tipo || 'despesa',
      descricao: initialData?.descricao || '',
    } as CategoriaFormValues,
  });

  const onSubmit = async (values: CategoriaFormValues) => {
    try {
      if (initialData?.id) {
        await api.put(`/categorias-contas/${initialData.id}`, values);
        toast.success('Categoria atualizada com sucesso!');
        onSuccess();
      } else {
        await api.post('/categorias-contas', values);
        toast.success('Categoria cadastrada com sucesso!');
        onSuccess();
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erro ao salvar categoria'));
      console.error('Error saving categoria:', err);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading: form.formState.isSubmitting,
  };
};
