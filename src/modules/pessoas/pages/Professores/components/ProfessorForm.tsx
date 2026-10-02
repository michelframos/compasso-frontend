import React, { useState } from 'react';
import { Loader2, UserCircle, GraduationCap } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Controller } from 'react-hook-form';
import { useProfessorForm } from '../hooks/useProfessorForm';
import { CurrencyInput } from '@/shared/components/ui/currency-input';
import type { Professor } from '../hooks/useProfessores';
import { ProfessorTurmas } from './ProfessorTurmas';

interface ProfessorFormProps {
  onClose: () => void;
  onSuccess: () => void;
  professor?: Professor;
}

export const ProfessorForm: React.FC<ProfessorFormProps> = ({ onClose, onSuccess, professor }) => {
  const [activeTab, setActiveTab] = useState<'dados' | 'turmas'>('dados');
  const { form, onSubmit, isLoading, fullProfessorData, isFetchingFullData } = useProfessorForm(onSuccess, professor);
  const { register, control, formState: { errors } } = form;

  const showTabs = !!professor;

  return (
    <div className="flex flex-col w-full">
      {/* Header - Apenas Abas se for Edição */}
      {showTabs && (
        <div className="flex flex-col px-6 pt-4 pb-0 bg-zinc-50/30 shrink-0 border-b border-zinc-100">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            <button
              type="button"
              onClick={() => setActiveTab('dados')}
              className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer whitespace-nowrap ${
                activeTab === 'dados' 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-zinc-400 hover:text-zinc-600'
              }`}
            >
              <UserCircle className="w-4 h-4" />
              Dados Gerais
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('turmas')}
              className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer whitespace-nowrap ${
                activeTab === 'turmas' 
                  ? 'border-indigo-600 text-indigo-600' 
                  : 'border-transparent text-zinc-400 hover:text-zinc-600'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Turmas e Alunos
            </button>
          </div>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={onSubmit} className="flex flex-col flex-1">
        <div className="p-8 space-y-6">
          {activeTab === 'dados' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="nome" className={`font-medium ml-1 ${errors.nome ? 'text-rose-500' : 'text-zinc-700'}`}>
                    Nome Completo *
                  </Label>
                  <Input
                    id="nome"
                    {...register('nome')}
                    placeholder="Ex: João da Silva"
                    className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.nome ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}
                  />
                  {errors.nome && <p className="text-[11px] text-rose-500 ml-1">{errors.nome.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className={`font-medium ml-1 ${errors.email ? 'text-rose-500' : 'text-zinc-700'}`}>
                    E-mail *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="exemplo@email.com"
                    className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.email ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}
                  />
                  {errors.email && <p className="text-[11px] text-rose-500 ml-1">{errors.email.message}</p>}
                </div>

                {!professor && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="password" className={`font-medium ml-1 ${errors.password ? 'text-rose-500' : 'text-zinc-700'}`}>
                        Senha *
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        {...register('password')}
                        placeholder="••••••••"
                        className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.password ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}
                      />
                      {errors.password && <p className="text-[11px] text-rose-500 ml-1">{errors.password.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password_confirmation" className={`font-medium ml-1 ${errors.password_confirmation ? 'text-rose-500' : 'text-zinc-700'}`}>
                        Confirmar Senha *
                      </Label>
                      <Input
                        id="password_confirmation"
                        type="password"
                        {...register('password_confirmation')}
                        placeholder="••••••••"
                        className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.password_confirmation ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}
                      />
                      {errors.password_confirmation && <p className="text-[11px] text-rose-500 ml-1">{errors.password_confirmation.message}</p>}
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="cpf" className={`font-medium ml-1 ${errors.cpf ? 'text-rose-500' : 'text-zinc-700'}`}>
                    CPF *
                  </Label>
                  <Input
                    id="cpf"
                    {...register('cpf')}
                    placeholder="000.000.000-00"
                    className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.cpf ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}
                  />
                  {errors.cpf && <p className="text-[11px] text-rose-500 ml-1">{errors.cpf.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone" className="text-zinc-700 font-medium ml-1">Telefone / WhatsApp</Label>
                  <Input
                    id="telefone"
                    {...register('telefone')}
                    placeholder="(00) 00000-0000"
                    className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Informações Financeiras</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="comissao" className="text-zinc-700 font-medium ml-1">Comissão (%)</Label>
                    <Controller
                      name="comissao"
                      control={control}
                      render={({ field }) => (
                        <CurrencyInput
                professor          id="comissao"
                          value={field.value}
                          onChange={field.onChange}
                          className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salario_fixo" className="text-zinc-700 font-medium ml-1">Salário Fixo (R$)</Label>
                    <Controller
                      name="salario_fixo"
                      control={control}
                      render={({ field }) => (
                        <CurrencyInput
                          id="salario_fixo"
                          value={field.value}
                          onChange={field.onChange}
                          prefix="R$"
                          className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valor_hora_aula" className="text-zinc-700 font-medium ml-1">Valor/Hora (R$)</Label>
                    <Controller
                      name="valor_hora_aula"
                      control={control}
                      render={({ field }) => (
                        <CurrencyInput
                          id="valor_hora_aula"
                          value={field.value}
                          onChange={field.onChange}
                          prefix="R$"
                          className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes" className="text-zinc-700 font-medium ml-1">Observações</Label>
                <textarea
                  id="observacoes"
                  {...register('observacoes')}
                  className="w-full min-h-[100px] p-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-all resize-none text-sm"
                  placeholder="Detalhes adicionais sobre o professor..."
                />
              </div>
            </>
          ) : (
            <ProfessorTurmas 
              turmas={fullProfessorData?.turmas} 
              isLoading={isFetchingFullData} 
            />
          )}
        </div>

        {/* Footer - Fixo na Página conforme padrão premium */}
        <div className="pb-8 pl-8 pr-8 pt-6 border-t border-zinc-100 bg-zinc-50/30 flex flex-col-reverse md:flex-row md:justify-end gap-3 shrink-0 rounded-b-[24px]">
          <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading} className="rounded-full px-6 h-9 font-bold hover:cursor-pointer hover:bg-zinc-100 w-full md:w-auto">
            Cancelar
          </Button>
          {activeTab === 'dados' && (
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 h-9 font-bold shadow-lg shadow-indigo-100 transition-all hover:cursor-pointer active:scale-95 w-full md:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                professor ? 'Atualizar Dados' : 'Salvar Professor'
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfessorForm;
