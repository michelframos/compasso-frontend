import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/shared/lib/axios';
import { toast } from 'sonner';
import type { Professor } from './useProfessores';
import { AxiosError } from 'axios';
import { useState, useEffect } from 'react';
import { getErrorMessage } from '@/shared/lib/utils';

const professorSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().optional().or(z.literal('')),
  password_confirmation: z.string().optional().or(z.literal('')),
  cpf: z.string().min(11, 'CPF inválido'),
  telefone: z.string().optional().or(z.literal('')),
  comissao: z.coerce.number().min(0).max(100).default(0),
  salario_fixo: z.coerce.number().min(0).default(0),
  valor_hora_aula: z.coerce.number().min(0).default(0),
  observacoes: z.string().optional().or(z.literal('')),
}).refine((data) => {
  if (data.password && data.password !== data.password_confirmation) {
    return false;
  }
  return true;
}, {
  message: "As senhas não coincidem",
  path: ["password_confirmation"],
});

export type ProfessorFormValues = z.infer<typeof professorSchema>;

export const useProfessorForm = (onSuccess: (id?: number) => void, initialData?: Professor) => {
  const [fullProfessorData, setFullProfessorData] = useState<Professor | null>(null);
  const [isFetchingFullData, setIsFetchingFullData] = useState(false);

  const { reset, ...form } = useForm<ProfessorFormValues>({
    resolver: zodResolver(professorSchema) as Resolver<ProfessorFormValues>,
    defaultValues: {
      nome: initialData?.usuario?.nome || '',
      email: initialData?.usuario?.email || '',
      cpf: initialData?.usuario?.cpf || '',
      telefone: initialData?.usuario?.telefone || '',
      comissao: initialData?.comissao || 0,
      salario_fixo: initialData?.salario_fixo || 0,
      valor_hora_aula: initialData?.valor_hora_aula || 0,
      observacoes: initialData?.observacoes || '',
      password: '',
      password_confirmation: '',
    },
  });

  useEffect(() => {
    const fetchFullData = async () => {
      if (initialData?.id) {
        setIsFetchingFullData(true);
        try {
          const response = await api.get(`/professores/${initialData.id}`);
          const data = response.data;
          setFullProfessorData(data);
          
          // Reset form with fetched data to populate fields
          reset({
            nome: data.usuario.nome,
            email: data.usuario.email,
            cpf: data.usuario.cpf,
            telefone: data.usuario.telefone || '',
            comissao: data.comissao,
            salario_fixo: data.salario_fixo,
            valor_hora_aula: data.valor_hora_aula,
            observacoes: data.observacoes || '',
            password: '',
            password_confirmation: '',
          });
        } catch (error) {
          console.error('Error fetching full professor data:', error);
          toast.error(getErrorMessage(error, 'Erro ao carregar dados complementares do professor.'));
        } finally {
          setIsFetchingFullData(false);
        }
      }
    };

    fetchFullData();
  }, [initialData?.id, reset]);

  const onSubmit = async (values: ProfessorFormValues) => {
    try {
      if (initialData) {
        const submissionData = { ...values } as Partial<ProfessorFormValues>;
        if (!submissionData.password) {
          delete submissionData.password;
          delete submissionData.password_confirmation;
        }
        await api.put(`/professores/${initialData.id}`, submissionData);
        toast.success('Professor atualizado com sucesso!');
        onSuccess(initialData.id);
      } else {
        const response = await api.post('/professores', values);
        toast.success('Professor cadastrado com sucesso!');
        onSuccess(response.data.id);
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erro ao salvar professor.'));
      console.error('Error saving professor:', err);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading: form.formState.isSubmitting,
    fullProfessorData,
    isFetchingFullData,
  };
};
