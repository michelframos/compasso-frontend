import React, { useState, useEffect } from 'react';

import { Trash2, Edit, ChevronUp, ChevronDown, ChevronsUpDown, Search, DollarSign, ArrowUpCircle, ArrowDownCircle, AlertCircle, Eye, CheckCircle2, FileText, Loader2 } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

import { Input } from '@/shared/components/ui/input';

import { Checkbox } from '@/shared/components/ui/checkbox';

import { Card, CardContent } from '@/shared/components/ui/card';

import { useContas } from './hooks/useContas';

import type { Conta } from './types';

import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog';

import {

    Dialog,

    DialogContent,

    DialogDescription,

    DialogHeader,

    DialogTitle,

} from "@/components/ui/dialog";

import { toast } from 'sonner';

import { getErrorMessage } from '@/shared/lib/utils';

import { ContaModal } from './components/ContaModal';

import { PagamentoModal } from './components/PagamentoModal';

import { ContaDetalhesModal } from './components/ContaDetalhesModal';

import { PagamentoLoteModal } from './components/PagamentoLoteModal';

import { PaginationCustom } from '@/shared/components/ui/pagination-custom';



import { useAlunos } from '@/modules/pessoas'

import { useTurmas, useCursos } from '@/modules/academico'

import { useCarneFinanceiro } from './hooks/useCarneFinanceiro';

import { CarneOptionsModal } from '@/shared/components/CarneOptionsModal';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CategoriasTab } from './components/CategoriasTab';

import { useSearchParams } from 'react-router-dom';

import { getConta } from '@/modules/financeiro/api/contas';



