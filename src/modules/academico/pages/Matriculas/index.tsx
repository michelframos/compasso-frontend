import React, { useState, useEffect } from 'react';

import { Plus, GraduationCap, Trash2, Edit, ChevronUp, ChevronDown, ChevronsUpDown, Search, Filter } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

import { Input } from '@/shared/components/ui/input';

import { Card, CardContent } from '@/shared/components/ui/card';

import { useMatriculas } from './hooks/useMatriculas';

import type { Matricula } from './types';

import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog';

import { toast } from 'sonner';

import { getErrorMessage } from '@/shared/lib/utils';

import { useNavigate } from 'react-router-dom';

import { PaginationCustom } from '@/shared/components/ui/pagination-custom';



export const MatriculasPage: React.FC = () => {

  const { matriculas, pagination, isLoading, error, deleteMatricula, fetchMatriculas } = useMatriculas();

  const navigate = useNavigate();

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({

    key: 'id',

    direction: 'desc',

  });

  const [searchTerm, setSearchTerm] = useState('');

  const [statusFilter, setStatusFilter] = useState('');



  // Debounce search and status change

  useEffect(() => {

    const timer = setTimeout(() => {

      fetchMatriculas(1, sortConfig.key, sortConfig.direction, searchTerm, statusFilter);

    }, 500);

    return () => clearTimeout(timer);

  }, [searchTerm, statusFilter, sortConfig.key, sortConfig.direction, fetchMatriculas]);



  const handleOpenCreate = () => {

    navigate('/matriculas/novo');

  };



  const handleOpenEdit = (matricula: Matricula) => {

    navigate(`/matriculas/${matricula.id}`);

  };



  const handleDeleteConfirm = async () => {

    if (!deletingId) return;

    try {

      await deleteMatricula(deletingId);

      toast.success('Matrícula excluída com sucesso!');

    } catch (err: unknown) {

      console.error('Delete error:', err);

      toast.error(getErrorMessage(err, 'Erro ao excluir matrícula.'));

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



  const getStatusBadgeClass = (status: string) => {

    switch (status.toLowerCase()) {

      case 'ativa':

        return 'bg-emerald-100 text-emerald-700';

      case 'pausada':

        return 'bg-amber-100 text-amber-700';

      case 'cancelada':

        return 'bg-rose-100 text-rose-700';

      case 'completada':

        return 'bg-blue-100 text-blue-700';

      case 'transferida':

        return 'bg-indigo-100 text-indigo-700';

      default:

        return 'bg-zinc-100 text-zinc-500';

    }

  };





  const formatDate = (dateString: string) => {

    return new Date(dateString).toLocaleDateString('pt-BR');

  };



  return (

    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col lg:flex-row md:items-center md:items-start md:justify-between gap-3">

        <div>

          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">

            Gestão de <span className="text-indigo-600">Matrículas</span>

          </h1>

          <p className="text-zinc-500 mt-1 text-[14px]">Visualize e gerencie as matrículas dos alunos.</p>

        </div>



        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">

          <div className="relative w-full lg:w-64">

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />

            <Input

              placeholder="Pesquisar por aluno..."

              value={searchTerm}

              onChange={(e) => setSearchTerm(e.target.value)}

              className="pl-9 h-9 rounded-full bg-white border-zinc-200 focus:ring-indigo-500 focus:border-indigo-500 text-sm"

            />

          </div>



          <div className="relative flex items-center w-full lg:w-auto">

            <Filter className="absolute left-3 w-4 h-4 text-zinc-400 pointer-events-none" />

            <select

              value={statusFilter}

              onChange={(e) => setStatusFilter(e.target.value)}

              className="pl-9 pr-4 h-9 rounded-full bg-white border border-zinc-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none appearance-none cursor-pointer text-zinc-600 font-medium min-w-[140px] w-full lg:w-auto"

            >

              <option value="">Todos Status</option>

              <option value="ativa">Ativa</option>

              <option value="pausada">Pausada</option>

              <option value="cancelada">Cancelada</option>

              <option value="completada">Completada</option>

              <option value="transferida">Transferida</option>

            </select>

          </div>



          <Button

            onClick={handleOpenCreate}

            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-9 px-5 gap-2 shadow-lg shadow-indigo-100 font-bold active:scale-95 transition-all text-sm hover:cursor-pointer w-full lg:w-auto"

          >

            <Plus className="w-4 h-4" />

            Nova Matrícula

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

        ) : matriculas.length === 0 ? (

          <Card className="border-dashed border-2 border-zinc-200 shadow-none bg-transparent">

            <CardContent className="flex flex-col items-center justify-center py-12 text-center">

              <div className="p-4 bg-zinc-100 rounded-full text-zinc-400 mb-4">

                <GraduationCap className="w-8 h-8" />

              </div>

              <h3 className="text-lg font-bold text-zinc-900">Nenhuma matrícula encontrada</h3>

              <p className="text-zinc-500 max-w-xs mx-auto mt-1">

                Ajuste os filtros ou crie uma nova matrícula.

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

                        onClick={() => handleSort('aluno.nome')}

                      >

                        <div className="flex items-center">

                          Aluno

                          <SortIcon column="aluno.nome" />

                        </div>

                      </th>

                      <th

                        className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100/50 transition-colors"

                        onClick={() => handleSort('turma.nome')}

                      >

                        <div className="flex items-center">

                          Curso / Turma

                          <SortIcon column="turma.nome" />

                        </div>

                      </th>

                      <th

                        className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100/50 transition-colors"

                        onClick={() => handleSort('data')}

                      >

                        <div className="flex items-center">

                          Data

                          <SortIcon column="data" />

                        </div>

                      </th>

                      <th

                        className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100/50 transition-colors"

                        onClick={() => handleSort('status')}

                      >

                        <div className="flex items-center">

                          Status

                          <SortIcon column="status" />

                        </div>

                      </th>

                      <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider text-right">Ações</th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-zinc-50">

                    {matriculas.map((matricula) => (

                      <tr key={matricula.id} className="hover:bg-zinc-50/50 transition-colors group">

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">

                              {matricula.aluno?.usuario?.nome?.charAt(0).toUpperCase() || '?'}

                            </div>

                            <div>

                              <p className="text-sm font-bold text-zinc-900 leading-none">{matricula.aluno?.usuario?.nome || 'Usuário não vinculado'}</p>

                              <p className="text-[11px] text-zinc-500 mt-1">ID Aluno: #{matricula.id_aluno}</p>

                            </div>

                          </div>

                        </td>

                        <td className="px-6 py-4">

                          <div>

                            {matricula.tipo === 'curso' ? (

                              <>

                                <div className="flex items-center gap-2 mb-1">

                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-violet-100 text-violet-700 border border-violet-200 uppercase tracking-wider">

                                    Curso

                                  </span>

                                </div>

                                <p className="text-sm font-bold text-zinc-900 leading-none">

                                  {matricula.curso?.nome || 'Curso não identificado'}

                                </p>

                                <p className="text-[11px] text-zinc-500 mt-1">

                                  Nível: {matricula.nivel?.nome || '—'} · Prof: {matricula.professor?.usuario?.nome || '—'}

                                </p>

                              </>

                            ) : (

                              <>

                                <div className="flex items-center gap-2 mb-1">

                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase tracking-wider">

                                    Turma

                                  </span>

                                </div>

                                <p className="text-sm font-bold text-zinc-900 leading-none">

                                  {matricula.turma?.curso?.nome || 'Curso não identificado'}

                                </p>

                                <p className="text-[11px] text-zinc-500 mt-1">

                                  Turma #{matricula.id_turma} - {matricula.turma?.nivel?.nome}

                                </p>

                              </>

                            )}

                          </div>

                        </td>

                        <td className="px-6 py-4">

                          <p className="text-sm text-zinc-600">

                            {formatDate(matricula.data)}

                          </p>

                        </td>

                        <td className="px-6 py-4">

                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${getStatusBadgeClass(matricula.status)}`}>

                            {matricula.status}

                          </span>

                        </td>

                        <td className="px-6 py-4 text-right">

                          <div className="flex items-center justify-end gap-2">

                            <Button

                              variant="ghost"

                              size="icon"

                              className="h-8 w-8 rounded-full text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 hover:cursor-pointer"

                              onClick={() => handleOpenEdit(matricula)}

                            >

                              <Edit className="w-4 h-4" />

                            </Button>

                            <Button

                              variant="ghost"

                              size="icon"

                              className="h-8 w-8 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50 hover:cursor-pointer"

                              onClick={() => setDeletingId(matricula.id)}

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

                {matriculas.map((matricula) => (

                  <div key={matricula.id} className="p-5 space-y-4 active:bg-zinc-50 transition-colors">

                    <div className="flex items-center gap-3">

                      <div className="w-11 h-11 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 shrink-0">

                        {matricula.aluno?.usuario?.nome?.charAt(0).toUpperCase() || '?'}

                      </div>

                      <div className="flex-1 min-w-0">

                        <div className="flex items-center gap-2 mb-1">

                          <h3 className="text-[15px] font-bold text-zinc-900 truncate">

                            {matricula.aluno?.usuario?.nome || 'Usuário não vinculado'}

                          </h3>

                        </div>

                        <p className="text-xs text-zinc-500 font-medium tracking-tight">Data: {formatDate(matricula.data)}</p>

                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase shrink-0 ${getStatusBadgeClass(matricula.status)}`}>

                        {matricula.status}

                      </span>

                    </div>



                    <div className="space-y-1.5 px-1 bg-zinc-50/50 p-3 rounded-xl border border-zinc-100">

                        <div className="flex items-center justify-between">

                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">

                            {matricula.tipo === 'curso' ? 'Curso' : 'Turma'}

                          </span>

                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${

                            matricula.tipo === 'curso'

                              ? 'bg-violet-100 text-violet-700 border-violet-200'

                              : 'bg-indigo-100 text-indigo-700 border-indigo-200'

                          }`}>

                            {matricula.tipo === 'curso' ? 'Curso' : `#${matricula.id_turma}`}

                          </span>

                        </div>

                        {matricula.tipo === 'curso' ? (

                          <>

                            <p className="text-sm text-zinc-700 font-bold leading-none">

                              {matricula.curso?.nome || 'Curso não identificado'}

                            </p>

                            <p className="text-[11px] text-zinc-500">

                              Nível: {matricula.nivel?.nome || '—'} · Prof: {matricula.professor?.usuario?.nome || '—'}

                            </p>

                          </>

                        ) : (

                          <>

                            <p className="text-sm text-zinc-700 font-bold leading-none">

                              {matricula.turma?.curso?.nome || 'Curso não identificado'}

                            </p>

                            <p className="text-[11px] text-zinc-500">

                              Nível: {matricula.turma?.nivel?.nome}

                            </p>

                          </>

                        )}

                      </div>



                    <div className="flex items-center justify-end gap-2 pt-1">

                      <Button

                        variant="outline"

                        size="sm"

                        className="h-9 rounded-full border-zinc-200 text-xs font-bold px-4 gap-2 flex-1"

                        onClick={() => handleOpenEdit(matricula)}

                      >

                        <Edit className="w-4 h-4 text-indigo-600" />

                        Ver Detalhes

                      </Button>

                      <Button

                        variant="ghost"

                        size="icon"

                        className="h-9 w-9 rounded-full text-rose-500 hover:bg-rose-50"

                        onClick={() => setDeletingId(matricula.id)}

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



        {pagination && pagination.last_page > 1 && (

          <PaginationCustom

            currentPage={pagination.current_page}

            lastPage={pagination.last_page}

            onPageChange={(page) => fetchMatriculas(page, sortConfig.key, sortConfig.direction, searchTerm, statusFilter)}

            isLoading={isLoading}

          />

        )}

      </div>



      <ConfirmDeleteDialog

        open={!!deletingId}

        onOpenChange={(open) => !open && setDeletingId(null)}

        title={<>Excluir <span className="text-rose-500">Matrícula</span></>}

        description="Esta ação não pode ser desfeita. Isso excluirá permanentemente a matrícula do aluno."

        confirmLabel="Excluir"

        onConfirm={handleDeleteConfirm}

      />

    </div>

  );

};



export default MatriculasPage;
