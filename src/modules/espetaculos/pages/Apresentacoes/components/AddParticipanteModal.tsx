import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Search, UserPlus, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/shared/lib/axios';
import { getErrorMessage } from '@/shared/lib/utils';
import type { Aluno } from '@/modules/pessoas'

interface AddParticipanteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (alunoId: number) => Promise<void>;
  participantesAtivosIds: number[];
}

export const AddParticipanteModal: React.FC<AddParticipanteModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  participantesAtivosIds
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingId, setIsAddingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchAlunos = async () => {
      if (!searchTerm || searchTerm.length < 3) {
        setAlunos([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.get('/alunos', { params: { search: searchTerm } });
        setAlunos(response.data.data || []);
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        toast.error(getErrorMessage(error, 'Não foi possível buscar os alunos.'));
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchAlunos, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleAdd = async (alunoId: number) => {
    setIsAddingId(alunoId);
    try {
      await onAdd(alunoId);
      toast.success('Aluno vinculado com sucesso!');
    } catch {
      // erro tratado no hook (onAdd propaga erro se falhar mas a UI principal mostra aviso)
    } finally {
      setIsAddingId(null);
    }
  };

  // Reseta estado ao fechar
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setAlunos([]);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 border-none rounded-[32px] overflow-hidden shadow-2xl bg-white text-zinc-900">
        <DialogHeader className="bg-indigo-50/50 border-b border-indigo-100/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
              <UserPlus className="w-5 h-5" />
            </div>
            <DialogTitle className="text-xl font-black text-zinc-900">Adicionar Participante</DialogTitle>
          </div>
          <DialogDescription className="text-zinc-500 font-medium text-sm">
            Busque por alunos cadastrados para vinculá-los a esta apresentação.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 space-y-6 flex-1 overflow-y-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              autoFocus
              placeholder="Digite o nome ou email do aluno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 bg-zinc-50 border-zinc-200 rounded-2xl text-sm transition-all focus-visible:ring-indigo-600 focus-visible:bg-white"
            />
            {isLoading && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 animate-spin" />
            )}
          </div>

          <div className="bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden">
            <div className="h-[300px] overflow-y-auto">
              {alunos.length > 0 ? (
                <div className="p-2 space-y-1">
                  {alunos.map((aluno) => {
                    const isVinculado = participantesAtivosIds.includes(aluno.id);
                    const isAddingThis = isAddingId === aluno.id;

                    return (
                      <div 
                        key={aluno.id} 
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-zinc-100 hover:shadow-sm"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs uppercase shrink-0">
                            {aluno.usuario?.nome?.substring(0, 2) || 'AL'}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-bold text-zinc-700 truncate">{aluno.usuario?.nome}</span>
                            <span className="text-xs text-zinc-400 truncate">{aluno.usuario?.email}</span>
                          </div>
                        </div>

                        <div className="shrink-0 ml-4">
                          {isVinculado ? (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-100">
                              <Check className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Vinculado</span>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              disabled={isAddingThis}
                              onClick={() => handleAdd(aluno.id)}
                              className="h-8 px-4 text-xs font-bold rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 shadow-sm transition-all hover:cursor-pointer"
                            >
                              {isAddingThis ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                'Adicionar'
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : searchTerm.length >= 3 && !isLoading ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-zinc-500 gap-2">
                  <Search className="w-8 h-8 text-zinc-300" />
                  <p className="text-sm font-medium">Nenhum aluno encontrado.</p>
                  <p className="text-xs text-zinc-400">Tente buscar por outro termo.</p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-zinc-400 gap-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-zinc-300" />
                  </div>
                  <p className="text-xs font-medium">Digite pelo menos 3 caracteres<br/>para iniciar a busca.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
