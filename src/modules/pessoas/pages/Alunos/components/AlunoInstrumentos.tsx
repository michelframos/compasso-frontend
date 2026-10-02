import React, { useEffect } from 'react';

import { Music, Plus, RotateCcw, HandHelping, Calendar, Info, FileText, Printer } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

import { Card, CardContent } from '@/shared/components/ui/card';

import { Badge } from '@/shared/components/ui/badge';

import { format } from 'date-fns';

import { ptBR } from 'date-fns/locale';

import { useAlunoInstrumentos } from '../hooks/useAlunoInstrumentos';

import type { Instrumento } from '../types';

import { useContratos } from '@/modules/financeiro';

import { useHasModulo } from '@/shared/hooks/useHasModulo';

import { useAlunoEmprestimoForm } from '../hooks/useAlunoEmprestimoForm';

import { Loader2 } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';

import { substituirPlaceholders } from '@/lib/contrato-utils';

import api from '@/shared/lib/axios';

import { printContract } from '@/lib/print-utils';

import {

    Dialog,

    DialogContent,

    DialogHeader,

    DialogTitle,

    DialogFooter,

} from "@/components/ui/dialog";

import {

    AlertDialog,

    AlertDialogAction,

    AlertDialogCancel,

    AlertDialogContent,

    AlertDialogDescription,

    AlertDialogFooter,

    AlertDialogHeader,

    AlertDialogTitle,

} from "@/components/ui/alert-dialog";

import { Label } from '@/shared/components/ui/label';

import { Input } from '@/shared/components/ui/input';



interface CategoriaContaBasico {

    id: number;

    nome: string;

    tipo: string;

}



interface AlunoInstrumentosProps {

    alunoId: number;

    instrumentos?: Instrumento[];

    onSuccess: () => void;

    isLoading?: boolean;

}



