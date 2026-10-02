import React from 'react';
import { Loader2, Music, Info, FileText, Hash } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useInstrumentoForm } from '../hooks/useInstrumentoForm';
import type { Instrumento } from '@/modules/instrumentos/store/useInstrumentoStore';

interface InstrumentoFormProps {
  onClose: () => void;
  onSuccess: (id?: number) => void;
  initialData?: Instrumento;
}

export const InstrumentoForm: React.FC<InstrumentoFormProps> = ({ onClose, onSuccess, initialData }) => {
  const { form, onSubmit, isLoading } = useInstrumentoForm(onSuccess, initialData);
  const { register, formState: { errors } } = form;

  const isEdit = !!initialData;

  return (
    <div className="flex flex-col w-full bg-white">
      <form onSubmit={(e) => { e.stopPropagation(); onSubmit(e); }} className="flex flex-col flex-1">
        <div className="p-8 space-y-8 overflow-y-auto flex-1 h-full">
          
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
              <Music className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Dados do Instrumento</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="nome" className={`font-medium ml-1 ${errors.nome ? 'text-rose-500' : 'text-zinc-700'}`}>
                  Nome *
                </Label>
                <div className="relative">
                  <Input
                    id="nome"
                    {...register('nome')}
                    placeholder="Ex: Violino 4/4, Teclado Casio..."
                    className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.nome ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}
                  />
                  <FileText className="absolute right-3 top-3 w-5 h-5 text-zinc-400" />
                </div>
                {errors.nome && <p className="text-[11px] text-rose-500 ml-1">{errors.nome.message}</p>}
              </div>

              {/* Tipo */}
              <div className="space-y-2">
                <Label htmlFor="tipo" className={`font-medium ml-1 ${errors.tipo ? 'text-rose-500' : 'text-zinc-700'}`}>
                  Tipo/Categoria *
                </Label>
                <Input
                  id="tipo"
                  {...register('tipo')}
                  placeholder="Ex: Cordas, Teclas, Percussão..."
                  className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.tipo ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}
                />
                {errors.tipo && <p className="text-[11px] text-rose-500 ml-1">{errors.tipo.message}</p>}
              </div>

              {/* Número de Série */}
              <div className="space-y-2">
                <Label htmlFor="numero_serie" className="text-zinc-700 font-medium ml-1">Número de Série</Label>
                <div className="relative">
                  <Input
                    id="numero_serie"
                    {...register('numero_serie')}
                    placeholder="Ex: SN123456"
                    className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"
                  />
                  <Hash className="absolute right-3 top-3 w-5 h-5 text-zinc-400" />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-zinc-700 font-medium ml-1">Status Inicial</Label>
                <select
                  id="status"
                  {...register('status')}
                  disabled={isEdit && initialData?.status === 'emprestado'}
                  className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:opacity-70 disabled:bg-zinc-50"
                >
                  <option value="disponivel">Disponível</option>
                  <option value="manutencao">Manutenção</option>
                  <option value="inativo">Inativo</option>
                  {isEdit && initialData?.status === 'emprestado' && (
                    <option value="emprestado">Emprestado</option>
                  )}
                </select>
                {isEdit && initialData?.status === 'emprestado' && (
                  <p className="text-[11px] text-amber-600 ml-1 italic">
                    O status "Emprestado" só pode ser alterado via devolução.
                  </p>
                )}
              </div>
            </div>
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
                placeholder="Detalhes adicionais sobre o estado do instrumento..."
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
              isEdit ? 'Atualizar Instrumento' : 'Cadastrar Instrumento'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
