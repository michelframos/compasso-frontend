import React, { useEffect, useState } from 'react';
import { Loader2, Music, Users, Star, Clock, ListOrdered } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useApresentacaoForm } from '../hooks/useApresentacaoForm';
import type { Apresentacao } from '../types';
import api from '@/shared/lib/axios';
import { ApresentacaoParticipantes } from './ApresentacaoParticipantes';

interface EspetaculoOption {
  id: number;
  titulo: string;
}

interface TurmaOption {
  id: number;
  descricao: string | null;
  curso: { nome: string };
  nivel: { nome: string };
}

interface ApresentacaoFormProps {
  onClose: () => void;
  onSuccess: () => void;
  apresentacao?: Apresentacao;
  fixedEspetaculoId?: number;
}

export const ApresentacaoForm: React.FC<ApresentacaoFormProps> = ({ onClose, onSuccess, apresentacao, fixedEspetaculoId }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'participantes'>('info');
  const { form, onSubmit, isLoading, isFetchingFullData } = useApresentacaoForm(onSuccess, apresentacao);
  const { register, formState: { errors }, setValue } = form;

  const [espetaculos, setEspetaculos] = useState<EspetaculoOption[]>([]);
  const [turmas, setTurmas] = useState<TurmaOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const isEdit = !!apresentacao;

  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        const [espetaculosRes, turmasRes] = await Promise.all([
          api.get('/espetaculos', { params: { per_page: 100 } }),
          api.get('/turmas', { params: { per_page: 100 } })
        ]);
        setEspetaculos(espetaculosRes.data.data || []);
        setTurmas(turmasRes.data.data || []);
      } catch (error) {
        console.error('Error fetching form options:', error);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    if (fixedEspetaculoId) {
      setValue('id_espetaculo', fixedEspetaculoId);
    }
  }, [fixedEspetaculoId, setValue]);

  if (isFetchingFullData || loadingOptions) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-zinc-500 font-medium">Carregando informações...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full bg-white flex-1 min-h-0">
      {/* Tabs Header - Segue o padrão da tela de turmas */}
      {isEdit && (
        <div className="flex flex-col p-8 pb-0 bg-zinc-50/30 shrink-0 border-b border-zinc-100">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer ${activeTab === 'info'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
            >
              <Music className="w-4 h-4" />
              Informações Básicas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('participantes')}
              className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer ${activeTab === 'participantes'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
                }`}
            >
              <Users className="w-4 h-4" />
              Participantes & Figurinos
            </button>
          </div>
        </div>
      )}

      {activeTab === 'info' ? (
        <form onSubmit={onSubmit} className="flex flex-col flex-1">
          <div className="p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="id_espetaculo" className={`font-medium ml-1 ${errors.id_espetaculo ? 'text-rose-500' : 'text-zinc-700'}`}>
                  Espetáculo *
                </Label>
                <div className="relative">
                  <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <select
                    id="id_espetaculo"
                    {...register('id_espetaculo')}
                    disabled={!!fixedEspetaculoId}
                    className={`flex h-11 w-full pl-10 rounded-xl border bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.id_espetaculo ? 'border-rose-500' : 'border-zinc-200'} ${fixedEspetaculoId ? 'opacity-60 grayscale-[0.5]' : ''}`}
                  >
                    <option value="0">Selecione um espetáculo</option>
                    {espetaculos.map(item => (
                      <option key={item.id} value={item.id}>{item.titulo}</option>
                    ))}
                  </select>
                </div>
                {errors.id_espetaculo && <p className="text-[11px] text-rose-500 ml-1">{errors.id_espetaculo.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="id_turma" className={`font-medium ml-1 ${errors.id_turma ? 'text-rose-500' : 'text-zinc-700'}`}>
                  Turma *
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <select
                    id="id_turma"
                    {...register('id_turma')}
                    className={`flex h-11 w-full pl-10 rounded-xl border bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.id_turma ? 'border-rose-500' : 'border-zinc-200'}`}
                  >
                    <option value="0">Selecione uma turma</option>
                    {turmas.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.descricao || `${item.curso?.nome} - ${item.nivel?.nome}`}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.id_turma && <p className="text-[11px] text-rose-500 ml-1">{errors.id_turma.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="titulo_musica" className={`font-medium ml-1 ${errors.titulo_musica ? 'text-rose-500' : 'text-zinc-700'}`}>
                  Título da Música *
                </Label>
                <div className="relative">
                  <Music className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    id="titulo_musica"
                    {...register('titulo_musica')}
                    placeholder="Ex: O Trenzinho do Caipira"
                    className={`h-11 pl-10 rounded-xl focus-visible:ring-indigo-600 ${errors.titulo_musica ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}
                  />
                </div>
                {errors.titulo_musica && <p className="text-[11px] text-rose-500 ml-1">{errors.titulo_musica.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ordem_entrada" className={`font-medium ml-1 ${errors.ordem_entrada ? 'text-rose-500' : 'text-zinc-700'}`}>
                    Ordem *
                  </Label>
                  <div className="relative">
                    <ListOrdered className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                      id="ordem_entrada"
                      type="number"
                      {...register('ordem_entrada')}
                      className={`h-11 pl-10 rounded-xl focus-visible:ring-indigo-600 ${errors.ordem_entrada ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}
                    />
                  </div>
                  {errors.ordem_entrada && <p className="text-[11px] text-rose-500 ml-1">{errors.ordem_entrada.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duracao_estimada" className={`font-medium ml-1 ${errors.duracao_estimada ? 'text-rose-500' : 'text-zinc-700'}`}>
                    Duração (HH:MM:SS) *
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                      id="duracao_estimada"
                      type="text"
                      {...register('duracao_estimada')}
                      placeholder="00:05:00"
                      className={`h-11 pl-10 rounded-xl focus-visible:ring-indigo-600 ${errors.duracao_estimada ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}
                    />
                  </div>
                  {errors.duracao_estimada && <p className="text-[11px] text-rose-500 ml-1">{errors.duracao_estimada.message}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 border-t border-zinc-100 bg-zinc-50/30 flex flex-col-reverse md:flex-row md:justify-end gap-3 shrink-0 rounded-b-[24px]">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading} className="rounded-full px-6 h-9 font-bold hover:cursor-pointer hover:bg-zinc-100 w-full md:w-auto">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 h-9 font-bold shadow-lg shadow-indigo-100 transition-all hover:cursor-pointer active:scale-95 w-full md:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                apresentacao ? 'Atualizar Dados' : 'Salvar Apresentação'
              )}
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {apresentacao?.id_turma ? (
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <ApresentacaoParticipantes
                  apresentacaoId={apresentacao.id}
                  turmaId={apresentacao.id_turma}
                />
              </div>
          ) : (
            <div className="p-20 text-center">
              <p className="text-zinc-500">Esta apresentação não possui uma turma vinculada.</p>
            </div>
          )}
          <div className="p-8 border-t border-zinc-100 bg-zinc-50/30 flex justify-end shrink-0 rounded-b-[24px]">
            <Button variant="ghost" type="button" onClick={() => setActiveTab('info')} className="rounded-full px-6 h-9 font-bold hover:cursor-pointer hover:bg-zinc-100">
              Voltar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApresentacaoForm;
