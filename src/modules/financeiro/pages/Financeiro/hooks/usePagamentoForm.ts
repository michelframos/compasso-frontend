import { useState } from 'react';

import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import * as z from 'zod';

import { toast } from 'sonner';

import { getErrorMessage } from '@/shared/lib/utils';

import { useContas } from './useContas';

import type { Conta } from '../types';



const pagamentoSchema = z.object({

  valor_pago: z.number().min(0.01, 'O valor deve ser maior que zero'),

  data_pagamento: z.string().min(1, 'A data de pagamento é obrigatória'),

  forma_pagamento: z.string().min(1, 'A forma de pagamento é obrigatória'),

  observacoes: z.string().optional(),

});



type PagamentoFormValues = z.infer<typeof pagamentoSchema>;



export const usePagamentoForm = (

  conta: Conta,

  onSuccess: () => void

) => {

  const [isLoading, setIsLoading] = useState(false);

  const { createPagamento } = useContas();



  const form = useForm<PagamentoFormValues>({

    resolver: zodResolver(pagamentoSchema),

    defaultValues: {

      valor_pago: conta.saldo_devedor,

      data_pagamento: new Date().toISOString().split('T')[0],

      forma_pagamento: 'PIX',

      observacoes: '',

    },

  });



  const onSubmit = async (data: PagamentoFormValues) => {

    try {

      setIsLoading(true);

      await createPagamento(conta.id, data);

      toast.success('Pagamento registrado com sucesso!');

      onSuccess();

    } catch (error: unknown) {

      console.error('Erro ao registrar pagamento:', error);

      toast.error(getErrorMessage(error, 'Erro ao registrar pagamento. Verifique os dados e tente novamente.'));

    } finally {

      setIsLoading(false);

    }

  };



  return {

    form,

    onSubmit: form.handleSubmit(onSubmit),

    isLoading,

  };

};
