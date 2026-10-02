import { useForm, type Resolver } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/shared/lib/axios';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/lib/utils';
import type { Aluno } from '../types';
import { useState, useEffect, useCallback } from 'react';
import { syncAlunoContratos } from '@/lib/contrato-sync-utils';
import { leadsApi } from '@/modules/comercial'
import { useHasModulo } from '@/shared/hooks/useHasModulo';

const alunoSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')).nullable().transform(val => val === '' ? null : val),
  password: z.string().optional().or(z.literal('')).nullable().transform(val => val === '' ? null : val),
  password_confirmation: z.string().optional().or(z.literal('')).nullable().transform(val => val === '' ? null : val),
  cpf: z.string().optional().or(z.literal('')).nullable().transform(val => val === '' ? null : val),
  data_nascimento: z.string().optional().or(z.literal('')).nullable().transform(val => val === '' ? null : val),
  telefone: z.string().optional().or(z.literal('')).nullable().transform(val => val === '' ? null : val),
  whatsapp: z.string().optional().or(z.literal('')).nullable().transform(val => val === '' ? null : val),
  observacoes: z.string().optional().or(z.literal('')).nullable().transform(val => val === '' ? null : val),
  id_lead: z.number().optional().nullable(),
  id_responsavel: z.number().optional().nullable(),
  responsavel_nome: z.string().optional().or(z.literal('')).nullable().transform(val => val === '' ? null : val),
  responsavel_email: z.string().email('E-mail inválido').optional().or(z.literal('')).nullable().transform(val => val === '' ? null : val),
  responsavel_cpf: z.string().optional().or(z.literal('')).nullable().transform(val => val === '' ? null : val),
  responsavel_telefone: z.string().optional().or(z.literal('')).nullable().transform(val => val === '' ? null : val),
  responsavel_whatsapp: z.string().optional().or(z.literal('')).nullable().transform(val => val === '' ? null : val),
  responsavel_observacoes: z.string().optional().or(z.literal('')).nullable().transform(val => val === '' ? null : val),
  cep: z.string().optional().or(z.literal('')).nullable().transform(val => val === '' ? null : val),
  rua: z.string().optional().or(z.literal('')).nullable().transform(val => val === '' ? null : val),
  numero: z.string().optional().or(z.literal('')).nullable().transform(val => val === '' ? null : val),
  complemento: z.string().optional().or(z.literal('')).nullable().transform(val => val === '' ? null : val),
  bairro: z.string().optional().or(z.literal('')).nullable().transform(val => val === '' ? null : val),
  id_estado: z.union([z.number(), z.string()]).optional().nullable().transform(val => (val === '' || val === null || val === undefined) ? null : Number(val)),
  id_cidade: z.union([z.number(), z.string()]).optional().nullable().transform(val => (val === '' || val === null || val === undefined) ? null : Number(val)),
  responsavel_cep: z.string().optional().or(z.literal('')).nullable().transform(val => val === '' ? null : val),
  responsavel_rua: z.string().optional().or(z.literal('')).nullable().transform(val => val === '' ? null : val),
  responsavel_numero: z.string().optional().or(z.literal('')).nullable().transform(val => val === '' ? null : val),
  responsavel_complemento: z.string().optional().or(z.literal('')).nullable().transform(val => val === '' ? null : val),
  responsavel_bairro: z.string().optional().or(z.literal('')).nullable().transform(val => val === '' ? null : val),
  responsavel_id_estado: z.union([z.number(), z.string()]).optional().nullable().transform(val => (val === '' || val === null || val === undefined) ? null : Number(val)),
  responsavel_id_cidade: z.union([z.number(), z.string()]).optional().nullable().transform(val => (val === '' || val === null || val === undefined) ? null : Number(val)),
}).refine((data) => {
  if (data.password && data.password !== data.password_confirmation) {
    return false;
  }
  return true;
}, {
  message: "As senhas não coincidem",
  path: ["password_confirmation"],
});

