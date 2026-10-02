import React, { useEffect } from 'react';
import { History, User, Calendar, FileText, HandHelping, RotateCcw, AlertCircle } from 'lucide-react';
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useInstrumentoHistorico } from '../hooks/useInstrumentoHistorico';
import type { Instrumento } from '@/modules/instrumentos/store/useInstrumentoStore';
import { Badge } from '@/shared/components/ui/badge';

interface InstrumentoHistoricoModalProps {
  instrumento: Instrumento;
}

export const InstrumentoHistoricoModal: React.FC<InstrumentoHistoricoModalProps> = ({ instrumento }) => {
  const { historico, isLoading, fetchHistorico } = useInstrumentoHistorico(instrumento.id);

  useEffect(() => {
    fetchHistorico();
  }, [fetchHistorico]);

  const getAcaoBadge = (acao: string) => {
    switch (acao) {
      case 'emprestimo':
        return <Badge className="bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-50 px-3 rounded-full font-bold transition-all gap-1.5"><HandHelping className="w-3 h-3" /> Empréstimo</Badge>;
      case 'devolucao':
        return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50 px-3 rounded-full font-bold transition-all gap-1.5"><RotateCcw className="w-3 h-3" /> Devolução</Badge>;
      case 'manutencao':
        return <Badge className="bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-50 px-3 rounded-full font-bold transition-all gap-1.5"><AlertCircle className="w-3 h-3" /> Manutenção</Badge>;
      default:
        return <Badge className="bg-zinc-50 text-zinc-600 border-zinc-100 hover:bg-zinc-50 px-3 rounded-full font-bold transition-all gap-1.5">{acao}</Badge>;
    }
  };

  return (
    <DialogContent className="max-w-3xl p-0 overflow-hidden border-none rounded-[32px] shadow-2xl">
      <DialogHeader className=" bg-white shrink-0">
        <DialogTitle className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
            <History className="w-5 h-5 text-white" />
          </div>
          Histórico: <span className="text-indigo-600">{instrumento.nome}</span>
        </DialogTitle>
      </DialogHeader>

      <div className="flex-1 overflow-hidden px-8 pb-8">
        <div className="h-full overflow-y-auto pr-4 custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : historico.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="p-4 bg-zinc-100 rounded-full text-zinc-400 mb-4">
                <History className="w-8 h-8" />
              </div>
              <p className="text-zinc-500 font-medium">Nenhum histórico registrado para este instrumento.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historico.map((item) => (
                <div key={item.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getAcaoBadge(item.acao)}
                      <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(item.data), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider leading-none mb-1">Responsável / Aluno</p>
                        <p className="text-sm font-bold text-zinc-900">{item.aluno?.usuario?.nome || 'Não identificado'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider leading-none mb-1">Observações</p>
                        <p className="text-sm text-zinc-600 leading-tight">{item.observacoes || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DialogContent>
  );
};
