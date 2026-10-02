import React, { useEffect } from 'react';

import { Loader2 } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

import { Input } from '@/shared/components/ui/input';

import { Label } from '@/shared/components/ui/label';

import { useContaForm } from '../hooks/useContaForm';

import { useCategoriasContas } from '../hooks/useCategoriasContas';

import { CurrencyInput } from '@/shared/components/ui/currency-input';

import api from '@/shared/lib/axios';

import type { Conta } from '../types';



interface MatriculaOptionsProps {

    idAluno: number;

    currentMatriculaId?: number;

}



const MatriculaOptions: React.FC<MatriculaOptionsProps> = ({ idAluno, currentMatriculaId }) => {

    const [matriculas, setMatriculas] = React.useState<any[]>([]);



    useEffect(() => {

        if (idAluno) {

            api.get(`/alunos/${idAluno}/matriculas`).then(res => {

                // Se a API retornar via Resource, os dados estarão em res.data.data

                const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);

                setMatriculas(data);

            }).catch(() => {

                setMatriculas([]);

            });

        }

    }, [idAluno]);



    return (

        <>

            {Array.isArray(matriculas) && matriculas.map((m: any) => (

                <option key={m.id} value={m.id}>

                    Matrícula #{m.id} - {m.turma?.curso?.nome} {m.status ? `(${m.status})` : ''}

                </option>

            ))}

        </>

    );

};



interface ContaFormProps {

    onClose: () => void;

    onSuccess: (id?: number) => void;

    conta?: Conta;

    tipoFluxo?: 'receita' | 'despesa';

    id_aluno?: number;

    id_matricula?: number;

}



