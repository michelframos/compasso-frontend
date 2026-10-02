import React, { useEffect, useState } from 'react';

import { Loader2, GraduationCap, Info, Wallet, Users, Calendar, Plus, Trash2, Clock } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

import { Input } from '@/shared/components/ui/input';

import { Label } from '@/shared/components/ui/label';

import { Controller, useFieldArray } from 'react-hook-form';

import { useTurmaForm } from '../hooks/useTurmaForm';

import { CurrencyInput } from '@/shared/components/ui/currency-input';

import api from '@/shared/lib/axios';

import type { Turma } from '../types';

import { TurmaAlunos } from './TurmaAlunos';

import { TurmaAgendamentos } from './TurmaAgendamentos';

import { useContratos } from '@/modules/financeiro';

import { useHasModulo } from '@/shared/hooks/useHasModulo';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';





interface CursoOption {

  id: number;

  nome: string;

}



interface NivelOption {

  id: number;

  nome: string;

  curso_id?: number | null;

}



interface ProfessorOption {

  id: number;

  usuario: {

    nome: string;

  };

}



interface TurmaFormProps {

  onClose: () => void;

  onSuccess: () => void;

  turma?: Turma;

}



export const TurmaForm: React.FC<TurmaFormProps> = ({ onClose, onSuccess, turma }) => {

  const [activeTab, setActiveTab] = useState<'geral' | 'alunos' | 'agendamentos'>('geral');

  const { form, onSubmit, isLoading, isLoadingData, fullTurmaData } = useTurmaForm(onSuccess, turma);

  const { register, control, watch, formState: { errors } } = form;

  const hasFinanceiro = useHasModulo('financeiro');

  const { contratos, fetchContratos } = useContratos();



  useEffect(() => {

    if (hasFinanceiro) fetchContratos(1, 'nome', 'asc');

  }, [fetchContratos, hasFinanceiro]);



  const { fields, append, remove } = useFieldArray({

    control,

    name: 'horarios'

  });



  const tipoAgendamento = watch('tipo_agendamento');



  const [cursos, setCursos] = useState<CursoOption[]>([]);

  const [niveis, setNiveis] = useState<NivelOption[]>([]);

  const [professores, setProfessores] = useState<ProfessorOption[]>([]);

  const [loadingOptions, setLoadingOptions] = useState(false);



  const isEdit = !!turma;

  const selectedCursoId = watch('id_curso');

  const selectedCursoIdNumber = selectedCursoId ? Number(selectedCursoId) : null;



  const niveisFiltrados = niveis.filter(nivel => {

    if (!selectedCursoIdNumber) return true; // Mostra tudo se nenhum curso foi escolhido

    return !nivel.curso_id || nivel.curso_id === selectedCursoIdNumber;

  });



  useEffect(() => {

    const fetchOptions = async () => {

      setLoadingOptions(true);

      try {

        const [cursosRes, niveisRes, professoresRes] = await Promise.all([

          api.get('/cursos', { params: { per_page: 100 } }),

          api.get('/niveis', { params: { per_page: 100 } }),

          api.get('/professores', { params: { per_page: 100 } })

        ]);



        setCursos(cursosRes.data.data || []);

        setNiveis(niveisRes.data.data || []);

        setProfessores(professoresRes.data.data || []);

      } catch (error) {

        console.error('Error fetching form options:', error);

      } finally {

        setLoadingOptions(false);

      }

    };



    fetchOptions();

  }, []);



  if (isLoadingData || loadingOptions) {

    return (

      <div className="flex flex-col items-center justify-center py-20 gap-4">

        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />

        <p className="text-zinc-500 font-medium">Carregando informações...</p>

      </div>

    );

  }



  return (

    <div className="flex flex-col bg-white flex-1 overflow-hidden">

      {/* Tabs Header */}

      {isEdit && (

        <div className="flex flex-col px-8 pt-4 pb-0 bg-zinc-50/30 shrink-0 border-b border-zinc-100">

          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">

            <button

              type="button"

              onClick={() => setActiveTab('geral')}

              className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer whitespace-nowrap ${activeTab === 'geral'

                  ? 'border-indigo-600 text-indigo-600'

                  : 'border-transparent text-zinc-400 hover:text-zinc-600'

                }`}

            >

              <Info className="w-4 h-4" />

              Informações Gerais

            </button>

            <button

              type="button"

              onClick={() => setActiveTab('alunos')}

              className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer whitespace-nowrap ${activeTab === 'alunos'

                  ? 'border-indigo-600 text-indigo-600'

                  : 'border-transparent text-zinc-400 hover:text-zinc-600'

                }`}

            >

              <Users className="w-4 h-4" />

              Alunos na Turma

            </button>

            <button

              type="button"

              onClick={() => setActiveTab('agendamentos')}

              className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer whitespace-nowrap ${activeTab === 'agendamentos'

                  ? 'border-indigo-600 text-indigo-600'

                  : 'border-transparent text-zinc-400 hover:text-zinc-600'

                }`}

            >

              <Calendar className="w-4 h-4" />

              Agendamentos

            </button>

          </div>

        </div>

      )}



      <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">

        <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">



          {activeTab === 'geral' ? (

            <>

              {/* Seção Dados Básicos */}

              <div className="space-y-6">

                <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">

                  <GraduationCap className="w-5 h-5 text-indigo-600" />

                  <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Dados da Turma</h3>

                </div>



                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                  <div className="space-y-2">

                    <Label htmlFor="id_curso" className={`font-medium ml-1 ${errors.id_curso ? 'text-rose-500' : 'text-zinc-700'}`}>

                      Curso *

                    </Label>

                    <select

                      id="id_curso"

                      {...register('id_curso')}

                      className={`flex h-11 w-full rounded-xl border bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.id_curso ? 'border-rose-500' : 'border-zinc-200'}`}

                    >

                      <option value="">Selecione um curso</option>

                      {cursos.map(curso => (

                        <option key={curso.id} value={curso.id}>{curso.nome}</option>

                      ))}

                    </select>

                    {errors.id_curso && <p className="text-[11px] text-rose-500 ml-1">{errors.id_curso.message}</p>}

                  </div>



                  <div className="space-y-2">

                    <Label htmlFor="id_nivel" className={`font-medium ml-1 ${errors.id_nivel ? 'text-rose-500' : 'text-zinc-700'}`}>

                      Nível *

                    </Label>

                    <select

                      id="id_nivel"

                      {...register('id_nivel')}

                      className={`flex h-11 w-full rounded-xl border bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.id_nivel ? 'border-rose-500' : 'border-zinc-200'}`}

                    >

                      <option value="">Selecione um nível</option>

                      {niveisFiltrados.map(nivel => (

                        <option key={nivel.id} value={nivel.id}>{nivel.nome}</option>

                      ))}

                    </select>

                    {errors.id_nivel && <p className="text-[11px] text-rose-500 ml-1">{errors.id_nivel.message}</p>}

                  </div>



                  <div className="space-y-2">

                    <Label htmlFor="id_professor" className="text-zinc-700 font-medium ml-1">Professor</Label>

                    <select

                      id="id_professor"

                      {...register('id_professor')}

                      className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"

                    >

                      <option value="">Nenhum professor vinculado</option>

                      {professores.map(prof => (

                        <option key={prof.id} value={prof.id}>{prof.usuario?.nome}</option>

                      ))}

                    </select>

                  </div>



                  <div className="space-y-2">

                    <Label htmlFor="maximo_alunos" className={`font-medium ml-1 ${errors.maximo_alunos ? 'text-rose-500' : 'text-zinc-700'}`}>

                      Máximo de Alunos *

                    </Label>

                    <Input

                      id="maximo_alunos"

                      type="number"

                      {...register('maximo_alunos')}

                      className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.maximo_alunos ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}

                    />

                    {errors.maximo_alunos && <p className="text-[11px] text-rose-500 ml-1">{errors.maximo_alunos.message}</p>}

                  </div>



                  <div className="space-y-2">

                    <Label htmlFor="status" className="text-zinc-700 font-medium ml-1">Status</Label>

                    <select

                      id="status"

                      {...register('status')}

                      className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"

                    >

                      <option value="planejamento">Planejamento</option>

                      <option value="aberta">Aberta</option>

                      <option value="em_andamento">Em Andamento</option>

                      <option value="pausada">Pausada</option>

                      <option value="concluida">Concluída</option>

                      <option value="cancelada">Cancelada</option>

                    </select>

                  </div>



                  <div className="space-y-2">

                    <Label htmlFor="descricao" className="text-zinc-700 font-medium ml-1">Descrição Curta</Label>

                    <Input

                      id="descricao"

                      {...register('descricao')}

                      placeholder="Ex: Turma A - Sábado"

                      className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"

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

                    <p className="text-[11px] text-zinc-400 ml-1 italic">

                      Este contrato será priorizado sobre o contrato do curso ao matricular um aluno nesta turma.

                    </p>

                  </div>

                  )}

                </div>

              </div>



              {/* Seção Agendamento */}

              <div className="space-y-6">

                <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">

                  <Calendar className="w-5 h-5 text-indigo-600" />

                  <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Período e Agendamento</h3>

                </div>



                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                  <div className="space-y-2">

                    <Label htmlFor="tipo_agendamento" className="text-zinc-700 font-medium ml-1">Modalidade de Agendamento</Label>

                    <select

                      id="tipo_agendamento"

                      {...register('tipo_agendamento')}

                      className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"

                    >

                      <option value="datas">Por Período (Datas)</option>

                      <option value="quantidade">Por Quantidade de Aulas</option>

                    </select>

                  </div>



                  <div className="space-y-2">

                    <Label htmlFor="data_inicio" className={`font-medium ml-1 ${errors.data_inicio ? 'text-rose-500' : 'text-zinc-700'}`}>

                      Data de Início *

                    </Label>

                    <Input

                      id="data_inicio"

                      type="date"

                      {...register('data_inicio')}

                      className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.data_inicio ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}

                    />

                    {errors.data_inicio && <p className="text-[11px] text-rose-500 ml-1">{errors.data_inicio.message}</p>}

                  </div>



                  {tipoAgendamento === 'datas' ? (

                    <div className="space-y-2">

                      <Label htmlFor="data_fim" className={`font-medium ml-1 ${errors.data_fim ? 'text-rose-500' : 'text-zinc-700'}`}>

                        Data de Término *

                      </Label>

                      <Input

                        id="data_fim"

                        type="date"

                        {...register('data_fim')}

                        className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.data_fim ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}

                      />

                      {errors.data_fim && <p className="text-[11px] text-rose-500 ml-1">{errors.data_fim.message}</p>}

                    </div>

                  ) : (

                    <div className="space-y-2">

                      <Label htmlFor="quantidade_aulas" className={`font-medium ml-1 ${errors.quantidade_aulas ? 'text-rose-500' : 'text-zinc-700'}`}>

                        Total de Aulas *

                      </Label>

                      <Input

                        id="quantidade_aulas"

                        type="number"

                        {...register('quantidade_aulas')}

                        className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.quantidade_aulas ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}

                      />

                      {errors.quantidade_aulas && <p className="text-[11px] text-rose-500 ml-1">{errors.quantidade_aulas.message}</p>}

                    </div>

                  )}

                </div>

              </div>



              {/* Seção Horários */}

              <div className="space-y-6">

                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">

                  <div className="flex items-center gap-2">

                    <Clock className="w-5 h-5 text-indigo-600" />

                    <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Horários da Turma</h3>

                  </div>

                  <Button

                    type="button"

                    variant="outline"

                    size="sm"

                    onClick={() => append({ dia_semana: 'segunda', hora_inicio: '14:00', hora_termino: '15:00' })}

                    className="rounded-full h-8 text-xs font-bold gap-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:cursor-pointer transition-all"

                  >

                    <Plus className="w-3 h-3" />

                    Adicionar Horário

                  </Button>

                </div>



                <div className="space-y-4">

                  {fields.length === 0 ? (

                    <div className="py-8 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">

                      <p className="text-zinc-400 text-sm">Nenhum horário definido. As aulas não serão geradas.</p>

                    </div>

                  ) : (

                    <div className="grid grid-cols-1 gap-4">

                      {fields.map((field, index) => (

                        <div key={field.id} className="flex flex-col md:flex-row items-end gap-4 p-4 bg-zinc-50/50 rounded-2xl border border-zinc-100 relative group transition-all hover:bg-zinc-50">

                          <div className="flex-1 space-y-2 w-full">

                            <Label className={`text-[11px] font-bold ml-1 uppercase tracking-tight ${errors.horarios?.[index]?.dia_semana ? 'text-rose-500' : 'text-zinc-400'}`}>Dia da Semana</Label>

                            <select

                              {...register(`horarios.${index}.dia_semana` as const)}

                              className={`flex h-10 w-full rounded-xl border bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${errors.horarios?.[index]?.dia_semana ? 'border-rose-500' : 'border-zinc-200'}`}

                            >

                              <option value="segunda">Segunda-feira</option>

                              <option value="terca">Terça-feira</option>

                              <option value="quarta">Quarta-feira</option>

                              <option value="quinta">Quinta-feira</option>

                              <option value="sexta">Sexta-feira</option>

                              <option value="sabado">Sábado</option>

                              <option value="domingo">Domingo</option>

                            </select>

                            {errors.horarios?.[index]?.dia_semana && <p className="text-[11px] text-rose-500 ml-1">{errors.horarios[index]?.dia_semana?.message}</p>}

                          </div>

                          <div className="flex-1 space-y-2 w-full">

                            <Label className={`text-[11px] font-bold ml-1 uppercase tracking-tight ${errors.horarios?.[index]?.hora_inicio ? 'text-rose-500' : 'text-zinc-400'}`}>Início</Label>

                            <Input

                              type="time"

                              {...register(`horarios.${index}.hora_inicio` as const)}

                              className={`h-10 rounded-xl focus-visible:ring-indigo-600 ${errors.horarios?.[index]?.hora_inicio ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}

                            />

                            {errors.horarios?.[index]?.hora_inicio && <p className="text-[11px] text-rose-500 ml-1">{errors.horarios[index]?.hora_inicio?.message}</p>}

                          </div>

                          <div className="flex-1 space-y-2 w-full">

                            <Label className={`text-[11px] font-bold ml-1 uppercase tracking-tight ${errors.horarios?.[index]?.hora_termino ? 'text-rose-500' : 'text-zinc-400'}`}>Término</Label>

                            <Input

                              type="time"

                              {...register(`horarios.${index}.hora_termino` as const)}

                              className={`h-10 rounded-xl focus-visible:ring-indigo-600 ${errors.horarios?.[index]?.hora_termino ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}

                            />

                            {errors.horarios?.[index]?.hora_termino && <p className="text-[11px] text-rose-500 ml-1">{errors.horarios[index]?.hora_termino?.message}</p>}

                          </div>

                          <Button

                            type="button"

                            variant="ghost"

                            size="icon"

                            onClick={() => remove(index)}

                            className="h-10 w-10 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl shrink-0 hover:cursor-pointer"

                          >

                            <Trash2 className="w-4 h-4" />

                          </Button>

                        </div>

                      ))}

                    </div>

                  )}

                </div>

                <p className="text-[11px] text-zinc-400 ml-1">

                  * As aulas serão geradas automaticamente no calendário com base nestes horários e no período da turma.

                </p>

              </div>



              {/* Seção Financeira */}

              <div className="space-y-6">

                <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">

                  <Wallet className="w-5 h-5 text-indigo-600" />

                  <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Configurações Financeiras Exclusivas</h3>

                </div>



                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  <div className="space-y-2">

                    <Label htmlFor="valor_mensalidade" className="text-zinc-700 font-medium ml-1">Mensalidade (R$)</Label>

                    <Controller

                      name="valor_mensalidade"

                      control={control}

                      render={({ field }) => (

                        <CurrencyInput

                          id="valor_mensalidade"

                          value={field.value || 0}

                          onChange={field.onChange}

                          prefix="R$"

                          className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"

                        />

                      )}

                    />

                  </div>



                  <div className="space-y-2">

                    <Label htmlFor="percentual_comissao_especifico" className="text-zinc-700 font-medium ml-1">Comissão Específica (%)</Label>

                    <Controller

                      name="percentual_comissao_especifico"

                      control={control}

                      render={({ field }) => (

                        <CurrencyInput

                          id="percentual_comissao_especifico"

                          value={field.value || 0}

                          onChange={field.onChange}

                          className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"

                        />

                      )}

                    />

                  </div>



                  <div className="space-y-2">

                    <Label htmlFor="valor_hora_aula_especifico" className="text-zinc-700 font-medium ml-1">Valor/Hora Específico (R$)</Label>

                    <Controller

                      name="valor_hora_aula_especifico"

                      control={control}

                      render={({ field }) => (

                        <CurrencyInput

                          id="valor_hora_aula_especifico"

                          value={field.value || 0}

                          onChange={field.onChange}

                          prefix="R$"

                          className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"

                        />

                      )}

                    />

                  </div>

                </div>

                <p className="text-[12px] text-zinc-400 italic">

                  * Se deixado como 0 ou em branco, o sistema utilizará os valores padrão do curso ou do contrato do professor.

                </p>

              </div>



              {/* Seção Observações */}

              <div className="space-y-6">

                <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">

                  <Info className="w-5 h-5 text-indigo-600" />

                  <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Observações</h3>

                </div>

                <div className="space-y-2">

                  <textarea

                    id="observacoes"

                    {...register('observacoes')}

                    className="w-full min-h-[100px] p-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-all resize-none text-sm"

                    placeholder="Detalhes internos sobre a turma, horários desejados, etc..."

                  />

                </div>

              </div>

            </>

          ) : activeTab === 'alunos' ? (

            <TurmaAlunos

              turma={fullTurmaData}

              isLoading={isLoadingData}

              onRefresh={() => {

                // Forçamos o recarregamento dos dados no hook

                if (turma?.id) {

                  const event = new CustomEvent('refreshTurmaData');

                  window.dispatchEvent(event);

                }

              }}

            />

          ) : activeTab === 'agendamentos' ? (

            <TurmaAgendamentos 

              turmaId={turma?.id} 

              professorId={fullTurmaData?.id_professor || undefined}

            />

          ) : null}





        </div>



        {/* Footer */}

        <div className="pb-8 pl-8 pr-8 pt-6 border-t border-zinc-100 bg-zinc-50/30 flex flex-col-reverse md:flex-row md:justify-end w-full gap-3 shrink-0 rounded-b-[24px] mt-auto">

          <Button

            variant="ghost"

            type="button"

            onClick={onClose}

            disabled={isLoading}

            className="rounded-full px-6 h-9 font-bold hover:cursor-pointer hover:bg-zinc-100"

          >

            {activeTab === 'geral' ? 'Cancelar' : 'Voltar'}

          </Button>

          {activeTab === 'geral' && (

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

                turma ? 'Atualizar Turma' : 'Salvar Turma'

              )}

            </Button>

          )}

        </div>

      </form>

    </div>

  );

};





export default TurmaForm;