export type AlunoFormValues = z.infer<typeof alunoSchema>;

export const useAlunoForm = (onSuccess: (id?: number) => void, initialData?: Aluno) => {
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get('lead_id');
  const hasLeads = useHasModulo('leads');
  const [fullAlunoData, setFullAlunoData] = useState<Aluno | null>(null);
  const [isFetchingFullData, setIsFetchingFullData] = useState(false);

  const { reset, ...form } = useForm<AlunoFormValues>({
    resolver: zodResolver(alunoSchema) as Resolver<AlunoFormValues>,
    defaultValues: {
      nome: initialData?.usuario?.nome || '',
      email: initialData?.usuario?.email || '',
      cpf: initialData?.usuario?.cpf || '',
      data_nascimento: initialData?.usuario?.data_aniversario || '',
      telefone: initialData?.usuario?.telefone || '',
      whatsapp: initialData?.usuario?.whatsapp || '',
      observacoes: initialData?.observacoes || '',
      id_lead: initialData?.id_lead || (hasLeads && leadId ? Number(leadId) : null),
      id_responsavel: initialData?.responsaveis?.[0]?.id || null,
      responsavel_nome: initialData?.responsaveis?.[0]?.nome || '',
      responsavel_email: initialData?.responsaveis?.[0]?.email || '',
      responsavel_cpf: initialData?.responsaveis?.[0]?.cpf || '',
      responsavel_telefone: initialData?.responsaveis?.[0]?.telefone || '',
      responsavel_whatsapp: initialData?.responsaveis?.[0]?.whatsapp || '',
      responsavel_observacoes: initialData?.responsaveis?.[0]?.responsavel_observacoes || '',
      cep: initialData?.usuario?.cep || '',
      rua: initialData?.usuario?.rua || '',
      numero: initialData?.usuario?.numero || '',
      complemento: initialData?.usuario?.complemento || '',
      bairro: initialData?.usuario?.bairro || '',
      id_estado: initialData?.usuario?.id_estado || null,
      id_cidade: initialData?.usuario?.id_cidade || null,
      responsavel_cep: initialData?.responsaveis?.[0]?.cep || '',
      responsavel_rua: initialData?.responsaveis?.[0]?.rua || '',
      responsavel_numero: initialData?.responsaveis?.[0]?.numero || '',
      responsavel_complemento: initialData?.responsaveis?.[0]?.complemento || '',
      responsavel_bairro: initialData?.responsaveis?.[0]?.bairro || '',
      responsavel_id_estado: initialData?.responsaveis?.[0]?.id_estado || null,
      responsavel_id_cidade: initialData?.responsaveis?.[0]?.id_cidade || null,
      password: '',
      password_confirmation: '',
    },
  });

  const fetchFullData = useCallback(async () => {
    if (initialData?.id) {
      setIsFetchingFullData(true);
      try {
        const response = await api.get<{ data: Aluno }>(`/alunos/${initialData.id}`);
        const alunoData = response.data.data;
        setFullAlunoData(alunoData);
        
        reset({
          nome: alunoData.usuario.nome,
          email: alunoData.usuario.email,
          cpf: alunoData.usuario.cpf,
          data_nascimento: alunoData.usuario.data_aniversario || '',
          telefone: alunoData.usuario.telefone || '',
          whatsapp: alunoData.usuario.whatsapp || '',
          observacoes: alunoData.observacoes || '',
          id_lead: alunoData.id_lead || null,
          id_responsavel: alunoData.responsaveis?.[0]?.id || null,
          responsavel_nome: alunoData.responsaveis?.[0]?.nome || '',
          responsavel_email: alunoData.responsaveis?.[0]?.email || '',
          responsavel_cpf: alunoData.responsaveis?.[0]?.cpf || '',
          responsavel_telefone: alunoData.responsaveis?.[0]?.telefone || '',
          responsavel_whatsapp: alunoData.responsaveis?.[0]?.whatsapp || '',
          responsavel_observacoes: alunoData.responsaveis?.[0]?.responsavel_observacoes || '',
          cep: alunoData.usuario.cep || '',
          rua: alunoData.usuario.rua || '',
          numero: alunoData.usuario.numero || '',
          complemento: alunoData.usuario.complemento || '',
          bairro: alunoData.usuario.bairro || '',
          id_estado: alunoData.usuario.id_estado ?? null,
          id_cidade: alunoData.usuario.id_cidade ?? null,
          responsavel_cep: alunoData.responsaveis?.[0]?.cep || '',
          responsavel_rua: alunoData.responsaveis?.[0]?.rua || '',
          responsavel_numero: alunoData.responsaveis?.[0]?.numero || '',
          responsavel_complemento: alunoData.responsaveis?.[0]?.complemento || '',
          responsavel_bairro: alunoData.responsaveis?.[0]?.bairro || '',
          responsavel_id_estado: alunoData.responsaveis?.[0]?.id_estado ?? null,
          responsavel_id_cidade: alunoData.responsaveis?.[0]?.id_cidade ?? null,
          password: '',
          password_confirmation: '',
        });
      } catch (error) {
        console.error('Error fetching full aluno data:', error);
        toast.error(getErrorMessage(error, 'Erro ao carregar dados complementares do aluno.'));
      } finally {
        setIsFetchingFullData(false);
      }
    }
  }, [initialData?.id, reset]);

  useEffect(() => {
    fetchFullData();
  }, [fetchFullData]);

  // Pre-fill from Lead
  useEffect(() => {
    if (!hasLeads || !leadId || initialData) return;

    const fetchLeadData = async () => {
      setIsFetchingFullData(true);
      try {
        const response = await leadsApi.getLead(leadId);
        const leadData = (response as { data?: Record<string, unknown> }).data ?? response;
        reset({
          nome: leadData.nome as string,
          email: (leadData.email as string) || '',
          telefone: (leadData.telefone as string) || '',
          whatsapp: (leadData.telefone as string) || '',
          cpf: '',
          observacoes: (leadData.observacoes as string) || '',
          id_lead: Number(leadId),
          password: '',
          password_confirmation: '',
        });
      } catch (error) {
        console.error('Error fetching lead data:', error);
        toast.error(getErrorMessage(error, 'Erro ao carregar dados do lead.'));
      } finally {
        setIsFetchingFullData(false);
      }
    };
    fetchLeadData();
  }, [hasLeads, leadId, initialData, reset]);

  const onSubmit = async (values: AlunoFormValues) => {
    try {
      if (initialData) {
        const submissionData = { ...values } as Partial<AlunoFormValues>;
        if (!submissionData.password) {
          delete submissionData.password;
          delete submissionData.password_confirmation;
        }
        await api.put(`/alunos/${initialData.id}`, submissionData);
        
        // Sincronizar contratos se dados importantes mudaram
        await syncAlunoContratos(initialData.id);
        
        toast.success('Aluno atualizado com sucesso!');
        onSuccess(initialData.id);
      } else {
        const response = await api.post('/alunos', values);
        toast.success('Aluno cadastrado com sucesso!');
        // Se a API retornar o objeto dentro de 'data', ajustar conforme necessário.
        // Baseado em AlunoFormPage line 55, a API de GET retorna { data: Aluno }.
        // Verificando padrão de POST comum.
        onSuccess(response.data.data?.id || response.data.id);
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erro ao salvar aluno'));
      console.error('Error saving aluno:', err);
    }
  };

  const onInvalid = (errors: any) => {
    console.error('Validation errors:', errors);
    toast.error('Existem campos inválidos ou obrigatórios não preenchidos. Verifique as abas "Dados Gerais" e "Responsável".');
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit, onInvalid),
    isLoading: form.formState.isSubmitting,
    fullAlunoData,
    isFetchingFullData,
    refetch: fetchFullData,
  };
};