export const ContaForm: React.FC<ContaFormProps> = ({ onClose, onSuccess, conta, tipoFluxo = 'despesa', id_aluno, id_matricula }) => {

    const { form, onSubmit, isLoading } = useContaForm(onSuccess, conta);

    const { register, formState: { errors }, watch, setValue } = form;

    const [listaAlunos, setListaAlunos] = React.useState<any[]>([]);

    const { categorias, fetchCategorias } = useCategoriasContas();



    // Watchers for custom inputs

    const watchTipo = watch('tipo', tipoFluxo);

    const watchValor = watch('valor') || 0;

    const watchAluno = watch('id_aluno');



    useEffect(() => {

        fetchCategorias();

        

        // Busca lista completa e simplificada de alunos

        api.get('/alunos/list').then(response => {

            setListaAlunos(response.data);

            

            // Se houver id_aluno via props, garante que ele seja setado após a lista carregar

            // Usamos um timeout curto ou garantimos que o valor seja setado se a lista existir

            if (!conta && id_aluno) {

                setTimeout(() => {

                    setValue('id_aluno', id_aluno);

                    if (id_matricula) setValue('id_matricula', id_matricula);

                }, 100);

            }

        });



        if (!conta) {

            setValue('tipo', tipoFluxo);

            if (id_matricula) setValue('id_matricula', id_matricula);

        }

    }, [fetchCategorias, setValue, tipoFluxo, conta, id_aluno, id_matricula]);



    // Caso mude o aluno, limpamos a matrícula se ela não pertencer ao novo aluno

    useEffect(() => {

        if (!watchAluno) {

            setValue('id_matricula', null);

        }

    }, [watchAluno, setValue]);



    const categoriasFiltradas = categorias.filter(c => c.tipo === watchTipo);



    return (

        <div className="flex flex-col w-full min-h-0">

            <form

                onSubmit={(e) => {

                    e.stopPropagation();

                    onSubmit(e);

                }}

                className="flex flex-col flex-1 min-h-0"

            >

                <div className="p-8 space-y-8 overflow-y-auto flex-1 h-full">



                    <div className="grid grid-cols-2 gap-4">

                        <div className="space-y-2 col-span-2 sm:col-span-1">

                            <Label htmlFor="tipo" className="font-medium ml-1 text-zinc-700">Tipo de Movimentação *</Label>

                            <select

                                id="tipo"

                                {...register('tipo')}

                                disabled={!!conta} // Não permite alterar tipo editando

                                className={`w-full h-11 rounded-xl border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${errors.tipo ? 'border-rose-500' : 'border-zinc-200'}`}

                            >

                                <option value="receita">Receita (Entrada)</option>

                                <option value="despesa">Despesa (Saída)</option>

                            </select>

                        </div>



                        <div className="space-y-2 col-span-2 sm:col-span-1">

                            <Label htmlFor="id_categoria" className="font-medium ml-1 text-zinc-700">Categoria *</Label>

                            <select

                                id="id_categoria"

                                {...register('id_categoria')}

                                className={`w-full h-11 rounded-xl border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${errors.id_categoria ? 'border-rose-500' : 'border-zinc-200'}`}

                            >

                                <option value="">Selecione...</option>

                                {categoriasFiltradas.map((cat) => (

                                    <option key={cat.id} value={cat.id}>{cat.nome}</option>

                                ))}

                            </select>

                            {errors.id_categoria && <p className="text-[11px] text-rose-500 ml-1">{errors.id_categoria.message as string}</p>}

                        </div>

                    </div>



                    <div className="space-y-2">

                        <Label htmlFor="descricao" className={`font-medium ml-1 ${errors.descricao ? 'text-rose-500' : 'text-zinc-700'}`}>

                            Descrição *

                        </Label>

                        <Input

                            id="descricao"

                            {...register('descricao')}

                            placeholder="Ex: Mensalidade, Compra de Instrumento..."

                            className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.descricao ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}

                        />

                        {errors.descricao && <p className="text-[11px] text-rose-500 ml-1">{errors.descricao.message}</p>}

                    </div>



                    <div className="grid grid-cols-2 gap-4">

                        <div className="space-y-2">

                            <Label htmlFor="valor" className="font-medium ml-1 text-zinc-700">Valor *</Label>

                            <CurrencyInput

                                id="valor"

                                value={Number(watchValor)}

                                onChange={(val) => setValue('valor', val, { shouldValidate: true })}

                                prefix="R$"

                                className={`h-11 rounded-xl focus-visible:ring-indigo-600 border-zinc-200`}

                            />

                            {errors.valor && <p className="text-[11px] text-rose-500 ml-1">{errors.valor.message}</p>}

                        </div>



                        <div className="space-y-2">

                            <Label htmlFor="data_vencimento" className="font-medium ml-1 text-zinc-700">Data de Vencimento *</Label>

                            <Input

                                id="data_vencimento"

                                type="date"

                                {...register('data_vencimento')}

                                className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.data_vencimento ? 'border-rose-500' : 'border-zinc-200'}`}

                            />

                            {errors.data_vencimento && <p className="text-[11px] text-rose-500 ml-1">{errors.data_vencimento.message}</p>}

                        </div>

                    </div>



                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div className="space-y-2">

                            <Label htmlFor="id_aluno" className="font-medium ml-1 text-zinc-700">Vincular a Aluno (Opcional)</Label>

                            <select

                                id="id_aluno"

                                {...register('id_aluno')}

                                className="w-full h-11 rounded-xl border border-zinc-200 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"

                            >

                                <option value="">Nenhum aluno</option>

                                {listaAlunos.map((aluno: any) => (

                                    <option key={aluno.id} value={aluno.id}>

                                        {aluno.nome}

                                    </option>

                                ))}

                            </select>

                        </div>



                        {watchAluno && (

                            <div className="space-y-2">

                                <Label htmlFor="id_matricula" className="font-medium ml-1 text-zinc-700">Vincular a Matrícula (Opcional)</Label>

                                <select

                                    id="id_matricula"

                                    {...register('id_matricula')}

                                    className="w-full h-11 rounded-xl border border-zinc-200 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"

                                >

                                    <option value="">Nenhuma matrícula</option>

                                    {/* Para as matrículas, ainda precisamos do objeto completo do aluno se quisermos listar aqui */}

                                    {/* Ou podemos fazer um fetch das matrículas do aluno específico quando ele for selecionado */}

                                    <MatriculaOptions idAluno={Number(watchAluno)} currentMatriculaId={id_matricula} />

                                </select>

                            </div>

                        )}

                    </div>



                    {!conta && (

                        <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">

                            <div className="space-y-2 col-span-2">

                                <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Opções de Repetição</Label>

                            </div>

                            <div className="space-y-2">

                                <Label htmlFor="repeticao" className="font-medium ml-1 text-zinc-700">Repetir</Label>

                                <select

                                    id="repeticao"

                                    {...register('repeticao')}

                                    className="w-full h-11 rounded-xl border border-zinc-200 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"

                                >

                                    <option value="">Não repetir</option>

                                    <option value="diaria">Diária</option>

                                    <option value="semanal">Semanal</option>

                                    <option value="mensal">Mensal</option>

                                </select>

                            </div>



                            <div className="space-y-2">

                                <Label htmlFor="quantidade_repeticoes" className="font-medium ml-1 text-zinc-700">Número de parcelas</Label>

                                <Input

                                    id="quantidade_repeticoes"

                                    type="number"

                                    min="1"

                                    max="60"

                                    {...register('quantidade_repeticoes', { valueAsNumber: true })}

                                    className={`h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600`}

                                />

                                {errors.quantidade_repeticoes && <p className="text-[11px] text-rose-500 ml-1">{errors.quantidade_repeticoes.message}</p>}

                            </div>

                        </div>

                    )}



                    <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">

                        <input

                            type="checkbox"

                            id="notificar"

                            {...register('notificar')}

                            className="w-5 h-5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"

                        />

                        <div className="space-y-0.5">

                            <Label htmlFor="notificar" className="font-bold text-zinc-900 cursor-pointer">Enviar Notificações?</Label>

                            <p className="text-[11px] text-zinc-500">Se desmarcado, não serão enviados lembretes de WhatsApp para esta conta.</p>

                        </div>

                    </div>



                    <div className="space-y-2">

                        <Label htmlFor="observacoes" className="text-zinc-700 font-medium ml-1">Observações</Label>

                        <textarea

                            id="observacoes"

                            {...register('observacoes')}

                            className="w-full min-h-[100px] p-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-all resize-none text-sm"

                            placeholder="Informações adicionais se necessário..."

                        />

                    </div>



                    {/* Já incluímos o seletor de id_matricula acima se houver aluno */}

                    {!watch('id_aluno') && <input type="hidden" {...register('id_matricula')} />}

                </div>



                {/* Footer */}

                <div className="pb-8 pl-8 pr-8 pt-6 border-t border-zinc-100 bg-zinc-50/30 flex flex-col-reverse md:flex-row md:justify-end gap-3 shrink-0 rounded-b-[24px]">

                    <Button

                        variant="ghost"

                        type="button"

                        onClick={onClose}

                        disabled={isLoading}

                        className="rounded-full px-6 h-9 font-bold hover:cursor-pointer hover:bg-zinc-100 w-full md:w-auto"

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

                            conta ? 'Atualizar Conta' : 'Salvar Conta'

                        )}

                    </Button>

                </div>

            </form>

        </div>

    );

};



export default ContaForm;