export const FinanceiroPage: React.FC = () => {

    const [searchParams, setSearchParams] = useSearchParams();

    const { contas, pagination, isLoading, error, deleteConta, fetchContas } = useContas();

    const { alunos, fetchAlunos } = useAlunos();

    const { turmas, fetchTurmas } = useTurmas();

    const { cursos, fetchCursos } = useCursos();

    const { emitirCarne, isGenerating: isGeneratingCarne } = useCarneFinanceiro();

    const [isCarneOptionsOpen, setIsCarneOptionsOpen] = useState(false);



    const [deletingId, setDeletingId] = useState<number | null>(null);

    const [isFormOpen, setIsFormOpen] = useState(false);

    const [selectedConta, setSelectedConta] = useState<Conta | undefined>(undefined);

    const [isPagamentoOpen, setIsPagamentoOpen] = useState(false);

    const [contaParaPagar, setContaParaPagar] = useState<Conta | undefined>(undefined);

    const [isDetalhesOpen, setIsDetalhesOpen] = useState(false);

    const [contaDetalhes, setContaDetalhes] = useState<Conta | undefined>(undefined);

    const [tipoFluxoForm, setTipoFluxoForm] = useState<'receita' | 'despesa'>('despesa');

    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({

        key: 'data_vencimento',

        direction: 'asc',

    });



    const [selectedContas, setSelectedContas] = useState<number[]>([]);

    const [isPagamentoLoteOpen, setIsPagamentoLoteOpen] = useState(false);



    // Filtros

    const [searchTerm, setSearchTerm] = useState('');

    const [filtroTipo, setFiltroTipo] = useState<string>('');

    const [filtroStatus, setFiltroStatus] = useState<string>('');

    const [filtroAluno, setFiltroAluno] = useState<string>('');

    const [filtroTurma, setFiltroTurma] = useState<string>('');

    const [filtroCurso, setFiltroCurso] = useState<string>('');

    const [dataInicio, setDataInicio] = useState<string>('');

    const [dataFim, setDataFim] = useState<string>('');



    // Load filter options

    useEffect(() => {

        fetchAlunos(1, 'nome', 'asc');

        fetchTurmas(1, 'descricao', 'asc');

        fetchCursos(1, 'nome', 'asc');

    }, [fetchAlunos, fetchTurmas, fetchCursos]);



    useEffect(() => {

        const timer = setTimeout(() => {

            fetchContas(

                1,

                sortConfig.key,

                sortConfig.direction,

                searchTerm,

                filtroTipo,

                filtroStatus,

                filtroAluno ? Number(filtroAluno) : undefined,

                filtroTurma ? Number(filtroTurma) : undefined,

                filtroCurso ? Number(filtroCurso) : undefined,

                dataInicio || undefined,

                dataFim || undefined

            );

        }, 500);

        return () => clearTimeout(timer);

    }, [

        searchTerm,

        sortConfig.key,

        sortConfig.direction,

        fetchContas,

        filtroTipo,

        filtroStatus,

        filtroAluno,

        filtroTurma,

        filtroCurso,

        dataInicio,

        dataFim

    ]);



    // Update modal details when contas change (e.g. after deleting a payment)

    useEffect(() => {

        if (isDetalhesOpen && contaDetalhes) {

            const updatedConta = contas.find(c => c.id === contaDetalhes.id);

            if (updatedConta) {

                setContaDetalhes(updatedConta);

            }

        }

    }, [contas, isDetalhesOpen, contaDetalhes]);



    // Abre o formulário de edição quando chega via ?conta_id=

    const contaIdParam = searchParams.get('conta_id');

    useEffect(() => {

        if (!contaIdParam) return;



        const contaId = Number(contaIdParam);

        if (!Number.isFinite(contaId) || contaId <= 0) return;



        let cancelled = false;



        const openContaFromQuery = async () => {

            try {

                const response = await getConta(contaId);

                const conta = (response as { data?: Conta }).data ?? (response as Conta);

                if (cancelled || !conta?.id) return;



                setSelectedConta(conta);

                setTipoFluxoForm(conta.tipo);

                setIsFormOpen(true);

            } catch (err: unknown) {

                if (!cancelled) {

                    toast.error(getErrorMessage(err, 'Não foi possível abrir o cadastro da conta.'));

                }

            } finally {

                if (!cancelled) {

                    setSearchParams((prev) => {

                        const next = new URLSearchParams(prev);

                        next.delete('conta_id');

                        return next;

                    }, { replace: true });

                }

            }

        };



        openContaFromQuery();



        return () => {

            cancelled = true;

        };

    }, [contaIdParam, setSearchParams]);



    const handleOpenCreate = (tipo: 'receita' | 'despesa') => {

        setSelectedConta(undefined);

        setTipoFluxoForm(tipo);

        setIsFormOpen(true);

    };



    const handleOpenEdit = (conta: Conta) => {

        setSelectedConta(conta);

        setTipoFluxoForm(conta.tipo); // keep the same flux

        setIsFormOpen(true);

    };



    const handleDeleteConfirm = async () => {

        if (!deletingId) return;

        try {

            await deleteConta(deletingId);

            toast.success('Conta excluída com sucesso!');

        } catch (err: unknown) {

            console.error('Delete error:', err);

            toast.error(getErrorMessage(err, 'Erro ao excluir conta.'));

        } finally {

            setDeletingId(null);

        }

    };



    const handleFormSuccess = (id?: number) => {

        fetchContas(

            pagination?.current_page || 1,

            sortConfig.key,

            sortConfig.direction,

            searchTerm,

            filtroTipo,

            filtroStatus,

            filtroAluno ? Number(filtroAluno) : undefined,

            filtroTurma ? Number(filtroTurma) : undefined,

            filtroCurso ? Number(filtroCurso) : undefined,

            dataInicio || undefined,

            dataFim || undefined

        );

    };



    const handleOpenPagamento = (conta: Conta) => {

        setContaParaPagar(conta);

        setIsPagamentoOpen(true);

    };



    const handlePagamentoSuccess = () => {

        fetchContas(

            pagination?.current_page || 1,

            sortConfig.key,

            sortConfig.direction,

            searchTerm,

            filtroTipo,

            filtroStatus,

            filtroAluno ? Number(filtroAluno) : undefined,

            filtroTurma ? Number(filtroTurma) : undefined,

            filtroCurso ? Number(filtroCurso) : undefined,

            dataInicio || undefined,

            dataFim || undefined

        );

    };



    const handleOpenDetalhes = (conta: Conta) => {

        setContaDetalhes(conta);

        setIsDetalhesOpen(true);

    };



    const handleSelectConta = (contaId: number) => {

        setSelectedContas(prev => 

            prev.includes(contaId) 

                ? prev.filter(id => id !== contaId)

                : [...prev, contaId]

        );

    };



    const handleSelectAllVisibleContas = (checked: boolean) => {

        if (checked) {

            const elegiveis = contas

                .filter(c => c.status !== 'pago' && c.status !== 'cancelado')

                .map(c => c.id);

            const novosVazios = elegiveis.filter(id => !selectedContas.includes(id));

            setSelectedContas(prev => [...prev, ...novosVazios]);

        } else {

            const visiveis = contas.map(c => c.id);

            setSelectedContas(prev => prev.filter(id => !visiveis.includes(id)));

        }

    };



    const handlePagamentoLoteSuccess = () => {

        setIsPagamentoLoteOpen(false);

        setSelectedContas([]);

        fetchContas(

            pagination?.current_page || 1,

            sortConfig.key,

            sortConfig.direction,

            searchTerm,

            filtroTipo,

            filtroStatus,

            filtroAluno ? Number(filtroAluno) : undefined,

            filtroTurma ? Number(filtroTurma) : undefined,

            filtroCurso ? Number(filtroCurso) : undefined,

            dataInicio || undefined,

            dataFim || undefined

        );

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



    const formatCurrency = (value: number) => {

        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    };



    const statusColors: Record<string, string> = {

        'pendente': 'bg-amber-100 text-amber-700 border-amber-200',

        'pago': 'bg-emerald-100 text-emerald-700 border-emerald-200',

        'atrasado': 'bg-rose-100 text-rose-700 border-rose-200',

        'pago_parcialmente': 'bg-blue-100 text-blue-700 border-blue-200',

        'vencido': 'bg-rose-100 text-rose-700 border-rose-200',

        'cancelado': 'bg-zinc-100 text-zinc-500 border-zinc-200'

    };



    // Helper to translate status

    const statusDict: Record<string, string> = {

        'pendente': 'Pendente',

        'pago': 'Pago',

        'atrasado': 'Atrasado',

        'pago_parcialmente': 'Parcial',

        'vencido': 'Vencido',

        'cancelado': 'Cancelado'

    };



    return (

        <div className="space-y-6">

            {/* Header */}

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                <div>

                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">

                        Gestão <span className="text-indigo-600">Financeira</span>

                    </h1>

                    <p className="text-zinc-500 mt-1 text-[14px]">Controle de receitas, despesas e mensalidades.</p>

                </div>



                <div className="flex flex-col lg:flex-row flex-wrap items-center gap-3">

                    <Button

                        onClick={() => handleOpenCreate('receita')}

                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full h-9 px-4 gap-2 shadow-lg shadow-emerald-100 font-bold active:scale-95 transition-all text-sm hover:cursor-pointer w-full lg:w-auto"

                    >

                        <ArrowUpCircle className="w-4 h-4" />

                        Nova Receita

                    </Button>



                    <Button

                        onClick={() => handleOpenCreate('despesa')}

                        className="bg-rose-600 hover:bg-rose-700 text-white rounded-full h-9 px-4 gap-2 shadow-lg shadow-rose-100 font-bold active:scale-95 transition-all text-sm hover:cursor-pointer w-full lg:w-auto"

                    >

                        <ArrowDownCircle className="w-4 h-4" />

                        Nova Despesa

                    </Button>

                </div>

            </div>



            <Tabs defaultValue="movimentacoes" className="space-y-6">

                <TabsList className="bg-zinc-100/100 p-1 w-full justify-start h-auto flex flex-wrap gap-1 rounded-2xl">

                    <TabsTrigger value="movimentacoes" className="rounded-xl px-6 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all hover:cursor-pointer">Movimentações</TabsTrigger>

                    <TabsTrigger value="categorias" className="rounded-xl px-6 py-2 text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all hover:cursor-pointer">Categorias</TabsTrigger>

                </TabsList>



                <TabsContent value="movimentacoes" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">

            {/* Filtros Avançados */}

            <Card className="border-none shadow-sm bg-white overflow-visible">

                <CardContent className="p-4 space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-4 gap-4">

                        {/* Busca e Tipo */}

                        <div className="space-y-2">

                            <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">Pesquisa e Tipo</label>

                            <div className="flex flex-col md:flex-row gap-2">

                                <div className="relative flex-1">

                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />

                                    <Input

                                        placeholder="Buscar descrição..."

                                        value={searchTerm}

                                        onChange={(e) => setSearchTerm(e.target.value)}

                                        className="pl-9 h-9 rounded-xl bg-zinc-50 border-zinc-200 focus:ring-indigo-500 text-sm"

                                    />

                                </div>

                                <select

                                    className="h-9 px-3 text-sm rounded-xl border border-zinc-200 bg-zinc-50 hover:cursor-pointer focus:ring-2 focus:ring-indigo-500"

                                    value={filtroTipo}

                                    onChange={(e) => setFiltroTipo(e.target.value)}

                                >

                                    <option value="">Tipos</option>

                                    <option value="receita">Receitas</option>

                                    <option value="despesa">Despesas</option>

                                </select>

                            </div>

                        </div>



                        {/* Entidades: Aluno, Turma, Curso */}

                        <div className="space-y-2 lg:col-span-2">

                            <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">Vínculos</label>

                            <div className="grid grid-cols1 md:grid-cols-3 gap-2">

                                <select

                                    className="h-9 px-3 text-sm rounded-xl border border-zinc-200 bg-zinc-50 hover:cursor-pointer focus:ring-2 focus:ring-indigo-500"

                                    value={filtroAluno}

                                    onChange={(e) => setFiltroAluno(e.target.value)}

                                >

                                    <option value="">Todos Alunos</option>

                                    {alunos.map(aluno => (

                                        <option key={aluno.id} value={aluno.id}>{aluno.usuario.nome}</option>

                                    ))}

                                </select>



                                <select

                                    className="h-9 px-3 text-sm rounded-xl border border-zinc-200 bg-zinc-50 hover:cursor-pointer focus:ring-2 focus:ring-indigo-500"

                                    value={filtroTurma}

                                    onChange={(e) => setFiltroTurma(e.target.value)}

                                >

                                    <option value="">Todas Turmas</option>

                                    {turmas.map(turma => (

                                        <option key={turma.id} value={turma.id}>{turma.descricao}</option>

                                    ))}

                                </select>



                                <select

                                    className="h-9 px-3 text-sm rounded-xl border border-zinc-200 bg-zinc-50 hover:cursor-pointer focus:ring-2 focus:ring-indigo-500"

                                    value={filtroCurso}

                                    onChange={(e) => setFiltroCurso(e.target.value)}

                                >

                                    <option value="">Todos Cursos</option>

                                    {cursos.map(curso => (

                                        <option key={curso.id} value={curso.id}>{curso.nome}</option>

                                    ))}

                                </select>

                            </div>

                        </div>



                        {/* Status */}

                        <div className="space-y-2">

                            <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">Status</label>

                            <select

                                className="w-full h-9 px-3 text-sm rounded-xl border border-zinc-200 bg-zinc-50 hover:cursor-pointer focus:ring-2 focus:ring-indigo-500"

                                value={filtroStatus}

                                onChange={(e) => setFiltroStatus(e.target.value)}

                            >

                                <option value="">Todos Status</option>

                                <option value="pendente">Pendente</option>

                                <option value="pago">Pago</option>

                                <option value="atrasado">Atrasado</option>

                                <option value="vencido">Vencido</option>

                                <option value="pago_parcialmente">Parcial</option>

                                <option value="cancelado">Cancelado</option>

                            </select>

                        </div>

                    </div>



                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-zinc-100">

                        {/* Período */}

                        <div className="lg:col-span-2 space-y-2">

                            <label className="text-[11px] font-bold text-zinc-400 uppercase ml-1">Período de Vencimento</label>

                            <div className="flex flex-col md:flex-row md:items-center gap-2 mt-4">

                                <div className="relative flex-1">

                                    <Input

                                        type="date"

                                        value={dataInicio}

                                        onChange={(e) => setDataInicio(e.target.value)}

                                        className="h-9 rounded-xl bg-zinc-50 border-zinc-200 focus:ring-indigo-500 text-sm"

                                    />

                                    <span className="absolute -top-4 left-1 text-[10px] text-zinc-400">Início</span>

                                </div>

                                <div className="text-zinc-300">até</div>

                                <div className="relative flex-1">

                                    <Input

                                        type="date"

                                        value={dataFim}

                                        onChange={(e) => setDataFim(e.target.value)}

                                        className="h-9 rounded-xl bg-zinc-50 border-zinc-200 focus:ring-indigo-500 text-sm"

                                    />

                                    <span className="absolute -top-4 left-1 text-[10px] text-zinc-400">Fim</span>

                                </div>

                            </div>

                        </div>



                        {/* Limpar Filtros */}

                        <div className="lg:col-start-4 flex items-end">

                            <Button

                                variant="ghost"

                                onClick={() => {

                                    setSearchTerm('');

                                    setFiltroTipo('');

                                    setFiltroStatus('');

                                    setFiltroAluno('');

                                    setFiltroTurma('');

                                    setFiltroCurso('');

                                    setDataInicio('');

                                    setDataFim('');

                                }}

                                className="w-full h-9 rounded-xl text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 text-xs font-bold gap-2 hover:cursor-pointer"

                            >

                                Limpar Filtros

                            </Button>

                        </div>

                    </div>

                </CardContent>

            </Card>



            {error && (

                <div className="flex p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-medium items-center gap-2">

                    <AlertCircle className="w-5 h-5" />

                    {error}

                </div>

            )}



            {selectedContas.length > 0 && (

                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">

                    <div className="flex items-center gap-3 text-indigo-700">

                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />

                        <span className="text-sm font-medium">

                            <strong>{selectedContas.length}</strong> conta(s) selecionada(s)

                        </span>

                    </div>

                    <div className="flex items-center gap-3">

                        <Button

                            variant="ghost"

                            size="sm"

                            onClick={() => setSelectedContas([])}

                            className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-full h-9"

                        >

                            Limpar Seleção

                        </Button>

                        <Button

                            disabled={isGeneratingCarne}

                            onClick={() => setIsCarneOptionsOpen(true)}

                            className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-6 h-9 font-bold shadow-lg shadow-violet-100 transition-all hover:cursor-pointer active:scale-95 flex items-center gap-2 disabled:opacity-50"

                        >

                            {isGeneratingCarne ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}

                            Emitir Carnê

                        </Button>

                        <Button

                            onClick={() => setIsPagamentoLoteOpen(true)}

                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 h-9 font-bold shadow-lg shadow-indigo-100 transition-all hover:cursor-pointer active:scale-95 flex items-center gap-2"

                        >

                            <DollarSign className="w-4 h-4" />

                            Baixar Selecionadas

                        </Button>

                    </div>

                </div>

            )}



            {/* Listagem */}

            <div className="grid grid-cols-1 gap-4">

                {isLoading ? (

                    <div className="flex items-center justify-center py-20">

                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />

                    </div>

                ) : contas.length === 0 ? (

                    <Card className="border-dashed border-2 border-zinc-200 shadow-none bg-transparent">

                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">

                            <div className="p-4 bg-zinc-100 rounded-full text-zinc-400 mb-4">

                                <DollarSign className="w-8 h-8" />

                            </div>

                            <h3 className="text-lg font-bold text-zinc-900">Nenhuma conta encontrada</h3>

                            <p className="text-zinc-500 max-w-xs mx-auto mt-1">

                                Refaça sua busca ou adicione uma nova receita/despesa.

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

                                        <tr className="">

                                            <th className="px-6 py-4 w-[50px]">

                                                <Checkbox

                                                    className="border-[#e4e4e7] border-[1px]"

                                                    checked={

                                                        contas.filter(c => c.status !== 'pago' && c.status !== 'cancelado').length > 0 &&

                                                        contas.filter(c => c.status !== 'pago' && c.status !== 'cancelado').every(c => selectedContas.includes(c.id))

                                                    }

                                                    onCheckedChange={handleSelectAllVisibleContas}

                                                />

                                            </th>

                                            <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider">

                                                Tipo

                                            </th>

                                            <th

                                                className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100/50 transition-colors"

                                                onClick={() => handleSort('descricao')}

                                            >

                                                <div className="flex items-center">

                                                    Descrição

                                                    <SortIcon column="descricao" />

                                                </div>

                                            </th>

                                            <th

                                                className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100/50 transition-colors"

                                                onClick={() => handleSort('valor')}

                                            >

                                                <div className="flex items-center">

                                                    Valor Original

                                                    <SortIcon column="valor" />

                                                </div>

                                            </th>

                                            <th className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider">

                                                Valor Pago

                                            </th>

                                            <th

                                                className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100/50 transition-colors"

                                                onClick={() => handleSort('saldo_devedor')}

                                            >

                                                <div className="flex items-center">

                                                    Valor a Pagar

                                                    <SortIcon column="saldo_devedor" />

                                                </div>

                                            </th>

                                            <th

                                                className="px-6 py-4 text-[12px] font-bold text-zinc-500 uppercase tracking-wider cursor-pointer hover:bg-zinc-100/50 transition-colors"

                                                onClick={() => handleSort('data_vencimento')}

                                            >

                                                <div className="flex items-center">

                                                    Vencimento

                                                    <SortIcon column="data_vencimento" />

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

                                        {contas.map((conta) => (

                                            <tr key={conta.id} className={`hover:bg-zinc-50/50 transition-colors group ${selectedContas.includes(conta.id) ? 'bg-indigo-50/30' : ''}`}>

                                                <td className="px-6 py-4">

                                                    {conta.status !== 'pago' && conta.status !== 'cancelado' ? (

                                                        <Checkbox

                                                            checked={selectedContas.includes(conta.id)}

                                                            onCheckedChange={() => handleSelectConta(conta.id)}

                                                            className="border-[#e4e4e7] border-[1px]"

                                                        />

                                                    ) : (

                                                        <div className="w-4 h-4" />

                                                    )}

                                                </td>

                                                <td className="px-6 py-4">

                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${conta.tipo === 'receita' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>

                                                        {conta.tipo === 'receita' ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}

                                                    </div>

                                                </td>

                                                <td className="px-6 py-4">

                                                    {conta.aluno?.nome || conta.professor?.nome ? (

                                                        <>
                                                            <p className="text-sm font-bold text-zinc-900 leading-none mb-1">
                                                                {conta.aluno?.nome || conta.professor?.nome}
                                                            </p>
                                                            <p className="text-[11px] text-zinc-500 truncate max-w-[280px]">{conta.descricao}</p>
                                                        </>

                                                    ) : (

                                                        <>
                                                            <p className="text-sm font-bold text-zinc-900 leading-none mb-1">{conta.descricao}</p>
                                                            {conta.categoria && <span className="text-[11px] text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">{conta.categoria.nome}</span>}
                                                        </>

                                                    )}

                                                </td>

                                                <td className="px-6 py-4">

                                                    <p className={`text-sm font-bold ${conta.tipo === 'receita' ? 'text-zinc-600' : 'text-zinc-600'}`}>

                                                        {tipoFluxoForm === 'despesa' && conta.tipo === 'despesa' ? '-' : ''}{formatCurrency(conta.valor)}

                                                    </p>

                                                </td>

                                                <td className="px-6 py-4">

                                                    <p className={`text-sm font-medium ${conta.tipo === 'receita' ? 'text-emerald-500' : 'text-rose-400'}`}>

                                                        {formatCurrency(conta.valor - (conta.saldo_devedor ?? conta.valor))}

                                                    </p>

                                                </td>

                                                <td className="px-6 py-4">

                                                    <p className={`text-sm font-bold ${conta.tipo === 'receita' ? 'text-emerald-600' : 'text-rose-600'}`}>

                                                        {tipoFluxoForm === 'despesa' && conta.tipo === 'despesa' ? '-' : ''}{formatCurrency(conta.saldo_devedor ?? conta.valor)}

                                                    </p>

                                                </td>

                                                <td className="px-6 py-4">

                                                    <p className="text-sm text-zinc-600">

                                                        {new Date(conta.data_vencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}

                                                    </p>

                                                </td>

                                                <td className="px-6 py-4">

                                                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusColors[conta.status]}`}>

                                                        {statusDict[conta.status] || conta.status}

                                                    </span>

                                                </td>

                                                <td className="px-6 py-4 text-right">

                                                    <div className="flex items-center justify-end gap-2">

                                                        {conta.status !== 'pago' && conta.status !== 'cancelado' && (

                                                            <Button

                                                                variant="ghost"

                                                                size="icon"

                                                                className="h-8 w-8 rounded-full text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 hover:cursor-pointer"

                                                                onClick={() => handleOpenPagamento(conta)}

                                                                title="Pagar"

                                                            >

                                                                <DollarSign className="w-4 h-4" />

                                                            </Button>

                                                        )}

                                                        <Button

                                                                variant="ghost"

                                                                size="icon"

                                                                className="h-8 w-8 rounded-full text-zinc-400 hover:text-blue-600 hover:bg-blue-50 hover:cursor-pointer"

                                                                onClick={() => handleOpenDetalhes(conta)}

                                                                title="Ver Detalhes"

                                                            >

                                                                <Eye className="w-4 h-4" />

                                                            </Button>

                                                            <Button

                                                                variant="ghost"

                                                                size="icon"

                                                                className="h-8 w-8 rounded-full text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 hover:cursor-pointer"

                                                                onClick={() => handleOpenEdit(conta)}

                                                            >

                                                                <Edit className="w-4 h-4" />

                                                            </Button>

                                                            <Button

                                                                variant="ghost"

                                                                size="icon"

                                                                className="h-8 w-8 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50 hover:cursor-pointer"

                                                                onClick={() => setDeletingId(conta.id)}

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

                                    {contas.map((conta) => (

                                        <div key={conta.id} className={`p-4 space-y-4 active:bg-zinc-50 transition-all ${selectedContas.includes(conta.id) ? 'bg-indigo-50/50' : ''}`}>

                                            <div className="flex items-start justify-between gap-3">

                                                <div className="flex items-start gap-3 flex-1 min-w-0">

                                                    <div className="flex flex-col items-center gap-2 pt-1">

                                                        {conta.status !== 'pago' && conta.status !== 'cancelado' ? (

                                                            <Checkbox

                                                                checked={selectedContas.includes(conta.id)}

                                                                onCheckedChange={() => handleSelectConta(conta.id)}

                                                                className="border-[#e4e4e7] border-[1px]"

                                                            />

                                                        ) : (

                                                            <div className="w-4 h-4" />

                                                        )}

                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${conta.tipo === 'receita' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>

                                                            {conta.tipo === 'receita' ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}

                                                        </div>

                                                    </div>

                                                    <div className="min-w-0 flex-1">

                                                        <h3 className="text-sm font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors leading-tight">

                                                            {conta.aluno?.nome || conta.professor?.nome || conta.descricao}

                                                        </h3>

                                                        {(conta.aluno?.nome || conta.professor?.nome) && (

                                                            <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{conta.descricao}</p>

                                                        )}

                                                        <div className="flex flex-wrap items-center gap-2 mt-1.5">

                                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border tracking-wider ${statusColors[conta.status]}`}>

                                                                {statusDict[conta.status] || conta.status}

                                                            </span>

                                                            {conta.categoria && (

                                                                <span className="text-[9px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full uppercase truncate">

                                                                    {conta.categoria.nome}

                                                                </span>

                                                            )}

                                                        </div>

                                                    </div>

                                                </div>

                                                <div className="text-right shrink-0">

                                                    <p className={`text-[15px] font-black ${conta.tipo === 'receita' ? 'text-emerald-600' : 'text-rose-600'}`}>

                                                        {tipoFluxoForm === 'despesa' && conta.tipo === 'despesa' ? '-' : ''}{formatCurrency(conta.saldo_devedor ?? conta.valor)}

                                                    </p>

                                                    <p className="text-[10px] font-bold text-zinc-400 mt-0.5 uppercase tracking-wider">

                                                        Venc: {new Date(conta.data_vencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}

                                                    </p>

                                                </div>

                                            </div>



                                            <div className="grid grid-cols-2 gap-2 bg-zinc-50/50 p-2.5 rounded-xl border border-zinc-100">

                                               <div className="flex flex-col">

                                                   <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">Valor Original</span>

                                                   <span className="text-xs font-bold text-zinc-600">{formatCurrency(conta.valor)}</span>

                                               </div>

                                               <div className="flex flex-col">

                                                   <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">Valor Pago</span>

                                                   <span className="text-xs font-bold text-emerald-600/70">{formatCurrency(conta.valor - (conta.saldo_devedor ?? conta.valor))}</span>

                                               </div>

                                            </div>



                                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">

                                                <div className="flex items-center gap-1.5">

                                                     {conta.status !== 'pago' && conta.status !== 'cancelado' && (

                                                        <Button

                                                            variant="outline"

                                                            size="sm"

                                                            className="h-8 rounded-full border-emerald-100 text-emerald-600 hover:bg-emerald-50 font-bold text-[10px] uppercase px-3 gap-1.5"

                                                            onClick={() => handleOpenPagamento(conta)}

                                                        >

                                                            <DollarSign className="w-3 h-3" />

                                                            Baixar

                                                        </Button>

                                                    )}

                                                    <Button

                                                        variant="ghost"

                                                        size="sm"

                                                        className="h-8 px-2 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 rounded-full text-[10px] font-bold uppercase"

                                                        onClick={() => handleOpenDetalhes(conta)}

                                                    >

                                                        <Eye className="w-3.5 h-3.5 mr-1" />

                                                        Ver

                                                    </Button>

                                                </div>

                                                

                                                <div className="flex items-center gap-1">

                                                    <Button

                                                        variant="ghost"

                                                        size="icon"

                                                        className="h-8 w-8 rounded-full text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50"

                                                        onClick={() => handleOpenEdit(conta)}

                                                    >

                                                        <Edit className="w-3.5 h-3.5" />

                                                    </Button>

                                                    <Button

                                                        variant="ghost"

                                                        size="icon"

                                                        className="h-8 w-8 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50"

                                                        onClick={() => setDeletingId(conta.id)}

                                                    >

                                                        <Trash2 className="w-3.5 h-3.5" />

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

                        onPageChange={(page) => fetchContas(page, sortConfig.key, sortConfig.direction, searchTerm, filtroTipo, filtroStatus)}

                        isLoading={isLoading}

                    />

                )}

            </div>



            <ContaModal

                open={isFormOpen}

                onOpenChange={(open) => {

                    setIsFormOpen(open);

                    if (!open) setSelectedConta(undefined);

                }}

                conta={selectedConta}

                tipoFluxo={tipoFluxoForm}

                onSuccess={handleFormSuccess}

            />



            <PagamentoModal

                open={isPagamentoOpen}

                onOpenChange={(open) => {

                    setIsPagamentoOpen(open);

                    if (!open) setContaParaPagar(undefined);

                }}

                conta={contaParaPagar}

                onSuccess={handlePagamentoSuccess}

            />



            <ContaDetalhesModal

                conta={contaDetalhes}

                isOpen={isDetalhesOpen}

                onClose={() => setIsDetalhesOpen(false)}

                onPagamentoDeleted={() => {

                    fetchContas(pagination?.current_page || 1, sortConfig.key, sortConfig.direction, searchTerm, filtroTipo, filtroStatus);

                }}

            />



            {/* Pagamento Lote Modal */}

            <Dialog open={isPagamentoLoteOpen} onOpenChange={setIsPagamentoLoteOpen}>

                <DialogContent className="sm:max-w-[500px] p-0 rounded-[24px] border-none shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

                    <DialogHeader className="p-8 pb-0">

                        <DialogTitle className="text-2xl font-bold text-zinc-900">

                            Baixa em <span className="text-indigo-600">Lote</span>

                        </DialogTitle>

                        <DialogDescription className="text-zinc-500">

                            Informe os dados gerais do pagamento para liquidar as contas selecionadas.

                        </DialogDescription>

                    </DialogHeader>

                    {isPagamentoLoteOpen && (

                        <PagamentoLoteModal

                            contaIds={selectedContas}

                            onClose={() => setIsPagamentoLoteOpen(false)}

                            onSuccess={handlePagamentoLoteSuccess}

                        />

                    )}

                </DialogContent>

            </Dialog>



            <ConfirmDeleteDialog

                open={!!deletingId}

                onOpenChange={(open) => !open && setDeletingId(null)}

                title={<>Excluir <span className="text-rose-500">Conta</span></>}

                description="Esta ação não pode ser desfeita. Isso excluirá permanentemente o registro e seus pagamentos vinculados."

                confirmLabel="Excluir"

                onConfirm={handleDeleteConfirm}

            />



            <CarneOptionsModal

                isOpen={isCarneOptionsOpen}

                onClose={() => setIsCarneOptionsOpen(false)}

                onConfirm={(options) => {

                    const receitas = contas

                        .filter(c => selectedContas.includes(c.id) && c.tipo === 'receita')

                        .map(c => c.id);

                    emitirCarne(receitas, options).finally(() => setIsCarneOptionsOpen(false));

                }}

                isGenerating={isGeneratingCarne}

            />

                </TabsContent>



                <TabsContent value="categorias" className="focus-visible:outline-none focus-visible:ring-0">

                    <CategoriasTab />

                </TabsContent>

            </Tabs>

        </div>

    );

};



export default FinanceiroPage;
