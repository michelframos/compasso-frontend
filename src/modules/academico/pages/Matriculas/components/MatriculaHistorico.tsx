import React, { useEffect } from 'react';
import { History, MoveRight, Calendar, Info, Loader2 } from 'lucide-react';
import { useMatriculaHistorico } from '../hooks/useMatriculaHistorico';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MatriculaHistoricoProps {
  matriculaId: number;
}

export const MatriculaHistorico: React.FC<MatriculaHistoricoProps> = ({ matriculaId }) => {
  const { historico, isLoading, fetchHistorico } = useMatriculaHistorico(matriculaId);

  useEffect(() => {
    fetchHistorico();
  }, [fetchHistorico]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm text-zinc-500 font-medium">Carregando histórico...</p>
      </div>
    );
  }

  if (historico.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 bg-zinc-100 rounded-full text-zinc-400 mb-4">
          <History className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-zinc-900">Sem histórico</h3>
        <p className="text-zinc-500 max-w-xs mx-auto mt-1 text-sm">
          Esta matrícula não possui registros de transferências de turma.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 pl-8 pr-8">
        <History className="w-5 h-5 text-indigo-600" />
        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Histórico de Transferências</h3>
      </div> */}

      <div className="space-y-4 p-8">
        {historico.map((item) => (
          <div
            key={item.id}
            className="p-6 bg-white border border-zinc-100 rounded-2xl shadow-sm hover:shadow-md transition-all group overflow-hidden"
          >
            {/* Header com Data e Motivo */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 border-b border-zinc-50">
              <div className="flex items-center gap-2 text-zinc-500">
                <div className="p-1.5 bg-zinc-100 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-tight">
                  {format(new Date(item.created_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                </span>
              </div>

              {item.motivo && (
                <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100/50">
                  <Info className="w-3 h-3 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-tight">
                    {item.motivo}
                  </span>
                </div>
              )}
            </div>

            {/* Origem e Destino */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
                {/* Turma Origem */}
                <div className="flex-1">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Origem</p>
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 group-hover:border-zinc-200 transition-colors">
                    <p className="text-sm font-bold text-zinc-700">
                      {item.turma_origem?.nome || 'Matrícula Inicial'}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      ID Turma: #{item.id_turma_origem || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center px-1 pt-4">
                  <div className="w-8 h-8 rounded-full border border-zinc-100 flex items-center justify-center bg-white shadow-sm group-hover:border-indigo-100 transition-colors">
                    <MoveRight className="w-4 h-4 text-zinc-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </div>

                {/* Turma Destino */}
                <div className="flex-1">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 ml-1">Destino</p>
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 group-hover:border-indigo-200 transition-colors">
                    <p className="text-sm font-bold text-indigo-900">
                      {item.turma_destino?.nome}
                    </p>
                    <p className="text-[11px] text-indigo-700 mt-0.5">
                      ID Turma: #{item.id_turma_destino}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