export const AlunoInstrumentos: React.FC<AlunoInstrumentosProps> = ({

    alunoId,

    instrumentos = [],

    onSuccess,

    isLoading = false

}) => {

    const {

        isLoanModalOpen,

        setIsLoanModalOpen,

        isReturnDialogOpen,

        setIsReturnDialogOpen,

        selectedInstrumento,

        setSelectedInstrumento,

        availableInstrumentos,

        isLoadingAvailable,

        fetchAvailableInstrumentos,

        handleReturn

    } = useAlunoInstrumentos(onSuccess);



    const hasFinanceiro = useHasModulo('financeiro');

    const { contratos, fetchContratos } = useContratos();

    const [selectedContratoId, setSelectedContratoId] = React.useState<string | null>(null);

    const [contratoGerado, setContratoGerado] = React.useState<string | null>(null);



    const [financeiroCategorias, setFinanceiroCategorias] = React.useState<CategoriaContaBasico[]>([]);

    const [isLoadingFinanceiro, setIsLoadingFinanceiro] = React.useState(false);



    const { form, handleSubmit, isLoading: isSubmitting } = useAlunoEmprestimoForm(() => {

        setIsLoanModalOpen(false);

        onSuccess();

    }, alunoId);



    const { register, watch, setValue, formState: { errors } } = form;

    const loanDate = watch('data_emprestimo');

    const gerarConta = watch('gerar_conta');



    useEffect(() => {

        const fetchCategorias = async () => {

            setIsLoadingFinanceiro(true);

            try {

                const response = await api.get('/categorias-contas');

                const categorias = response.data.data || [];

                setFinanceiroCategorias(categorias.filter((c: CategoriaContaBasico) => c.tipo === 'receita'));

            } catch (error) {

                console.error('Erro ao buscar categorias:', error);

            } finally {

                setIsLoadingFinanceiro(false);

            }

        };

        fetchCategorias();

    }, []);



    useEffect(() => {

        if (isLoanModalOpen) {

            fetchAvailableInstrumentos();

            if (hasFinanceiro) fetchContratos(1, 'nome', 'asc');

        }

    }, [isLoanModalOpen, fetchAvailableInstrumentos, fetchContratos, hasFinanceiro]);



    // Geração de Snapshot do Termo de Responsabilidade

    useEffect(() => {

        if (!selectedContratoId || selectedContratoId === "none" || !selectedInstrumento || !alunoId) {

            setContratoGerado(null);

            return;

        }



        const gerarSnapshot = async () => {

            try {

                const contrato = contratos.find(c => c.id === Number(selectedContratoId));

                if (!contrato) return;



                const alunoRes = await api.get(`/alunos/${alunoId}`);

                const alunoData = alunoRes.data.data;



                const conteudoGerado = substituirPlaceholders(contrato.conteudo, {

                    aluno: alunoData,

                    instrumento: selectedInstrumento,

                    data_emprestimo: loanDate

                });



                setContratoGerado(conteudoGerado);

            } catch (error) {

                console.error('Erro ao gerar snapshot do termo:', error);

            }

        };



        gerarSnapshot();

    }, [selectedContratoId, selectedInstrumento, alunoId, loanDate, contratos]);



    const onLoanConfirm = (e: React.FormEvent) => {

        e.preventDefault();

        handleSubmit(

            selectedContratoId && selectedContratoId !== "none" ? Number(selectedContratoId) : null,

            contratoGerado

        )(e);

    };



    const idConverter = (v: unknown) => {

        const num = Number(v);

        return isNaN(num) || num === 0 ? null : num;

    };



    return (

        <div className="space-y-6">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                <div>

                    <h3 className="text-lg font-bold text-zinc-900">Instrumentos Emprestados</h3>

                    <p className="text-sm text-zinc-500">Visualize e gerencie os instrumentos sob posse deste aluno.</p>

                </div>

                <Button

                    onClick={() => {

                        setSelectedInstrumento(null);

                        setSelectedContratoId(null);

                        setContratoGerado(null);

                        form.reset();

                        setIsLoanModalOpen(true);

                    }}

                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-9 px-4 gap-2 shadow-lg shadow-indigo-100 font-bold active:scale-95 transition-all text-xs hover:cursor-pointer"

                >

                    <Plus className="w-4 h-4" />

                    Novo Empréstimo

                </Button>

            </div>



            {isLoading ? (

                <div className="flex items-center justify-center py-12">

                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />

                </div>

            ) : instrumentos.length === 0 ? (

                <Card className="border-dashed border-2 border-zinc-200 shadow-none bg-transparent">

                    <CardContent className="flex flex-col items-center justify-center py-10 text-center">

                        <div className="p-3 bg-zinc-100 rounded-full text-zinc-400 mb-3">

                            <Music className="w-6 h-6" />

                        </div>

                        <h4 className="text-sm font-bold text-zinc-900">Nenhum instrumento com o aluno</h4>

                        <p className="text-xs text-zinc-500 max-w-[250px] mx-auto mt-1">

                            Este aluno não possui nenhum instrumento vinculado no momento.

                        </p>

                    </CardContent>

                </Card>

            ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {instrumentos.map((inst) => (

                        <Card key={inst.id} className="overflow-hidden border-zinc-100 shadow-sm hover:shadow-md transition-all group">

                            <CardContent className="p-4">

                                <div className="flex items-start justify-between gap-4">

                                    <div className="flex items-center gap-3">

                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">

                                            <Music className="w-5 h-5" />

                                        </div>

                                        <div>

                                            <h4 className="text-sm font-bold text-zinc-900 leading-none">{inst.nome}</h4>

                                            <p className="text-[11px] text-zinc-500 mt-1 uppercase tracking-wider">{inst.tipo}</p>

                                        </div>

                                    </div>

                                    <Badge className="bg-amber-50 text-amber-600 border-amber-100 px-2.5 rounded-full font-bold text-[10px] gap-1 shrink-0">

                                        <HandHelping className="w-3 h-3" /> Emprestado

                                    </Badge>

                                </div>



                                <div className="mt-4 pt-4 border-t border-zinc-50 space-y-2">

                                    <div className="flex items-center gap-2 text-[11px] text-zinc-600">

                                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />

                                        <span className="font-medium text-zinc-400">Emprestado em:</span>

                                        <span className="font-bold">{inst.data_emprestimo ? format(new Date(inst.data_emprestimo), 'dd/MM/yyyy', { locale: ptBR }) : '-'}</span>

                                    </div>

                                    {inst.numero_serie && (

                                        <div className="flex items-center gap-2 text-[11px] text-zinc-600">

                                            <Info className="w-3.5 h-3.5 text-zinc-400" />

                                            <span className="font-medium text-zinc-400">Nº de Série:</span>

                                            <span className="font-bold">{inst.numero_serie}</span>

                                        </div>

                                    )}

                                </div>



                                <div className="mt-4 pt-3 border-t border-zinc-50 flex justify-end">

                                    <Button

                                        variant="ghost"

                                        size="sm"

                                        onClick={() => {

                                            setSelectedInstrumento(inst);

                                            setIsReturnDialogOpen(true);

                                        }}

                                        className="h-8 rounded-full text-emerald-600 hover:bg-emerald-50 font-bold px-4 hover:cursor-pointer gap-2 text-[12px]"

                                    >

                                        <RotateCcw className="w-3.5 h-3.5" />

                                        Registrar Devolução

                                    </Button>



                                    {inst.contrato_gerado && (

                                        <Button

                                            variant="ghost"

                                            size="sm"

                                            onClick={() => {

                                                const conteudoFinal = substituirPlaceholders(inst.contrato_gerado!, {

                                                    instrumento: inst,

                                                    data_emprestimo: inst.data_emprestimo || undefined

                                                });

                                                printContract(conteudoFinal, `Termo de Responsabilidade - ${inst.nome}`);

                                            }}

                                            className="h-8 rounded-full text-indigo-600 hover:bg-indigo-50 font-bold px-4 hover:cursor-pointer gap-2 text-[12px]"

                                        >

                                            <Printer className="w-4 h-4" />

                                            Imprimir Termo

                                        </Button>

                                    )}

                                </div>

                            </CardContent>

                        </Card>

                    ))}

                </div>

            )}



            {/* Modal de Empréstimo */}

            <Dialog open={isLoanModalOpen} onOpenChange={setIsLoanModalOpen}>

                <DialogContent className="max-w-md p-0 overflow-hidden border-none rounded-[32px] shadow-2xl">

                    <DialogHeader className=" bg-white shrink-0">

                        <DialogTitle className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-3">

                            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">

                                <HandHelping className="w-5 h-5 text-white" />

                            </div>

                            Novo Empréstimo

                        </DialogTitle>

                    </DialogHeader>



                    <form onSubmit={onLoanConfirm} className="flex flex-col">

                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">

                            <div className="space-y-4">

                                <div className="space-y-2">

                                    <Label className="text-zinc-700 font-medium ml-1">Instrumento Disponível *</Label>

                                    <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">

                                        {isLoadingAvailable ? (

                                            <div className="flex items-center justify-center py-4">

                                                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />

                                            </div>

                                        ) : availableInstrumentos.length === 0 ? (

                                            <p className="text-xs text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-100">

                                                Não há instrumentos disponíveis para empréstimo no momento.

                                            </p>

                                        ) : (

                                            availableInstrumentos.map((inst) => (

                                                <button

                                                    key={inst.id}

                                                    type="button"

                                                    onClick={() => {

                                                        setSelectedInstrumento(inst);

                                                        setValue('id_instrumento', String(inst.id));

                                                    }}

                                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left group ${selectedInstrumento?.id === inst.id

                                                            ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'

                                                            : 'border-zinc-100 bg-zinc-50/50 hover:border-zinc-200'

                                                        }`}

                                                >

                                                    <div className="flex items-center gap-3">

                                                        <div className={`p-2 rounded-lg transition-colors ${selectedInstrumento?.id === inst.id ? 'bg-indigo-600 text-white' : 'bg-white text-zinc-400 group-hover:text-indigo-600 border border-zinc-100'

                                                            }`}>

                                                            <Music className="w-4 h-4" />

                                                        </div>

                                                        <div>

                                                            <p className="text-sm font-bold text-zinc-900">{inst.nome}</p>

                                                            <p className="text-[10px] text-zinc-500 uppercase">{inst.tipo}</p>

                                                        </div>

                                                    </div>

                                                </button>

                                            ))

                                        )}

                                    </div>

                                    {errors.id_instrumento && <p className="text-[11px] text-rose-500 ml-1">{errors.id_instrumento.message}</p>}

                                </div>



                                {selectedInstrumento && (

                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">

                                        <Label htmlFor="data_emprestimo" className="text-zinc-700 font-medium ml-1">Data do Empréstimo *</Label>

                                        <Input

                                            id="data_emprestimo"

                                            type="date"

                                            {...register('data_emprestimo')}

                                            className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"

                                        />

                                        {errors.data_emprestimo && <p className="text-[11px] text-rose-500 ml-1">{errors.data_emprestimo.message}</p>}

                                    </div>

                                )}



                                {hasFinanceiro && (

                                <>

                                <div className="space-y-2">

                                    <Label htmlFor="contrato_id" className="text-zinc-700 font-medium ml-1">Termo de Responsabilidade (Opcional)</Label>

                                    <Select

                                        onValueChange={(value) => setSelectedContratoId(value)}

                                        value={selectedContratoId || "none"}

                                    >

                                        <SelectTrigger className="h-11 rounded-xl border-zinc-200 focus:ring-indigo-600">

                                            <SelectValue placeholder="Selecione um termo" />

                                        </SelectTrigger>

                                        <SelectContent>

                                            <SelectItem value="none">Nenhum termo associado</SelectItem>

                                            {contratos.map((contrato) => (

                                                <SelectItem key={contrato.id} value={contrato.id.toString()}>

                                                    {contrato.nome}

                                                </SelectItem>

                                            ))}

                                        </SelectContent>

                                    </Select>

                                    <p className="text-[11px] text-zinc-400 ml-1 italic">

                                        O termo será gerado com os dados do aluno e do instrumento.

                                    </p>

                                </div>



                                {contratoGerado && (

                                    <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-xl border border-indigo-100 animate-in fade-in slide-in-from-top-1">

                                        <FileText className="w-5 h-5 text-indigo-600" />

                                        <div className="flex flex-col">

                                            <span className="text-xs font-bold text-indigo-900">Termo Processado</span>

                                            <span className="text-[11px] text-indigo-700">O snapshot do termo foi gerado com sucesso.</span>

                                        </div>

                                    </div>

                                )}



                                {/* Seção Financeira */}

                                <div className="space-y-4 p-6 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 mt-2">

                                    <div className="flex items-center justify-between">

                                        <div className="space-y-0.5">

                                            <Label className="text-sm font-bold text-indigo-900">Gerar Conta a Receber?</Label>

                                            <p className="text-[11px] text-indigo-600/70">Marque para criar uma cobrança automática para este empréstimo.</p>

                                        </div>

                                        <input

                                            type="checkbox"

                                            {...register('gerar_conta')}

                                            className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"

                                        />

                                    </div>



                                    {gerarConta && (

                                        <div className="grid grid-cols-1 gap-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">

                                            <div className="grid grid-cols-2 gap-4">

                                                <div className="space-y-2">

                                                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Valor (R$)</Label>

                                                    <Input

                                                        type="number"

                                                        step="0.01"

                                                        {...register('valor_conta', { valueAsNumber: true })}

                                                        className="h-10 rounded-xl border-zinc-200 focus:ring-indigo-600"

                                                        placeholder="0,00"

                                                    />

                                                    {errors.valor_conta && <p className="text-[10px] text-rose-500 font-medium ml-1">{errors.valor_conta.message}</p>}

                                                </div>



                                                <div className="space-y-2">

                                                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Vencimento</Label>

                                                    <Input

                                                        type="date"

                                                        {...register('data_vencimento_conta')}

                                                        className="h-10 rounded-xl border-zinc-200 focus:ring-indigo-600"

                                                    />

                                                </div>

                                            </div>



                                            <div className="space-y-2">

                                                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">Categoria</Label>

                                                {isLoadingFinanceiro ? (

                                                    <div className="h-10 flex items-center justify-center">

                                                        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />

                                                    </div>

                                                ) : (

                                                    <select

                                                        {...register('id_categoria_conta', { setValueAs: idConverter })}

                                                        className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-600 outline-none overflow-hidden"

                                                        defaultValue=""

                                                    >

                                                        <option value="">Selecione...</option>

                                                        {financeiroCategorias.map((cat) => (

                                                            <option key={cat.id} value={cat.id}>{cat.nome}</option>

                                                        ))}

                                                    </select>

                                                )}

                                            </div>

                                        </div>

                                    )}

                                </div>

                                </>

                                )}

                            </div>

                        </div>



                        <DialogFooter className="gap-3 bg-zinc-50/50">

                            <Button

                                variant="ghost"

                                type="button"

                                onClick={() => setIsLoanModalOpen(false)}

                                className="rounded-full px-6 h-10 font-bold hover:bg-zinc-100 hover:cursor-pointer"

                                disabled={isSubmitting}

                            >

                                Cancelar

                            </Button>

                            <Button

                                type="submit"

                                disabled={!selectedInstrumento || isSubmitting}

                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 h-10 font-bold shadow-lg shadow-indigo-100 transition-all hover:cursor-pointer active:scale-95 disabled:opacity-50"

                            >

                                {isSubmitting ? (

                                    <>

                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />

                                        Processando...

                                    </>

                                ) : (

                                    'Confirmar Empréstimo'

                                )}

                            </Button>

                        </DialogFooter>

                    </form>

                </DialogContent>

            </Dialog>



            {/* Alerta de Devolução */}

            <AlertDialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>

                <AlertDialogContent className="rounded-[24px] p-8 border-none shadow-2xl transition-all">

                    <AlertDialogHeader>

                        <AlertDialogTitle className="text-xl font-bold text-zinc-900">Registrar Devolução</AlertDialogTitle>

                        <AlertDialogDescription className="text-zinc-500">

                            Confirmar a devolução do instrumento <span className="font-bold text-zinc-900">{selectedInstrumento?.nome}</span>?

                            O instrumento voltará a ficar disponível para novos empréstimos.

                        </AlertDialogDescription>

                    </AlertDialogHeader>

                    <AlertDialogFooter className="gap-2 mt-6">

                        <AlertDialogCancel className="rounded-full px-6 h-9 border-zinc-200 font-bold hover:bg-zinc-50 hover:cursor-pointer">Cancelar</AlertDialogCancel>

                        <AlertDialogAction

                            onClick={() => selectedInstrumento && handleReturn(selectedInstrumento.id)}

                            className="rounded-full px-6 h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-100 hover:cursor-pointer transition-all"

                        >

                            Confirmar Devolução

                        </AlertDialogAction>

                    </AlertDialogFooter>

                </AlertDialogContent>

            </AlertDialog>

        </div>

    );

};
