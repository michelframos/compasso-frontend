import React from 'react';

import { Loader2 } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

import { Input } from '@/shared/components/ui/input';

import { Label } from '@/shared/components/ui/label';

import { usePagamentoForm } from '../hooks/usePagamentoForm';

import { CurrencyInput } from '@/shared/components/ui/currency-input';

import type { Conta } from '../types';



interface PagamentoFormProps {

    onClose: () => void;

    onSuccess: () => void;

    conta: Conta;

}



export const PagamentoForm: React.FC<PagamentoFormProps> = ({ onClose, onSuccess, conta }) => {

    const { form, onSubmit, isLoading } = usePagamentoForm(conta, onSuccess);

    const { register, formState: { errors }, watch, setValue } = form;



    const watchValor = watch('valor_pago') || 0;



    return (

        <div className="flex flex-col w-full min-h-0">

            <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0">

                <div className="p-8 space-y-6 flex-1 overflow-y-auto">



                    <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 flex justify-between items-center mb-2">

                        <div>

                            <p className="text-sm font-medium text-zinc-500">Saldo Devedor</p>

                            <p className="text-lg font-bold text-zinc-900">

                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(conta.saldo_devedor)}

                            </p>

                        </div>

                        <div className="text-right">

                            <p className="text-sm font-medium text-zinc-500">Valor Original</p>

                            <p className="text-sm font-semibold text-zinc-700">

                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(conta.valor)}

                            </p>

                        </div>

                    </div>



                    <div className="grid grid-cols-2 gap-4">

                        <div className="space-y-2 col-span-2 sm:col-span-1">

                            <Label htmlFor="valor_pago" className="font-medium ml-1 text-zinc-700">Valor a Pagar *</Label>

                            <CurrencyInput

                                id="valor_pago"

                                value={Number(watchValor)}

                                onChange={(val) => setValue('valor_pago', val, { shouldValidate: true })}

                                prefix="R$"

                                className={`h-11 rounded-xl focus-visible:ring-indigo-600 border-zinc-200`}

                            />

                            {errors.valor_pago && <p className="text-[11px] text-rose-500 ml-1">{errors.valor_pago.message}</p>}

                        </div>



                        <div className="space-y-2 col-span-2 sm:col-span-1">

                            <Label htmlFor="data_pagamento" className="font-medium ml-1 text-zinc-700">Data do Pagamento *</Label>

                            <Input

                                id="data_pagamento"

                                type="date"

                                {...register('data_pagamento')}

                                className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.data_pagamento ? 'border-rose-500' : 'border-zinc-200'}`}

                            />

                            {errors.data_pagamento && <p className="text-[11px] text-rose-500 ml-1">{errors.data_pagamento.message}</p>}

                        </div>

                    </div>



                    <div className="space-y-2">

                        <Label htmlFor="forma_pagamento" className="font-medium ml-1 text-zinc-700">Forma de Pagamento *</Label>

                        <select

                            id="forma_pagamento"

                            {...register('forma_pagamento')}

                            className={`w-full h-11 rounded-xl border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 border-zinc-200 hover:cursor-pointer`}

                        >

                            <option value="PIX">PIX</option>

                            <option value="Dinheiro">Dinheiro</option>

                            <option value="Cartão de Crédito">Cartão de Crédito</option>

                            <option value="Cartão de Débito">Cartão de Débito</option>

                            <option value="Transferência Bancária">Transferência Bancária</option>

                            <option value="Boleto">Boleto</option>

                            <option value="Outro">Outro</option>

                        </select>

                        {errors.forma_pagamento && <p className="text-[11px] text-rose-500 ml-1">{errors.forma_pagamento.message}</p>}

                    </div>



                    <div className="space-y-2">

                        <Label htmlFor="observacoes" className="text-zinc-700 font-medium ml-1">Observações (Opcional)</Label>

                        <textarea

                            id="observacoes"

                            {...register('observacoes')}

                            className="w-full min-h-[100px] p-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-all resize-none text-sm"

                            placeholder="Informações adicionais se necessário..."

                        />

                    </div>

                </div>



                {/* Footer */}

                <div className="p-8 border-t border-zinc-100 bg-zinc-50/30 flex flex-col-reverse md:flex-row md:justify-end gap-3 shrink-0 rounded-b-[24px]">

                    <Button

                        variant="ghost"

                        type="button"

                        onClick={onClose}

                        disabled={isLoading}

                        className="rounded-full px-6 h-9 font-bold hover:cursor-pointer hover:bg-zinc-100"

                    >

                        Cancelar

                    </Button>

                    <Button

                        type="submit"

                        disabled={isLoading}

                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-10 h-9 font-bold shadow-lg shadow-emerald-100 transition-all hover:cursor-pointer active:scale-95"

                    >

                        {isLoading ? (

                            <>

                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                                Processando...

                            </>

                        ) : (

                            'Confirmar Pagamento'

                        )}

                    </Button>

                </div>

            </form>

        </div>

    );

};
