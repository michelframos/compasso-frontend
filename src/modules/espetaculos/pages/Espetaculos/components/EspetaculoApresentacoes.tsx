import React, { useState, useEffect } from 'react';
import { Music, Plus, Loader2, ListOrdered, Clock, Trash2 } from 'lucide-react';
import type { Espetaculo } from '../types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/shared/components/ui/dialog';
import { ApresentacaoForm } from '../../Apresentacoes/components/ApresentacaoForm';
import { Button } from '@/shared/components/ui/button';
import { useApresentacoes } from '../../Apresentacoes/hooks/useApresentacoes';

interface EspetaculoApresentacoesProps {
  espetaculo: Espetaculo | null;
  isLoading?: boolean;
}

export const EspetaculoApresentacoes: React.FC<EspetaculoApresentacoesProps> = ({ espetaculo, isLoading: isExternalLoading }) => {
  const [isAddingApresentacao, setIsAddingApresentacao] = useState(false);
  const { apresentacoes, isLoading, fetchApresentacoes, deleteApresentacao } = useApresentacoes();

  useEffect(() => {
    if (espetaculo?.id) {
      fetchApresentacoes(undefined, undefined, undefined, 1, espetaculo.id);
    }
  }, [espetaculo?.id, fetchApresentacoes]);

  if (isExternalLoading || (isLoading && apresentacoes.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm text-zinc-500 font-medium">Carregando listagem...</p>
      </div>
    );
  }

  if (!espetaculo) return null;

  const hasApresentacoes = apresentacoes.length > 0;

  return (
    <div className="space-y-6">
      {/* Resumo e Botão Nova Apresentação */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Music className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-indigo-900">Apresentações Vínculadas</h4>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-indigo-600">
                {apresentacoes.length}
              </span>
              <p className="text-[11px] text-indigo-700 font-medium">Total de obras</p>
            </div>
          </div>
        </div>
        
        <Dialog open={isAddingApresentacao} onOpenChange={setIsAddingApresentacao}>
          <DialogTrigger asChild>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 h-9 font-bold shadow-lg shadow-indigo-100 transition-all hover:cursor-pointer active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova Apresentação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-[32px] p-0 border-none shadow-2xl">
            <DialogHeader className=" border-b border-zinc-50">
              <DialogTitle className="flex items-center gap-2 text-xl font-black text-zinc-900">
                <Music className="w-6 h-6 text-indigo-600" />
                Cadastrar <span className="text-indigo-600">Nova Apresentação</span>
              </DialogTitle>
            </DialogHeader>
            <div>
              <ApresentacaoForm 
                fixedEspetaculoId={espetaculo.id}
                onClose={() => setIsAddingApresentacao(false)}
                onSuccess={() => {
                  setIsAddingApresentacao(false);
                  fetchApresentacoes(undefined, undefined, undefined, 1, espetaculo.id);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!hasApresentacoes ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-zinc-100 rounded-full text-zinc-400 mb-4">
            <Music className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">Nenhuma apresentação</h3>
          <p className="text-zinc-500 max-w-xs mx-auto mt-1 text-sm">
            Este espetáculo ainda não possui apresentações cadastradas. Clique no botão acima para adicionar a primeira.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden border border-zinc-100 rounded-2xl bg-white shadow-sm">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Ordem</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Música / Obra</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Turma</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Duração</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {apresentacoes.map((apresentacao) => (
                  <tr key={apresentacao.id} className="hover:bg-zinc-50/30 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-zinc-500">
                      <div className="flex items-center gap-1">
                        <ListOrdered className="w-3 h-3" />
                        {apresentacao.ordem_entrada}º
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-zinc-700 group-hover:text-indigo-600 transition-colors">
                        {apresentacao.titulo_musica}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      {apresentacao.turma?.descricao || apresentacao.turma?.curso?.nome || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {apresentacao.duracao_estimada}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors hover:cursor-pointer"
                          title="Remover apresentação"
                          onClick={async () => {
                            if (confirm('Tem certeza que deseja remover esta apresentação?')) {
                              await deleteApresentacao(apresentacao.id);
                              fetchApresentacoes(undefined, undefined, undefined, 1, espetaculo.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden divide-y divide-zinc-50">
            {apresentacoes.map((apresentacao) => (
              <div key={apresentacao.id} className="p-4 space-y-4 active:bg-zinc-50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-900 tracking-tight">{apresentacao.titulo_musica}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                        {apresentacao.ordem_entrada}º ORDEM
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg shrink-0"
                    onClick={async () => {
                      if (confirm('Tem certeza que deseja remover esta apresentação?')) {
                        await deleteApresentacao(apresentacao.id);
                        fetchApresentacoes(undefined, undefined, undefined, 1, espetaculo.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-2 bg-zinc-50/50 p-3 rounded-xl border border-zinc-100">
                   <div className="flex items-center gap-2 text-xs text-zinc-600">
                     <span className="text-[10px] font-black text-zinc-400 uppercase w-12 tracking-wider">Turma</span>
                     <span className="font-bold text-zinc-800 truncate">{apresentacao.turma?.descricao || 'N/A'}</span>
                   </div>
                   <div className="flex items-center gap-2 text-xs text-zinc-600">
                     <span className="text-[10px] font-black text-zinc-400 uppercase w-12 tracking-wider">Duração</span>
                     <div className="flex items-center gap-1 font-bold text-zinc-800">
                       <Clock className="w-3 h-3 text-indigo-500" />
                       {apresentacao.duracao_estimada}
                     </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
