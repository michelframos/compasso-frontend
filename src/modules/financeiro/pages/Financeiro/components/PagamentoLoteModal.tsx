import React, { useState } from 'react';

import { Button } from '@/shared/components/ui/button';

import { Input } from '@/shared/components/ui/input';

import { useContas } from '../hooks/useContas';

import { toast } from 'sonner';

import { getErrorMessage } from '@/shared/lib/utils';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

import { CheckCircle2 } from 'lucide-react';

import type { PagamentoLoteFormData } from '../types';



interface PagamentoLoteModalProps {

    contaIds: number[];

    onClose: () => void;

    onSuccess: () => void;

}



export const PagamentoLoteModal: React.FC<PagamentoLoteModalProps> = ({ contaIds, onClose, onSuccess }) => {

    const { createPagamentoLote } = useContas();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<Partial<PagamentoLoteFormData>>({

        data_pagamento: new Date().toISOString().split('T')[0],

        forma_pagamento: 'pix',

        observacoes: ''

    });



    const handleFormaPagamentoChange = (value: string) => {

        setFormData(prev => ({ ...prev, forma_pagamento: value }));

    };



    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();

        

        if (!formData.data_pagamento || !formData.forma_pagamento) {

            toast.error('Preencha a data e forma de pagamento.');

            return;

        }



        try {

            setIsSubmitting(true);

            await createPagamentoLote({

                conta_ids: contaIds,

                data_pagamento: formData.data_pagamento,

                forma_pagamento: formData.forma_pagamento,

                observacoes: formData.observacoes

            });

            toast.success(`${contaIds.length} contas liquidadas com sucesso!`);

            onSuccess();

        } catch (error) {

            console.error(error);

            toast.error(getErrorMessage(error, 'Erro ao processar pagamentos.'));

        } finally {

            setIsSubmitting(false);

        }

    };



    return (

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">

            <div className="flex-1 overflow-y-auto p-8 space-y-6">

                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-start gap-3 border border-emerald-100">

                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />

                    <div className="text-sm">

                        Você selecionou <strong>{contaIds.length}</strong> conta(s) para liquidação total.

                    </div>

                </div>



                <div className="space-y-4">

                    <div className="space-y-2">

                        <label className="text-sm font-bold text-zinc-700">Data do Pagamento</label>

                        <Input

                            type="date"

                            required

                            value={formData.data_pagamento}

                            onChange={e => setFormData(prev => ({ ...prev, data_pagamento: e.target.value }))}

                            className="h-11 rounded-xl border-zinc-200"

                        />

                    </div>



                    <div className="space-y-2">

                        <label className="text-sm font-bold text-zinc-700">Forma de Pagamento</label>

                        <Select value={formData.forma_pagamento} onValueChange={handleFormaPagamentoChange}>

                            <SelectTrigger className="h-11 rounded-xl border-zinc-200">

                                <SelectValue placeholder="Selecione a forma" />

                            </SelectTrigger>

                            <SelectContent>

                                <SelectItem value="pix">PIX</SelectItem>

                                <SelectItem value="dinheiro">Dinheiro</SelectItem>

                                <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>

                                <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>

                                <SelectItem value="transferencia">Transferência Bancária</SelectItem>

                                <SelectItem value="boleto">Boleto</SelectItem>

                            </SelectContent>

                        </Select>

                    </div>



                    <div className="space-y-2">

                        <label className="text-sm font-bold text-zinc-700">Observações Gerais</label>

                        <Input

                            placeholder="Ex: Pagamento referente a pacote familiar"

                            value={formData.observacoes}

                            onChange={e => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}

                            className="h-11 rounded-xl border-zinc-200"

                        />

                    </div>

                </div>

            </div>



            <div className="flex gap-2 justify-end p-8 pt-6 border-t border-zinc-100 bg-zinc-50/30 shrink-0">

                <Button

                    type="button"

                    variant="ghost"

                    onClick={onClose}

                    className="rounded-full px-6 h-11 border-zinc-200 font-bold hover:bg-zinc-50 hover:cursor-pointer"

                >

                    Cancelar

                </Button>

                <Button

                    type="submit"

                    disabled={isSubmitting}

                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 h-11 font-bold shadow-lg shadow-emerald-100 hover:cursor-pointer transition-all"

                >

                    {isSubmitting ? 'Processando...' : 'Confirmar Baixa'}

                </Button>

            </div>

        </form>

    );

};
