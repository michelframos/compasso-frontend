import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useInstrumentoStore } from '@/modules/instrumentos/store/useInstrumentoStore';
import { format } from 'date-fns';

const emprestimoSchema = z.object({
  id_aluno: z.string().min(1, 'Selecione um aluno'),
  data_emprestimo: z.string().min(1, 'Data de empréstimo é obrigatória'),
  data_prevista_devolucao: z.string().optional(),
  gerar_conta: z.boolean(),
  valor_conta: z.number().optional(),
  data_vencimento_conta: z.string().optional(),
  id_categoria_conta: z.number().optional().nullable(),
}).refine(data => !data.gerar_conta || (data.valor_conta !== undefined && data.data_vencimento_conta !== undefined && data.id_categoria_conta !== undefined && data.id_categoria_conta !== null && data.id_categoria_conta !== 0), {
  message: "Preencha todos os campos financeiros para gerar a cobrança",
  path: ["valor_conta"]
});

export type EmprestimoFormValues = z.infer<typeof emprestimoSchema>;

export const useEmprestimoForm = (onSuccess: () => void, instrumentoId: number) => {
  const { emprestarInstrumento } = useInstrumentoStore();

  const form = useForm<EmprestimoFormValues>({
    resolver: zodResolver(emprestimoSchema),
    defaultValues: {
      id_aluno: '',
      data_emprestimo: format(new Date(), 'yyyy-MM-dd'),
      data_prevista_devolucao: '',
      gerar_conta: false,
      valor_conta: 0,
      data_vencimento_conta: format(new Date(), 'yyyy-MM-dd'),
      id_categoria_conta: undefined,
    },
  });

  const onSubmit = async (data: EmprestimoFormValues, contratoId?: number | null, contratoGerado?: string | null) => {
    const result = await emprestarInstrumento(instrumentoId, {
      id_aluno: Number(data.id_aluno),
      data_emprestimo: data.data_emprestimo,
      data_prevista_devolucao: data.data_prevista_devolucao || null,
      contrato_id: contratoId,
      contrato_gerado: contratoGerado,
      gerar_conta: data.gerar_conta,
      valor_conta: data.valor_conta,
      data_vencimento_conta: data.data_vencimento_conta,
      id_categoria_conta: data.id_categoria_conta,
    });
    
    if (result) {
      onSuccess();
    }
  };

  return {
    form,
    handleSubmit: (contratoId?: number | null, contratoGerado?: string | null) => 
      form.handleSubmit((data) => onSubmit(data, contratoId, contratoGerado)),
    isLoading: form.formState.isSubmitting,
  };
};
