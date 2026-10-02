import React, { useState, useEffect } from 'react';
import { Plus, Music, Search, Edit, Trash2, HandHelping, RotateCcw, CheckCircle2, AlertCircle, History } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { useInstrumentoStore } from '@/modules/instrumentos/store/useInstrumentoStore';
import type { Instrumento } from '@/modules/instrumentos/store/useInstrumentoStore';
import { InstrumentoForm } from './components/InstrumentoForm';
import { EmprestimoModal } from './components/EmprestimoModal';
import { InstrumentoHistoricoModal } from './components/InstrumentoHistoricoModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog';
import { PaginationCustom } from '@/shared/components/ui/pagination-custom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const InstrumentosPage: React.FC = () => {
  const { instrumentos, pagination, isLoading, fetchInstrumentos, deleteInstrumento, devolverInstrumento } = useInstrumentoStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoanOpen, setIsLoanOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedInstrumento, setSelectedInstrumento] = useState<Instrumento | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<number | undefined>(undefined);

  useEffect(() => {
    fetchInstrumentos();
  }, [fetchInstrumentos]);

  const handleOpenCreate = () => {
    setSelectedInstrumento(undefined);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (instrumento: Instrumento) => {
    setSelectedInstrumento(instrumento);
    setIsFormOpen(true);
  };

  const handleOpenLoan = (instrumento: Instrumento) => {
    setSelectedInstrumento(instrumento);
    setIsLoanOpen(true);
  };

  const handleOpenHistory = (instrumento: Instrumento) => {
    setSelectedInstrumento(instrumento);
    setIsHistoryOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      await deleteInstrumento(deletingId);
      setDeletingId(undefined);
    }
  };

  const handleDevolver = async (id: number) => {
    await devolverInstrumento(id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'disponivel':
        return <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50 px-3 rounded-full font-bold transition-all gap-1.5"><CheckCircle2 className="w-3 h-3" /> Disponível</Badge>;
      case 'emprestado':
        return <Badge className="bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-50 px-3 rounded-full font-bold transition-all gap-1.5"><HandHelping className="w-3 h-3" /> Emprestado</Badge>;
      case 'manutencao':
        return <Badge className="bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-50 px-3 rounded-full font-bold transition-all gap-1.5"><AlertCircle className="w-3 h-3" /> Manutenção</Badge>;
      default:
        return <Badge className="bg-zinc-50 text-zinc-600 border-zinc-100 hover:bg-zinc-50 px-3 rounded-full font-bold transition-all gap-1.5">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row md:items-center md:items-start md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Gestão de <span className="text-indigo-600">Instrumentos</span>
          </h1>
          <p className="text-zinc-500 mt-1 text-[14px]">Controle o inventário e empréstimos de instrumentos.</p>
        </div>

        <div className="flex flex-col lg:flex-row md:items-center gap-3 w-full lg:w-auto">
          <div className="w-full lg:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              placeholder="Pesquisar instrumentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 rounded-full bg-white border-zinc-200 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
          <Button
            onClick={handleOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-9 px-5 gap-2 shadow-lg shadow-indigo-100 font-bold active:scale-95 transition-all text-sm hover:cursor-pointer w-full lg:w-auto"
          >
            <Plus className="w-4 h-4" />
            Novo Instrumento
          </Button>
        </div>
      </div>

      {/* Listagem */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : instrumentos.length === 0 ? (
          <Card className="border-dashed border-2 border-zinc-200 shadow-none bg-transparent">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-zinc-100 rounded-full text-zinc-400 mb-4">
                <Music className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">Nenhum instrumento encontrado</h3>
              <p className="text-zinc-500 max-w-xs mx-auto mt-1">
                Comece cadastrando seu primeiro instrumento para gerenciar empréstimos.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="overflow-hidden border-none shadow-sm bg-white">
              <CardContent className="p-0">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50/50 border-b border-zinc-100">
                        <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider">Instrumento</th>
                        <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider">Vínculo</th>
                        <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {instrumentos.map((inst: Instrumento) => (
                        <tr key={inst.id} className="hover:bg-zinc-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                                <Music className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-zinc-900 leading-none">{inst.nome}</p>
                                <p className="text-[11px] text-zinc-500 mt-1">S/N: {inst.numero_serie || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-600 font-medium">
                            {inst.tipo}
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(inst.status)}
                          </td>
                          <td className="px-6 py-4">
                            {inst.aluno ? (
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-zinc-900">{inst.aluno.usuario?.nome}</span>
                                <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                                  <History className="w-3 h-3" /> 
                                  Desde {inst.data_emprestimo ? format(new Date(inst.data_emprestimo), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-zinc-400 italic">Livre para empréstimo</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {inst.status === 'disponivel' ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 rounded-full text-indigo-600 hover:bg-indigo-50 font-bold px-3 hover:cursor-pointer gap-1.5"
                                  onClick={() => handleOpenLoan(inst)}
                                >
                                  <HandHelping className="w-3.5 h-3.5" />
                                  Emprestar
                                </Button>
                              ) : inst.status === 'emprestado' ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 rounded-full text-emerald-600 hover:bg-emerald-50 font-bold px-3 hover:cursor-pointer gap-1.5"
                                  onClick={() => handleDevolver(inst.id)}
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  Devolver
                                </Button>
                              ) : null}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 hover:cursor-pointer"
                                onClick={() => handleOpenHistory(inst)}
                                title="Histórico"
                              >
                                <History className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 hover:cursor-pointer"
                                onClick={() => handleOpenEdit(inst)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50 hover:cursor-pointer"
                                onClick={() => setDeletingId(inst.id)}
                                disabled={inst.status === 'emprestado'}
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
                <div className="md:hidden divide-y divide-zinc-100">
                  {instrumentos.map((inst: Instrumento) => (
                    <div key={inst.id} className="p-5 space-y-4 active:bg-zinc-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 shrink-0">
                            <Music className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-[15px] font-bold text-zinc-900 truncate tracking-tight">{inst.nome}</h3>
                            <p className="text-[11px] text-zinc-400 font-medium truncate mt-0.5">S/N: {inst.numero_serie || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="shrink-0">
                          {getStatusBadge(inst.status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 bg-zinc-50/50 p-3 rounded-xl border border-zinc-100">
                        <div>
                          <p className="text-[9px] font-black text-zinc-400 uppercase tracking-wider mb-1">Tipo</p>
                          <p className="text-xs font-bold text-zinc-700">{inst.tipo}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-zinc-400 uppercase tracking-wider mb-1">Vínculo</p>
                          {inst.aluno ? (
                            <p className="text-xs font-bold text-zinc-700 truncate">{inst.aluno.usuario?.nome}</p>
                          ) : (
                            <p className="text-xs text-zinc-400 italic">Disponível</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                        {inst.status === 'disponivel' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-9 rounded-full border-indigo-200 text-indigo-600 font-bold uppercase text-[10px] tracking-wider hover:bg-indigo-50 hover:cursor-pointer transition-all"
                            onClick={() => handleOpenLoan(inst)}
                          >
                            <HandHelping className="w-3.5 h-3.5 mr-2" />
                            Emprestar
                          </Button>
                        ) : inst.status === 'emprestado' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-9 rounded-full border-emerald-200 text-emerald-600 font-bold uppercase text-[10px] tracking-wider hover:bg-emerald-50 hover:cursor-pointer transition-all"
                            onClick={() => handleDevolver(inst.id)}
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-2" />
                            Devolver
                          </Button>
                        ) : null}
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 hover:cursor-pointer"
                            onClick={() => handleOpenHistory(inst)}
                          >
                            <History className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 hover:cursor-pointer"
                            onClick={() => handleOpenEdit(inst)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full text-rose-500 hover:bg-rose-50 hover:text-rose-600 hover:cursor-pointer disabled:opacity-30"
                            onClick={() => setDeletingId(inst.id)}
                            disabled={inst.status === 'emprestado'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {pagination && pagination.last_page > 1 && (
              <PaginationCustom
                currentPage={pagination.current_page}
                lastPage={pagination.last_page}
                onPageChange={(page) => fetchInstrumentos(page)}
                isLoading={isLoading}
              />
            )}
          </>
        )}
      </div>

      {/* Form Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl p-0 flex flex-col border-none rounded-[32px] shadow-2xl max-h-[90vh]">
          <DialogHeader className=" bg-white shrink-0">
            <DialogTitle className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
                <Music className="w-5 h-5 text-white" />
              </div>
              {selectedInstrumento ? 'Editar Instrumento' : 'Novo Instrumento'}
            </DialogTitle>
          </DialogHeader>
          <InstrumentoForm 
            onClose={() => setIsFormOpen(false)} 
            onSuccess={() => {
              setIsFormOpen(false);
              fetchInstrumentos();
            }} 
            initialData={selectedInstrumento || undefined}
          />
        </DialogContent>
      </Dialog>

      {/* Loan Modal */}
      <Dialog open={isLoanOpen} onOpenChange={setIsLoanOpen}>
        <DialogContent className="max-w-2xl p-0 flex flex-col border-none rounded-[32px] shadow-2xl max-h-[90vh]">
          <DialogHeader className=" bg-white shrink-0">
            <DialogTitle className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
                <HandHelping className="w-5 h-5 text-white" />
              </div>
              Registrar Empréstimo
            </DialogTitle>
          </DialogHeader>
          {selectedInstrumento && (
            <EmprestimoModal 
              onClose={() => setIsLoanOpen(false)} 
              onSuccess={() => {
                setIsLoanOpen(false);
                fetchInstrumentos();
              }} 
              instrumento={selectedInstrumento}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(undefined)}
        title={<>Excluir <span className="text-rose-500">Instrumento</span></>}
        description="Tem certeza que deseja excluir este instrumento? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
      />
      
      {/* History Modal */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        {selectedInstrumento && (
          <InstrumentoHistoricoModal 
            instrumento={selectedInstrumento}
          />
        )}
      </Dialog>
    </div>
  );
};

export default InstrumentosPage;
