import React, { useEffect } from 'react';

import { Loader2 } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

import { Input } from '@/shared/components/ui/input';

import { Label } from '@/shared/components/ui/label';

import { useCategoriaForm } from '../hooks/useCategoriaForm';

import type { CategoriaConta } from '../types';



interface CategoriaFormProps {

    onClose: () => void;

    onSuccess: () => void;

    categoria?: CategoriaConta;

    tipoFluxo?: 'receita' | 'despesa';

}



export const CategoriaForm: React.FC<CategoriaFormProps> = ({ onClose, onSuccess, categoria, tipoFluxo = 'despesa' }) => {

    const { form, onSubmit, isLoading } = useCategoriaForm(onSuccess, categoria);

    const { register, formState: { errors }, setValue } = form;



    useEffect(() => {

        if (!categoria && tipoFluxo) {

            setValue('tipo', tipoFluxo);

        }

    }, [categoria, tipoFluxo, setValue]);



    return (

        <div className="flex flex-col w-full min-h-0">

            <form

                onSubmit={(e) => {

                    e.stopPropagation();

                    onSubmit(e);

                }}

                className="flex flex-col flex-1 min-h-0"

            >

                <div className="p-8 space-y-6 overflow-y-auto flex-1 h-full">

                    <div className="space-y-2">

                        <Label htmlFor="tipo" className="font-medium ml-1 text-zinc-700">Tipo de Fluxo *</Label>

                        <select

                            id="tipo"

                            {...register('tipo')}

                            className={`w-full h-11 rounded-xl border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${errors.tipo ? 'border-rose-500' : 'border-zinc-200'} bg-zinc-50 cursor-pointer`}

                        >

                            <option value="receita">Receita (Entrada)</option>

                            <option value="despesa">Despesa (Saída)</option>

                        </select>

                         {errors.tipo && <p className="text-[11px] text-rose-500 ml-1">{errors.tipo.message}</p>}

                    </div>



                    <div className="space-y-2">

                        <Label htmlFor="nome" className={`font-medium ml-1 ${errors.nome ? 'text-rose-500' : 'text-zinc-700'}`}>

                            Nome da Categoria *

                        </Label>

                        <Input

                            id="nome"

                            {...register('nome')}

                            placeholder="Ex: Mensalidades, Água, Luz..."

                            className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.nome ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}

                        />

                        {errors.nome && <p className="text-[11px] text-rose-500 ml-1">{errors.nome.message}</p>}

                    </div>



                    <div className="space-y-2">

                        <Label htmlFor="descricao" className="text-zinc-700 font-medium ml-1">Descrição</Label>

                        <textarea

                            id="descricao"

                            {...register('descricao')}

                            className="w-full min-h-[100px] p-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-all resize-none text-sm"

                            placeholder="Descreva sobre esta categoria se necessário..."

                        />

                    </div>

                </div>



                {/* Footer */}

                <div className="pb-8 pl-8 pr-8 pt-6 border-t border-zinc-100 bg-zinc-50/30 flex flex-col-reverse md:flex-row md:justify-end gap-3 shrink-0 rounded-b-[32px]">

                    <Button

                        variant="ghost"

                        type="button"

                        onClick={onClose}

                        disabled={isLoading}

                        className="rounded-full px-6 h-9 font-bold hover:cursor-pointer hover:bg-zinc-100 w-full md:w-auto text-zinc-600"

                    >

                        Cancelar

                    </Button>

                    <Button

                        type="submit"

                        disabled={isLoading}

                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 h-9 font-bold shadow-lg shadow-indigo-100 transition-all hover:cursor-pointer active:scale-95 w-full md:w-auto"

                    >

                        {isLoading ? (

                            <>

                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                                Salvando...

                            </>

                        ) : (

                            categoria ? 'Atualizar' : 'Salvar'

                        )}

                    </Button>

                </div>

            </form>

        </div>

    );

};
