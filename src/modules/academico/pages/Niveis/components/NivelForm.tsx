import React, { useEffect, useState } from 'react';

import { Loader2 } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

import { Input } from '@/shared/components/ui/input';

import { Label } from '@/shared/components/ui/label';

import { useNivelForm } from '../hooks/useNivelForm';

import type { Nivel } from '../types';

import api from '@/shared/lib/axios';



interface CursoOption {

  id: number;

  nome: string;

}



interface NivelFormProps {

  onClose: () => void;

  onSuccess: (id?: number) => void;

  nivel?: Nivel;

}



export const NivelForm: React.FC<NivelFormProps> = ({ onClose, onSuccess, nivel }) => {

  const { form, onSubmit, isLoading } = useNivelForm(onSuccess, nivel);

  const { register, formState: { errors } } = form;

  const [cursos, setCursos] = useState<CursoOption[]>([]);

  const [loadingOptions, setLoadingOptions] = useState(false);



  useEffect(() => {

    const fetchCursos = async () => {

      setLoadingOptions(true);

      try {

        const res = await api.get('/cursos', { params: { per_page: 100 } });

        setCursos(res.data.data || []);

      } catch (err) {

        console.error('Erro ao buscar cursos:', err);

      } finally {

        setLoadingOptions(false);

      }

    };

    fetchCursos();

  }, []);



  return (

    <div className="flex flex-col w-full overflow-hidden flex-1 min-h-0">

      <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0">

        <div className="p-8 space-y-6 overflow-y-auto">

          <div className="space-y-4">

            <div className="space-y-2">

              <Label htmlFor="nome" className={`font-medium ml-1 ${errors.nome ? 'text-rose-500' : 'text-zinc-700'}`}>

                Nome do Nível *

              </Label>

              <Input

                id="nome"

                {...register('nome')}

                placeholder="Ex: Iniciante 1"

                className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.nome ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}

              />

              {errors.nome && <p className="text-[11px] text-rose-500 ml-1">{errors.nome.message}</p>}

            </div>



            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="space-y-2">

                <Label htmlFor="curso_id" className="text-zinc-700 font-medium ml-1">Curso / Modalidade Opcional</Label>

                <select

                  id="curso_id"

                  {...register('curso_id')}

                  disabled={loadingOptions}

                  className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"

                >

                  <option value="">Nenhum (Nível Genérico)</option>

                  {cursos.map(curso => (

                    <option key={curso.id} value={curso.id}>{curso.nome}</option>

                  ))}

                </select>

              </div>



              <div className="space-y-2">

                <Label htmlFor="ordem" className="text-zinc-700 font-medium ml-1">Ordem Pedagógica</Label>

                <Input

                  id="ordem"

                  type="number"

                  {...register('ordem')}

                  placeholder="Ex: 1"

                  className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"

                />

              </div>



              <div className="space-y-2">

                <Label htmlFor="idade_minima" className={`font-medium ml-1 ${errors.idade_minima ? 'text-rose-500' : 'text-zinc-700'}`}>Idade Mínima</Label>

                <Input

                  id="idade_minima"

                  type="number"

                  {...register('idade_minima')}

                  placeholder="Ex: 3"

                  className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.idade_minima ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}

                />

                {errors.idade_minima && <p className="text-[11px] text-rose-500 ml-1">{errors.idade_minima.message}</p>}

              </div>



              <div className="space-y-2">

                <Label htmlFor="idade_maxima" className={`font-medium ml-1 ${errors.idade_maxima ? 'text-rose-500' : 'text-zinc-700'}`}>Idade Máxima</Label>

                <Input

                  id="idade_maxima"

                  type="number"

                  {...register('idade_maxima')}

                  placeholder="Ex: 6"

                  className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.idade_maxima ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}

                />

                {errors.idade_maxima && <p className="text-[11px] text-rose-500 ml-1">{errors.idade_maxima.message}</p>}

              </div>

            </div>



            <div className="space-y-2">

              <Label htmlFor="cor_identificacao" className="text-zinc-700 font-medium ml-1">Cor de Identificação</Label>

              <div className="flex gap-2 items-center">

                <Input

                  id="cor_identificacao_picker"

                  type="color"

                  {...register('cor_identificacao')}

                  className="w-16 h-11 p-1 rounded-xl cursor-pointer"

                />

                <Input

                  id="cor_identificacao"

                  type="text"

                  {...register('cor_identificacao')}

                  placeholder="#000000"

                  className="h-11 rounded-xl border-zinc-200 flex-1 uppercase"

                />

              </div>

              <p className="text-[11px] text-zinc-400 ml-1 italic">

                Cor que identifica este nível no sistema ou uniforme (opcional).

              </p>

            </div>



            <div className="space-y-2">

              <Label htmlFor="expectativas_aprendizado" className="text-zinc-700 font-medium ml-1">Expectativas de Aprendizado</Label>

              <textarea

                id="expectativas_aprendizado"

                {...register('expectativas_aprendizado')}

                className="w-full min-h-[100px] p-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all resize-y text-sm"

                placeholder="Descreva o que se espera que o aluno aprenda/cumpra após finalizar este nível..."

              />

            </div>



            <div className="space-y-2">

              <Label htmlFor="observacoes" className="text-zinc-700 font-medium ml-1">Observações</Label>

              <textarea

                id="observacoes"

                {...register('observacoes')}

                className="w-full min-h-[120px] p-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-all resize-none text-sm"

                placeholder="Observações adicionais sobre o nível..."

              />

            </div>

          </div>

        </div>



        {/* Footer */}

        <div className="pb-8 pl-8 pr-8 pt-6 border-t border-zinc-100 bg-zinc-50/30 flex flex-col-reverse md:flex-row md:justify-end w-full gap-3 shrink-0 rounded-b-[24px]">

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

            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 h-9 font-bold shadow-lg shadow-indigo-100 transition-all hover:cursor-pointer active:scale-95"

          >

            {isLoading ? (

              <>

                <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                Salvando...

              </>

            ) : (

              nivel ? 'Atualizar Nível' : 'Salvar Nível'

            )}

          </Button>

        </div>

      </form>

    </div>

  );

};



export default NivelForm;
