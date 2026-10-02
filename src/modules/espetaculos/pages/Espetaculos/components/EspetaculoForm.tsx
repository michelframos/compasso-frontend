import React, { useState } from 'react';
import { Loader2, Calendar, MapPin, Info, Music, FileText } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useEspetaculoForm } from '../hooks/useEspetaculoForm';
import { useContratos } from '@/modules/financeiro';
import type { Espetaculo } from '../types';
import { EspetaculoApresentacoes } from './EspetaculoApresentacoes';
import { useHasModulo } from '@/shared/hooks/useHasModulo';

interface EspetaculoFormProps {
  onClose: () => void;
  onSuccess: () => void;
  espetaculo?: Espetaculo;
}

export const EspetaculoForm: React.FC<EspetaculoFormProps> = ({ onClose, onSuccess, espetaculo }) => {
  const hasFinanceiro = useHasModulo('financeiro');
  const [activeTab, setActiveTab] = useState<'dados' | 'apresentacoes'>('dados');
  const { form, onSubmit, isLoading, isFetchingFullData } = useEspetaculoForm(onSuccess, espetaculo);
  const { contratos } = useContratos();
  const { register, formState: { errors } } = form;

  const showTabs = !!espetaculo;

  if (isFetchingFullData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-zinc-500 font-medium">Carregando informações...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full bg-white">
      {/* Header - Tabs */}
      {showTabs && (
        <div className="flex flex-col px-8 pt-4 pb-0 bg-zinc-50/30 shrink-0 border-b border-zinc-100">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('dados')}
              className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer ${activeTab === 'dados'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
            >
              <Info className="w-4 h-4" />
              Dados Gerais
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('apresentacoes')}
              className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer ${activeTab === 'apresentacoes'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
            >
              <Music className="w-4 h-4" />
              Apresentações
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col">
        {activeTab === 'dados' ? (
          <form onSubmit={onSubmit} className="flex flex-col flex-1">
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="titulo" className={`font-medium ml-1 ${errors.titulo ? 'text-rose-500' : 'text-zinc-700'}`}>
                    Título do Espetáculo *
                  </Label>
                  <div className="relative">
                    <Info className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                      id="titulo"
                      {...register('titulo')}
                      placeholder="Ex: Festival de Inverno 2024"
                      className={`h-11 pl-10 rounded-xl focus-visible:ring-indigo-600 ${errors.titulo ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}
                    />
                  </div>
                  {errors.titulo && <p className="text-[11px] text-rose-500 ml-1">{errors.titulo.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className={`font-medium ml-1 ${errors.status ? 'text-rose-500' : 'text-zinc-700'}`}>
                    Status *
                  </Label>
                  <select
                    id="status"
                    {...register('status')}
                    className={`flex h-11 w-full rounded-xl border bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.status ? 'border-rose-500' : 'border-zinc-200'}`}
                  >
                    <option value="planejamento">Planejamento</option>
                    <option value="aberto">Aberto</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                  {errors.status && <p className="text-[11px] text-rose-500 ml-1">{errors.status.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_evento" className={`font-medium ml-1 ${errors.data_evento ? 'text-rose-500' : 'text-zinc-700'}`}>
                    Data do Evento *
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                      id="data_evento"
                      type="date"
                      {...register('data_evento')}
                      className={`h-11 pl-10 rounded-xl focus-visible:ring-indigo-600 ${errors.data_evento ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}
                    />
                  </div>
                  {errors.data_evento && <p className="text-[11px] text-rose-500 ml-1">{errors.data_evento.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="local" className={`font-medium ml-1 ${errors.local ? 'text-rose-500' : 'text-zinc-700'}`}>
                    Local *
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                      id="local"
                      {...register('local')}
                      placeholder="Ex: Teatro Municipal"
                      className={`h-11 pl-10 rounded-xl focus-visible:ring-indigo-600 ${errors.local ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}
                    />
                  </div>
                  {errors.local && <p className="text-[11px] text-rose-500 ml-1">{errors.local.message}</p>}
                </div>

                {hasFinanceiro && (
                <div className="space-y-2">
                  <Label htmlFor="contrato_id" className={`font-medium ml-1 ${errors.contrato_id ? 'text-rose-500' : 'text-zinc-700'}`}>
                    Contrato Padrão
                  </Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <select
                      id="contrato_id"
                      {...register('contrato_id', { valueAsNumber: true })}
                      className={`flex h-11 w-full rounded-xl border bg-white pl-10 pr-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.contrato_id ? 'border-rose-500' : 'border-zinc-200'}`}
                    >
                      <option value="">Nenhum Contrato Vínculado</option>
                      {contratos.map(c => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                      ))}
                    </select>
                  </div>
                  {errors.contrato_id && <p className="text-[11px] text-rose-500 ml-1">{errors.contrato_id.message}</p>}
                </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes" className="text-zinc-700 font-medium ml-1">Observações</Label>
                <textarea
                  id="observacoes"
                  {...register('observacoes')}
                  className="w-full min-h-[100px] p-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-all resize-none text-sm"
                  placeholder="Detalhes adicionais sobre o espetáculo..."
                />
              </div>
            </div>

            <div className="pb-8 pl-8 pr-8 pt-6 border-t border-zinc-100 bg-zinc-50/30 flex flex-col-reverse md:flex-row md:justify-end gap-3 shrink-0 rounded-b-[24px]">
              <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading} className="rounded-full px-6 h-9 font-bold hover:cursor-pointer hover:bg-zinc-100">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 h-9 font-bold shadow-lg shadow-indigo-100 transition-all hover:cursor-pointer active:scale-95">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  espetaculo ? 'Atualizar Dados' : 'Salvar Espetáculo'
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-8 space-y-6">
            <EspetaculoApresentacoes
              espetaculo={espetaculo || null}
              isLoading={isFetchingFullData}
            />
            {/* Footer específico para as outras abas */}
            <div className="pt-6 border-t border-zinc-100 flex justify-end gap-3">
              <Button variant="ghost" type="button" onClick={onClose} className="rounded-full px-6 h-9 font-bold hover:cursor-pointer hover:bg-zinc-100">
                Fechar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EspetaculoForm;
