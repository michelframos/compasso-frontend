import React, { useState, useEffect } from 'react';
import { Plus, Info, Calendar, MapPin, Trash2, Edit, ChevronUp, ChevronDown, ChevronsUpDown, Search, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useEspetaculos } from './hooks/useEspetaculos';
import type { Espetaculo } from './types';
import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '@/shared/lib/utils';

export const EspetaculosPage: React.FC = () => {
  const { espetaculos, isLoading, error, deleteEspetaculo, fetchEspetaculos } = useEspetaculos();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'titulo',
    direction: 'asc',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEspetaculos(sortConfig.key, sortConfig.direction, searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, sortConfig.key, sortConfig.direction, fetchEspetaculos]);

  const handleOpenCreate = () => {
    navigate('/espetaculos/novo');
  };

  const handleOpenEdit = (espetaculo: Espetaculo) => {
    navigate(`/espetaculos/${espetaculo.id}`);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteEspetaculo(deletingId);
      toast.success('Espetáculo excluído com sucesso!');
    } catch (err: unknown) {
      console.error('Delete error:', err);
      toast.error(getErrorMessage(err, 'Erro ao excluir espetáculo.'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig.key !== column) return <ChevronsUpDown className="w-3 h-3 ml-1 opacity-50" />;
    return sortConfig.direction === 'asc' ?
      <ChevronUp className="w-3 h-3 ml-1 text-indigo-600" /> :
      <ChevronDown className="w-3 h-3 ml-1 text-indigo-600" />;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      planejamento: 'bg-zinc-100 text-zinc-600',
      aberto: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      concluido: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      cancelado: 'bg-rose-50 text-rose-600 border-rose-100',
    };
    const labels: Record<string, string> = {
      planejamento: 'Planejamento',
      aberto: 'Aberto',
      concluido: 'Concluído',
      cancelado: 'Cancelado',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[status] || styles.planejamento}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row md:items-center md:items-start md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Gestão de <span className="text-indigo-600">Espetáculos</span>
          </h1>
          <p className="text-zinc-500 mt-1 text-[14px]">Gerencie os festivais e eventos da escola.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              placeholder="Pesquisar espetáculos..."
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
            Novo Espetáculo
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : espetaculos.length === 0 ? (
          <Card className="border-dashed border-2 border-zinc-200 shadow-none bg-transparent">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-zinc-100 rounded-full text-zinc-400 mb-4">
                <Info className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">Nenhum espetáculo encontrado</h3>
              <p className="text-zinc-500 max-w-xs mx-auto mt-1">
                Comece cadastrando seu primeiro espetáculo clicando no botão acima.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden border-none shadow-sm bg-white">
            <CardContent className="p-0">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50/50 border-b border-zinc-100">
                      <th
                        className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100/50 transition-colors"
                        onClick={() => handleSort('titulo')}
                      >
                        <div className="flex items-center">
                          Espetáculo
                          <SortIcon column="titulo" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100/50 transition-colors"
                        onClick={() => handleSort('data_evento')}
                      >
                        <div className="flex items-center">
                          Data e Local
                          <SortIcon column="data_evento" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {espetaculos.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                              {item.titulo.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-zinc-900 leading-none">{item.titulo}</p>
                              <p className="text-[11px] text-zinc-500 mt-1 truncate max-w-[200px]">{item.observacoes || 'Sem observações'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-zinc-600">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(item.data_evento).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-600">
                              <MapPin className="w-3.5 h-3.5" />
                              {item.local}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 hover:cursor-pointer"
                              onClick={() => handleOpenEdit(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50 hover:cursor-pointer"
                              onClick={() => setDeletingId(item.id)}
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
                {espetaculos.map((item) => (
                  <div key={item.id} className="p-5 space-y-4 active:bg-zinc-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 shrink-0 capitalize">
                          {item.titulo.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[15px] font-bold text-zinc-900 truncate tracking-tight">{item.titulo}</h3>
                          <p className="text-[11px] text-zinc-400 font-medium truncate mt-0.5">{item.observacoes || 'Sem observações'}</p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {getStatusBadge(item.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-zinc-50/50 p-3 rounded-xl border border-zinc-100">
                      <div>
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-wider mb-1">Data</p>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          {new Date(item.data_evento).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-wider mb-1">Local</p>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="truncate">{item.local}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-9 rounded-full border-zinc-200 text-zinc-600 font-bold uppercase text-[10px] tracking-wider hover:bg-zinc-50 hover:cursor-pointer transition-all"
                        onClick={() => handleOpenEdit(item)}
                      >
                        <Edit className="w-3.5 h-3.5 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 rounded-full text-rose-500 hover:bg-rose-50 hover:text-rose-600 hover:cursor-pointer transition-all"
                        onClick={() => setDeletingId(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmDeleteDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title={<>Excluir <span className="text-rose-500">Espetáculo</span></>}
        description="Esta ação excluirá permanentemente o espetáculo e todas as apresentações vinculadas a ele. Deseja continuar?"
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default EspetaculosPage;
