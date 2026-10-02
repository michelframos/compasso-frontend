import React from 'react';

import { Input } from '@/shared/components/ui/input';

import { Label } from '@/shared/components/ui/label';

import { useContratos } from '@/modules/financeiro';

import { useHasModulo } from '@/shared/hooks/useHasModulo';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

import { Controller } from 'react-hook-form';

import type { UseFormReturn } from 'react-hook-form';

import type { CursoFormValues } from '../hooks/useCursoForm';



interface CursoFormProps {

  form: UseFormReturn<CursoFormValues>;

}



export const CursoForm: React.FC<CursoFormProps> = ({ form }) => {

  const { register, control, formState: { errors } } = form;

  const hasFinanceiro = useHasModulo('financeiro');

  const { contratos, fetchContratos } = useContratos();



  React.useEffect(() => {

    if (hasFinanceiro) fetchContratos(1, 'nome', 'asc');

  }, [fetchContratos, hasFinanceiro]);



  return (

    <div className="flex flex-col w-full flex-1 overflow-hidden">

      <div className="flex flex-col flex-1 overflow-hidden">

        <div className="p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar">

          <div className="space-y-4">

            <div className="space-y-2">

              <Label htmlFor="nome" className={`font-medium ml-1 ${errors.nome ? 'text-rose-500' : 'text-zinc-700'}`}>

                Nome do Curso *

              </Label>

              <Input

                id="nome"

                {...register('nome')}

                placeholder="Ex: Teoria Musical I"

                className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.nome ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}

              />

              {errors.nome && <p className="text-[11px] text-rose-500 ml-1">{errors.nome.message}</p>}

            </div>



            <div className="space-y-2">

              <Label htmlFor="descricao" className="text-zinc-700 font-medium ml-1">Descrição</Label>

              <textarea

                id="descricao"

                {...register('descricao')}

                className="w-full min-h-[120px] p-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-all resize-none text-sm"

                placeholder="Breve descrição sobre o conteúdo do curso..."

              />

            </div>



            {hasFinanceiro && (

            <div className="space-y-2">

              <Label htmlFor="contrato_id" className="text-zinc-700 font-medium ml-1">Contrato Padrão (Opcional)</Label>

              <Controller

                name="contrato_id"

                control={control}

                render={({ field }) => (

                  <Select

                    onValueChange={(value) => field.onChange(value === "none" ? null : value)}

                    value={field.value?.toString() || "none"}

                  >

                    <SelectTrigger className="h-11 rounded-xl border-zinc-200 focus:ring-indigo-600">

                      <SelectValue placeholder="Selecione um contrato padrão" />

                    </SelectTrigger>

                    <SelectContent>

                      <SelectItem value="none">Nenhum (seleção manual na matrícula)</SelectItem>

                      {contratos.map((contrato) => (

                        <SelectItem key={contrato.id} value={contrato.id.toString()}>

                          {contrato.nome}

                        </SelectItem>

                      ))}

                    </SelectContent>

                  </Select>

                )}

              />

              <p className="text-[11px] text-zinc-500 ml-1 italic">

                Este contrato será sugerido automaticamente ao matricular um aluno neste curso.

              </p>

            </div>

            )}

          </div>

        </div>



      </div>

    </div>

  );

};



export default CursoForm;
