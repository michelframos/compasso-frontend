import React, { useState, useEffect } from 'react';

import { Plus, GraduationCap, Trash2, Edit, Search, ChevronUp, ChevronDown, ChevronsUpDown, RefreshCw, Loader2, Info, Users, Clock, History as HistoryIcon, UserPlus, Calendar as CalendarIcon } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

import { Input } from '@/shared/components/ui/input';

import { Card, CardContent } from '@/shared/components/ui/card';

import { useTurmas } from './hooks/useTurmas';

import { useNavigate } from 'react-router-dom';

import { toast } from 'sonner';

import { getErrorMessage } from '@/shared/lib/utils';

import { MatriculaHistorico } from '../Matriculas/components/MatriculaHistorico';

import { MatriculaForm } from '../Matriculas/components/MatriculaForm';

import { AulaModal } from './components/AulaModal';

import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog';

import {

  Dialog,

  DialogContent,

  DialogDescription,

  DialogFooter,

  DialogHeader,

  DialogTitle,

  DialogTrigger,

} from "@/components/ui/dialog";

import { Label } from '@/shared/components/ui/label';

import { PaginationCustom } from '@/shared/components/ui/pagination-custom';

import type { Turma, TurmaStatus } from './types';



export const TurmasPage: React.FC = () => {

  const { turmas, pagination, isLoading, error, fetchTurmas, fetchTurma, deleteTurma, updateTurmaStatus } = useTurmas();

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');

  const [statusFilter, setStatusFilter] = useState<string>('');

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [statusTurmaId, setStatusTurmaId] = useState<number | null>(null);

  const [matriculaTurmaId, setMatriculaTurmaId] = useState<number | null>(null);

  const [agendarAulaTurmaId, setAgendarAulaTurmaId] = useState<number | null>(null);

  const [infoTurma, setInfoTurma] = useState<Turma | null>(null);

  const [loadingInfo, setLoadingInfo] = useState(false);

  const [newStatus, setNewStatus] = useState<TurmaStatus | ''>('');

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({

    key: 'id',

    direction: 'desc',

  });



  // Debounce search

  useEffect(() => {

    const timer = setTimeout(() => {

      fetchTurmas(1, sortConfig.key, sortConfig.direction, searchTerm, statusFilter);

    }, 500);

    return () => clearTimeout(timer);

  }, [searchTerm, statusFilter, sortConfig.key, sortConfig.direction, fetchTurmas]);



  const handleOpenCreate = () => {

    navigate('/turmas/novo');

  };



  const handleOpenEdit = (id: number) => {

    navigate(`/turmas/${id}`);

  };



  const handleOpenStatus = (id: number, status: TurmaStatus) => {

    setStatusTurmaId(id);

    setNewStatus(status);

  };



  const handleOpenInfo = async (id: number) => {

    try {

      setLoadingInfo(true);

      const data = await fetchTurma(id);

      setInfoTurma(data);

    } catch (err) {

      toast.error(getErrorMessage(err, 'Erro ao carregar detalhes da turma.'));

    } finally {

      setLoadingInfo(false);

    }

  };



  const handleDeleteConfirm = async () => {

    if (!deletingId) return;

    try {

      await deleteTurma(deletingId);

      toast.success('Turma excluída com sucesso!');

    } catch (err) {

      toast.error(getErrorMessage(err, 'Erro ao excluir turma.'));

    } finally {

      setDeletingId(null);

    }

  };



  const handleStatusUpdate = async () => {

    if (!statusTurmaId || !newStatus) return;

    try {

      await updateTurmaStatus(statusTurmaId, newStatus);

      toast.success('Status da turma atualizado com sucesso!');

    } catch (err) {

      toast.error(getErrorMessage(err, 'Erro ao atualizar status da turma.'));

    } finally {

      setStatusTurmaId(null);

      setNewStatus('');

    }

  };



  const handleMatriculaSuccess = () => {

    setMatriculaTurmaId(null);

    fetchTurmas(pagination?.current_page || 1, sortConfig.key, sortConfig.direction, searchTerm, statusFilter);

  };



  const handleClearFilters = () => {

    setSearchTerm('');

    setStatusFilter('');

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



  const getStatusStyle = (status: TurmaStatus) => {

    const styles: Record<TurmaStatus, string> = {

      planejamento: 'bg-[#9E9E9E] text-white',

      aberta: 'bg-[#2196F3] text-white',

      em_andamento: 'bg-[#4CAF50] text-white',

      pausada: 'bg-[#FF9800] text-white',

      concluida: 'bg-[#455A64] text-white',

      cancelada: 'bg-[#F44336] text-white',

    };

    return styles[status] || 'bg-zinc-100 text-zinc-600';

  };



  const getStatusLabel = (status: string) => {

    const labels: Record<string, string> = {

      planejamento: 'Planejamento',

      aberta: 'Aberto',

      em_andamento: 'Em Andamento',

      pausada: 'Pausada',

      concluida: 'Concluída',

      cancelada: 'Cancelada',

    };

    return labels[status] || status.replace('_', ' ');

  };



  const formatCurrency = (value: number | null) => {

    if (value === null || value === undefined) return 'R$ 0,00';

    return new Intl.NumberFormat('pt-BR', {

      style: 'currency',

      currency: 'BRL',

    }).format(value);

  };



  const dayLabels: Record<string, string> = {

    segunda: 'Segunda-feira',

    terca: 'Terça-feira',

    quarta: 'Quarta-feira',

    quinta: 'Quinta-feira',

    sexta: 'Sexta-feira',

    sabado: 'Sábado',

    domingo: 'Domingo',

  };



  return (

    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col lg:flex-row md:items-center md:items-start md:justify-between gap-3">

        <div>

          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">

            Gestão de <span className="text-indigo-600">Turmas</span>

          </h1>

          <p className="text-zinc-500 mt-1 text-[14px]">Gerencie os grupos de alunos, horários e professores.</p>

        </div>



        <div className="flex flex-col lg:flex-row md:items-center gap-3 w-full lg:w-auto">

          <div className="relative w-full lg:w-auto">

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />

            <Input

              placeholder="Pesquisar turmas..."

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

            Nova Turma

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

        {isLoading && !statusTurmaId ? (

          <div className="flex items-center justify-center py-20">

            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />

          </div>

        ) : turmas.length === 0 ? (

          <Card className="border-dashed border-2 border-zinc-200 shadow-none bg-transparent">

            <CardContent className="flex flex-col items-center justify-center py-12 text-center">

              <div className="p-4 bg-zinc-100 rounded-full text-zinc-400 mb-4">

                <GraduationCap className="w-8 h-8" />

              </div>

              <h3 className="text-lg font-bold text-zinc-900">

                {(searchTerm || statusFilter) ? 'Nenhum resultado encontrado' : 'Nenhuma turma encontrada'}

              </h3>

              <p className="text-zinc-500 max-w-xs mx-auto mt-1 mb-6">

                {(searchTerm || statusFilter)

                  ? 'Não encontramos nenhuma turma com os filtros aplicados. Tente ajustar sua busca ou limpar os filtros.'

                  : 'Comece criando sua primeira turma clicando no botão acima.'}

              </p>

              {(searchTerm || statusFilter) && (

                <Button

                  onClick={handleClearFilters}

                  variant="outline"

                  className="rounded-full h-9 px-6 border-zinc-200 font-bold hover:bg-zinc-50 hover:cursor-pointer transition-all"

                >

                  Limpar Filtros

                </Button>

              )}

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

                        onClick={() => handleSort('curso.nome')}

                      >

                        <div className="flex items-center">

                          Curso / Nível

                          <SortIcon column="curso.nome" />

                        </div>

                      </th>

                      <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider">Professor</th>

                      <th

                        className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100/50 transition-colors"

                        onClick={() => handleSort('valor_mensalidade')}

                      >

                        <div className="flex items-center">

                          Mensalidade

                          <SortIcon column="valor_mensalidade" />

                        </div>

                      </th>

                      <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider">Alunos</th>

                      <th

                        className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider"

                      >

                        <div className="flex items-center gap-2">

                          Status

                          <select

                            value={statusFilter}

                            onChange={(e) => setStatusFilter(e.target.value)}

                            className="bg-transparent border-none text-[11px] font-bold text-indigo-600 focus:ring-0 cursor-pointer hover:text-indigo-700 transition-colors uppercase"

                          >

                            <option value="">Status (Todos)</option>

                            <option value="planejamento">Planejamento</option>

                            <option value="aberta">Aberta</option>

                            <option value="em_andamento">Andamento</option>

                            <option value="pausada">Pausada</option>

                            <option value="concluida">Concluída</option>

                            <option value="cancelada">Cancelada</option>

                          </select>

                        </div>

                      </th>

                      <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider text-right">Ações</th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-zinc-50">

                    {turmas.map((turma) => (

                      <tr key={turma.id} className="hover:bg-zinc-50/50 transition-colors group">

                        <td className="px-6 py-4">

                          <div>

                            <p className="text-sm font-bold text-zinc-900 leading-none">{turma.curso?.nome ?? 'Sem Curso'}</p>

                            <p className="text-[11px] text-zinc-500 mt-1">{turma.nivel?.nome ?? 'Sem Nível'} - {turma.descricao || 'Sem descrição'}</p>

                          </div>

                        </td>

                        <td className="px-6 py-4 text-sm text-zinc-600">

                          {turma.professor?.usuario?.nome || 'Não atribuído'}

                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-zinc-900">

                          {formatCurrency(turma.valor_mensalidade)}

                        </td>

                        <td className="px-6 py-4 text-sm text-zinc-600">

                          {turma.matriculas_count ?? 0} / {turma.maximo_alunos}

                        </td>

                        <td className="px-6 py-4">

                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium uppercase ${getStatusStyle(turma.status as TurmaStatus)}`}>

                            {getStatusLabel(turma.status)}

                          </span>

                        </td>

                        <td className="px-6 py-4 text-right">

                          <div className="flex items-center justify-end gap-2">

                            <Button

                              variant="ghost"

                              size="icon"

                              className="h-8 w-8 rounded-full text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 hover:cursor-pointer"

                              title="Matricular Aluno"

                              onClick={() => setMatriculaTurmaId(turma.id)}

                            >

                              <UserPlus className="w-4 h-4" />

                            </Button>

                            <Button

                              variant="ghost"

                              size="icon"

                              className="h-8 w-8 rounded-full text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 hover:cursor-pointer"

                              title="Agendar Aula / Reposição"

                              onClick={() => setAgendarAulaTurmaId(turma.id)}

                            >

                              <CalendarIcon className="w-4 h-4" />

                            </Button>

                            <Button

                              variant="ghost"

                              size="icon"

                              className="h-8 w-8 rounded-full text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 hover:cursor-pointer"

                              title="Informações da Turma"

                              onClick={() => handleOpenInfo(turma.id)}

                            >

                              <Info className="w-4 h-4" />

                            </Button>

                            <Button

                              variant="ghost"

                              size="icon"

                              className="h-8 w-8 rounded-full text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 hover:cursor-pointer"

                              title="Alterar Status"

                              onClick={() => handleOpenStatus(turma.id, turma.status as TurmaStatus)}

                            >

                              <RefreshCw className="w-4 h-4" />

                            </Button>

                            <Button

                              variant="ghost"

                              size="icon"

                              className="h-8 w-8 rounded-full text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 hover:cursor-pointer"

                              onClick={() => handleOpenEdit(turma.id)}

                            >

                              <Edit className="w-4 h-4" />

                            </Button>

                            <Button

                              variant="ghost"

                              size="icon"

                              className="h-8 w-8 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50 hover:cursor-pointer"

                              onClick={() => setDeletingId(turma.id)}

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

                {turmas.map((turma) => (

                  <div key={turma.id} className="p-5 space-y-4 active:bg-zinc-50 transition-colors">

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex-1 min-w-0">

                        <div className="flex items-center gap-2 mb-1">

                          <h3 className="text-[15px] font-bold text-zinc-900 truncate">

                            {turma.curso?.nome ?? 'Sem Curso'}

                          </h3>

                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase shrink-0 ${getStatusStyle(turma.status as TurmaStatus)}`}>

                            {getStatusLabel(turma.status)}

                          </span>

                        </div>

                        <p className="text-xs text-zinc-500 font-medium">

                          {turma.nivel?.nome ?? 'Sem Nível'} {turma.descricao && `• ${turma.descricao}`}

                        </p>

                      </div>

                    </div>



                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">

                      <div className="space-y-1">

                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Professor</span>

                        <p className="text-xs text-zinc-700 font-bold truncate">

                          {turma.professor?.usuario?.nome || 'Não atribuído'}

                        </p>

                      </div>

                      <div className="space-y-1">

                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Mensalidade</span>

                        <p className="text-xs text-indigo-600 font-black">

                          {formatCurrency(turma.valor_mensalidade)}

                        </p>

                      </div>

                      <div className="space-y-1">

                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Alunos</span>

                        <p className="text-xs text-zinc-700 font-bold">

                          {turma.matriculas_count ?? 0} / {turma.maximo_alunos}

                        </p>

                      </div>

                    </div>



                    <div className="flex items-center gap-2 pt-2 overflow-x-auto scrollbar-hide">

                      <Button

                        variant="outline"

                        size="sm"

                        className="h-8 rounded-full border-zinc-200 text-[11px] font-bold gap-1.5 shrink-0 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100"

                        onClick={() => setMatriculaTurmaId(turma.id)}

                      >

                        <UserPlus className="w-3.5 h-3.5" />

                        Matricular

                      </Button>

                      <Button

                        variant="outline"

                        size="sm"

                        className="h-8 rounded-full border-zinc-200 text-[11px] font-bold gap-1.5 shrink-0 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100"

                        onClick={() => setAgendarAulaTurmaId(turma.id)}

                      >

                        <CalendarIcon className="w-3.5 h-3.5" />

                        Aula

                      </Button>

                      <Button

                        variant="outline"

                        size="sm"

                        className="h-8 rounded-full border-zinc-200 text-[11px] font-bold gap-1.5 shrink-0"

                        onClick={() => handleOpenInfo(turma.id)}

                      >

                        <Info className="w-3.5 h-3.5" />

                        Info

                      </Button>

                      <div className="flex items-center gap-2 border-l border-zinc-100 pl-2">

                        <Button

                          variant="ghost"

                          size="icon"

                          className="h-8 w-8 rounded-full text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50"

                          onClick={() => handleOpenEdit(turma.id)}

                        >

                          <Edit className="w-4 h-4" />

                        </Button>

                        <Button

                          variant="ghost"

                          size="icon"

                          className="h-8 w-8 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50"

                          onClick={() => setDeletingId(turma.id)}

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

        )}



        {pagination && pagination.last_page > 1 && (

          <PaginationCustom

            currentPage={pagination.current_page}

            lastPage={pagination.last_page}

            onPageChange={(page) => fetchTurmas(page, sortConfig.key, sortConfig.direction, searchTerm, statusFilter)}

            isLoading={isLoading}

          />

        )}

      </div>



      <ConfirmDeleteDialog

        open={!!deletingId}

        onOpenChange={(open) => !open && setDeletingId(null)}

        title={<>Excluir <span className="text-rose-500">Turma</span></>}

        description="Esta ação não pode ser desfeita. Isso excluirá permanentemente a turma e todas as suas vinculações."

        confirmLabel="Excluir"

        onConfirm={handleDeleteConfirm}

      />



      {/* Status Update Modal */}

      <Dialog open={!!statusTurmaId} onOpenChange={(open) => !open && setStatusTurmaId(null)}>

        <DialogContent className="sm:max-w-[400px] rounded-[24px] p-0 border-none shadow-2xl">

          <DialogHeader className="p-8 pb-0">

            <DialogTitle className="text-xl font-bold text-zinc-900">Atualizar Status</DialogTitle>

            <DialogDescription className="text-zinc-500">

              Selecione o novo status para esta turma.

            </DialogDescription>

          </DialogHeader>



          <div className="pl-8 pr-6 pb-4 space-y-4">

            <div className="space-y-2">

              <Label htmlFor="new-status" className="font-medium text-zinc-700 ml-1">Novo Status</Label>

              <select

                id="new-status"

                value={newStatus}

                onChange={(e) => setNewStatus(e.target.value as TurmaStatus)}

                className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"

              >

                <option value="planejamento">Planejamento</option>

                <option value="aberta">Aberta (Matrículas)</option>

                <option value="em_andamento">Em Andamento</option>

                <option value="pausada">Pausada</option>

                <option value="concluida">Concluída</option>

                <option value="cancelada">Cancelada</option>

              </select>

            </div>

          </div>



          <DialogFooter className="flex gap-3">

            <Button

              variant="ghost"

              onClick={() => setStatusTurmaId(null)}

              className="rounded-full px-6 h-9 font-bold hover:bg-zinc-100 hover:cursor-pointer"

            >

              Cancelar

            </Button>

            <Button

              onClick={handleStatusUpdate}

              disabled={isLoading || !newStatus}

              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 h-9 font-bold shadow-lg shadow-indigo-100 hover:cursor-pointer transition-all active:scale-95"

            >

              {isLoading ? (

                <>

                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                  Salvando...

                </>

              ) : (

                'Confirmar'

              )}

            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>



      {/* Matricula Modal */}

      <Dialog open={!!matriculaTurmaId} onOpenChange={(open) => !open && setMatriculaTurmaId(null)}>

        <DialogContent className="max-w-2xl rounded-[32px] p-0 border-none shadow-2xl">

          <DialogHeader className=" bg-zinc-50/50 border-b border-zinc-100">

            <DialogTitle className="text-xl font-black text-zinc-900 flex items-center gap-2">

              <UserPlus className="w-6 h-6 text-indigo-600" />

              Realizar Matrícula

            </DialogTitle>

            <DialogDescription className="text-zinc-500">

              Preencha os dados abaixo para matricular um aluno nesta turma.

            </DialogDescription>

          </DialogHeader>



          <MatriculaForm

            onClose={() => setMatriculaTurmaId(null)}

            onSuccess={handleMatriculaSuccess}

            defaultTurmaId={matriculaTurmaId?.toString()}

          />

        </DialogContent>

      </Dialog>



      {/* Agendar Aula Modal */}

      <AulaModal

        open={!!agendarAulaTurmaId}

        onOpenChange={(open) => {

          if (!open) setAgendarAulaTurmaId(null);

        }}

        defaultTurmaId={agendarAulaTurmaId ?? undefined}

        defaultProfessorId={turmas.find(t => t.id === agendarAulaTurmaId)?.id_professor ?? undefined}

        title={<>Agendar <span className="text-indigo-600">Aula / Reposição</span></>}

        description="Crie uma aula avulsa, reposição ou reforço para esta turma."

        onSuccess={() => {

          fetchTurmas(pagination?.current_page || 1, sortConfig.key, sortConfig.direction, searchTerm, statusFilter);

        }}

      />



      {/* Quick Info Modal */}

      <Dialog open={!!infoTurma || loadingInfo} onOpenChange={(open) => !open && setInfoTurma(null)}>

        <DialogContent className="sm:max-w-[500px] rounded-[24px] p-0 border-none shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

          {loadingInfo ? (

            <div className="flex flex-col items-center justify-center py-20 gap-4">

              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />

              <p className="text-zinc-500 font-medium">Carregando detalhes...</p>

            </div>

          ) : infoTurma && (

            <>

              <DialogHeader className=" bg-zinc-50/50 border-b border-zinc-100">

                <div className="flex items-center justify-between">

                  <div className="flex-1 mr-4">

                    <DialogTitle className="text-xl font-bold text-zinc-900 leading-tight">

                      {infoTurma.curso?.nome}

                    </DialogTitle>

                    <DialogDescription className="text-indigo-600 font-medium mt-0.5">

                      {infoTurma.nivel?.nome} {infoTurma.descricao && `- ${infoTurma.descricao}`}

                    </DialogDescription>

                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium uppercase shrink-0 ${getStatusStyle(infoTurma.status)}`}>

                    {getStatusLabel(infoTurma.status)}

                  </span>

                </div>

              </DialogHeader>



              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">

                {/* Professor */}

                <div className="space-y-2">

                  <div className="flex items-center gap-2 text-zinc-400">

                    <GraduationCap className="w-4 h-4" />

                    <span className="text-[11px] font-bold uppercase tracking-wider">Professor</span>

                  </div>

                  <p className="text-sm text-zinc-700 font-bold">

                    {infoTurma.professor?.usuario?.nome ?? 'Não atribuído'}

                  </p>

                </div>



                {/* Horários */}

                <div className="space-y-3">

                  <div className="flex items-center gap-2 text-zinc-400">

                    <Clock className="w-4 h-4" />

                    <span className="text-[11px] font-bold uppercase tracking-wider">Horários</span>

                  </div>

                  {infoTurma.horarios && infoTurma.horarios.length > 0 ? (

                    <div className="grid grid-cols-1 gap-2">

                      {infoTurma.horarios.map((h: { id: number; dia_semana: string; hora_inicio: string; hora_termino: string }) => (

                        <div key={h.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">

                          <span className="text-sm font-medium text-zinc-700">{dayLabels[h.dia_semana] || h.dia_semana}</span>

                          <span className="text-sm font-bold text-indigo-600">{h.hora_inicio?.substring(0, 5) ?? '--:--'} - {h.hora_termino?.substring(0, 5) ?? '--:--'}</span>

                        </div>

                      ))}

                    </div>

                  ) : (

                    <p className="text-sm text-zinc-500 italic px-1">Nenhum horário definido.</p>

                  )}

                </div>



                {/* Alunos */}

                <div className="space-y-3">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2 text-zinc-400">

                      <Users className="w-4 h-4" />

                      <span className="text-[11px] font-bold uppercase tracking-wider">Alunos na Turma</span>

                    </div>

                    <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">

                      {infoTurma.matriculas?.length || 0} / {infoTurma.maximo_alunos}

                    </span>

                  </div>

                  {infoTurma.matriculas && infoTurma.matriculas.length > 0 ? (

                    <div className="grid grid-cols-1 gap-2">

                      {infoTurma.matriculas.map((m: { id: number; aluno?: { usuario?: { nome: string } } }) => (

                        <div key={m.id} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-zinc-100/50 shadow-sm transition-all hover:border-indigo-100 hover:shadow-indigo-50/20 group hover:bg-zinc-50/30">

                          <div className="flex items-center gap-3 flex-1 min-w-0">

                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-[11px] font-bold text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">

                              {m.aluno?.usuario?.nome?.charAt(0) ?? '?'}

                            </div>

                            <span className="text-sm text-zinc-700 font-medium truncate">{m.aluno?.usuario?.nome ?? 'Aluno sem Nome'}</span>

                          </div>



                          <Dialog>

                            <DialogTrigger asChild>

                              <Button

                                variant="ghost"

                                size="icon"

                                className="h-7 w-7 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-all hover:cursor-pointer"

                                title="Ver histórico de transferências"

                              >

                                <HistoryIcon className="w-3.5 h-3.5" />

                              </Button>

                            </DialogTrigger>

                            <DialogContent className="max-w-3xl rounded-[32px] p-0 border-none shadow-2xl">

                              <DialogHeader className=" border-b border-zinc-50">

                                <DialogTitle className="flex items-center gap-2 text-xl font-black text-zinc-900">

                                  <HistoryIcon className="w-6 h-6 text-indigo-600" />

                                  Histórico de {m.aluno?.usuario?.nome}

                                </DialogTitle>

                              </DialogHeader>

                              <div className="">

                                <MatriculaHistorico matriculaId={m.id} />

                              </div>

                            </DialogContent>

                          </Dialog>

                        </div>

                      ))}

                    </div>

                  ) : (

                    <p className="text-sm text-zinc-500 italic px-1">Nenhum aluno matriculado.</p>

                  )}

                </div>



                {/* Observações */}

                {infoTurma.observacoes && (

                  <div className="space-y-3 pt-2">

                    <div className="flex items-center gap-2 text-zinc-400">

                      <Info className="w-4 h-4" />

                      <span className="text-[11px] font-bold uppercase tracking-wider">Observações</span>

                    </div>

                    <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 italic shadow-inner">

                      <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">

                        {infoTurma.observacoes}

                      </p>

                    </div>

                  </div>

                )}

              </div>



              <DialogFooter className="border-t border-zinc-50 shrink-0 p-8">

                <Button

                  onClick={() => setInfoTurma(null)}

                  className="w-full bg-zinc-900 hover:bg-black text-white rounded-full h-11 font-bold shadow-lg shadow-zinc-200 transition-all hover:cursor-pointer active:scale-95"

                >

                  Fechar

                </Button>

              </DialogFooter>

            </>

          )}

        </DialogContent>

      </Dialog>

    </div>

  );

};



export default TurmasPage;
