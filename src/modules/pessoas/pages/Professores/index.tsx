import React, { useState, useEffect } from 'react';
import { Plus, UserRoundPen, Mail, Phone, Trash2, Edit, ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useProfessores } from './hooks/useProfessores';
import type { Professor } from './hooks/useProfessores';
import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/lib/utils';
import { useNavigate } from 'react-router-dom';

export const ProfessoresPage: React.FC = () => {
  const { professores, isLoading, error, deleteProfessor, fetchProfessores } = useProfessores();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'usuarios.nome',
    direction: 'asc',
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProfessores(sortConfig.key, sortConfig.direction, searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, sortConfig.key, sortConfig.direction, fetchProfessores]);

  const handleOpenCreate = () => {
    navigate('/professores/novo');
  };

  const handleOpenEdit = (professor: Professor) => {
    navigate(`/professores/${professor.id}`);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteProfessor(deletingId);
      toast.success('Professor excluído com sucesso!');
    } catch (err: unknown) {
      console.error('Delete error:', err);
      toast.error(getErrorMessage(err, 'Erro ao excluir professor.'));
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row md:items-center md:items-start md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Gestão de <span className="text-indigo-600">Professores</span>
          </h1>
          <p className="text-zinc-500 mt-1 text-[14px]">Visualize e gerencie o corpo docente da sua escola.</p>
        </div>

        <div className="flex flex-col lg:flex-row md:items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full lg:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              placeholder="Pesquisar professores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 rounded-full bg-white border-zinc-200 focus:ring-indigo-500 focus:border-indigo-500 text-sm w-full lg:w-auto"
            />
          </div>
          <Button
            onClick={handleOpenCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-9 px-5 gap-2 shadow-lg shadow-indigo-100 font-bold active:scale-95 transition-all text-sm hover:cursor-pointer w-full lg:w-auto"
          >
            <Plus className="w-4 h-4" />
            Novo Professor
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Listagem */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : professores.length === 0 ? (
          <Card className="border-dashed border-2 border-zinc-200 shadow-none bg-transparent">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-zinc-100 rounded-full text-zinc-400 mb-4">
                <UserRoundPen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">Nenhum professor encontrado</h3>
              <p className="text-zinc-500 max-w-xs mx-auto mt-1">
                Comece cadastrando seu primeiro professor clicando no botão acima.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden border-none shadow-sm bg-white">
            <CardContent className="p-0">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50/50 border-b border-zinc-100">
                      <th
                        className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100/50 transition-colors"
                        onClick={() => handleSort('usuarios.nome')}
                      >
                        <div className="flex items-center">
                          Professor
                          <SortIcon column="usuarios.nome" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100/50 transition-colors"
                        onClick={() => handleSort('usuarios.email')}
                      >
                        <div className="flex items-center">
                          Contato
                          <SortIcon column="usuarios.email" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100/50 transition-colors"
                        onClick={() => handleSort('comissao')}
                      >
                        <div className="flex items-center">
                          Comissão / Salário
                          <SortIcon column="comissao" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {professores.map((professor) => (
                      <tr key={professor.id} className="hover:bg-zinc-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                              {professor.usuario.nome.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-zinc-900 leading-none">{professor.usuario.nome}</p>
                              <p className="text-[11px] text-zinc-500 mt-1">CPF: {professor.usuario.cpf}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-zinc-600">
                              <Mail className="w-3.5 h-3.5" />
                              {professor.usuario.email}
                            </div>
                            {(professor.usuario.whatsapp || professor.usuario.telefone) && (
                              <div className="flex items-center gap-2 text-xs text-zinc-600">
                                <Phone className="w-3.5 h-3.5" />
                                {professor.usuario.whatsapp || professor.usuario.telefone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-bold text-zinc-900 leading-none">
                              {professor.comissao ?? 0}% comissão
                            </p>
                            <p className="text-[11px] text-zinc-500 mt-1">
                              Fixo: R$ {(professor.salario_fixo ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 hover:cursor-pointer"
                              onClick={() => handleOpenEdit(professor)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50 hover:cursor-pointer"
                              onClick={() => setDeletingId(professor.id)}
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

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-zinc-100">
                {professores.map((professor) => (
                  <div key={professor.id} className="p-5 space-y-4 active:bg-zinc-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 shrink-0">
                        {professor.usuario.nome.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[15px] font-bold text-zinc-900 truncate">{professor.usuario.nome}</h3>
                        <p className="text-xs text-zinc-500 font-medium">CPF: {professor.usuario.cpf}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      <div className="flex items-center gap-2.5 text-[13px] text-zinc-600">
                        <div className="w-7 h-7 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400 shrink-0">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">{professor.usuario.email}</span>
                      </div>
                      {(professor.usuario.whatsapp || professor.usuario.telefone) && (
                        <div className="flex items-center gap-2.5 text-[13px] text-zinc-600">
                          <div className="w-7 h-7 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400 shrink-0">
                            <Phone className="w-3.5 h-3.5" />
                          </div>
                          <span>{professor.usuario.whatsapp || professor.usuario.telefone}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tight">Comissão</span>
                        <p className="text-xs font-bold text-indigo-700">{professor.comissao ?? 0}%</p>
                      </div>
                      <div className="text-right space-y-0.5">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tight">Salário Fixo</span>
                        <p className="text-xs font-bold text-indigo-700">R$ {(professor.salario_fixo ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-full border-zinc-200 text-xs font-bold px-4 gap-2 flex-1"
                        onClick={() => handleOpenEdit(professor)}
                      >
                        <Edit className="w-4 h-4 text-indigo-600" />
                        Editar Perfil
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full text-rose-500 hover:bg-rose-50"
                        onClick={() => setDeletingId(professor.id)}
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
        title={<>Excluir <span className="text-rose-500">Professor</span></>}
        description="Esta ação não pode ser desfeita. Isso excluirá permanentemente o professor e removerá seus dados de nossos servidores."
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default ProfessoresPage;
