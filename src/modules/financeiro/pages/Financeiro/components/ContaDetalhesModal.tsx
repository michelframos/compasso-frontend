import React, { useState } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog';

import { Info, Wallet, FileText, CheckCircle2, Clock, XCircle, AlertCircle, Calendar, Hash, DollarSign, Tag, Trash2 } from 'lucide-react';

import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog';

import { toast } from 'sonner';

import { getErrorMessage } from '@/shared/lib/utils';

import { useContas } from '../hooks/useContas';

import type { Conta } from '../types';



interface ContaDetalhesModalProps {

    conta: Conta | undefined;

    isOpen: boolean;

    onClose: () => void;

    onPagamentoDeleted?: () => void;

}



export const ContaDetalhesModal: React.FC<ContaDetalhesModalProps> = ({ conta, isOpen, onClose, onPagamentoDeleted }) => {

    const [activeTab, setActiveTab] = useState<'geral' | 'pagamentos'>('geral');

    const [deletingPagamentoId, setDeletingPagamentoId] = useState<number | null>(null);

    const { deletePagamento } = useContas();



    // Reset tab when context changes

    React.useEffect(() => {

        if (isOpen) {

            setActiveTab('geral');

        }

    }, [isOpen]);



    if (!conta) return null;



    const formatCurrency = (value: number) => {

        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    };



    const formatDate = (dateString: string) => {

        return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

    };



    const statusColors: Record<string, string> = {

        'pendente': 'bg-amber-100 text-amber-700 border-amber-200',

        'pago': 'bg-emerald-100 text-emerald-700 border-emerald-200',

        'atrasado': 'bg-rose-100 text-rose-700 border-rose-200',

        'cancelado': 'bg-zinc-100 text-zinc-500 border-zinc-200'

    };



    const statusIcons: Record<string, React.ReactNode> = {

        'pendente': <Clock className="w-4 h-4 text-amber-600" />,

        'pago': <CheckCircle2 className="w-4 h-4 text-emerald-600" />,

        'atrasado': <AlertCircle className="w-4 h-4 text-rose-600" />,

        'cancelado': <XCircle className="w-4 h-4 text-zinc-500" />

    };



    const statusDict: Record<string, string> = {

        'pendente': 'Pendente',

        'pago': 'Pago',

        'atrasado': 'Atrasado',

        'cancelado': 'Cancelado'

    };





    const handleDeleteConfirm = async () => {

        if (!deletingPagamentoId) return;

        try {

            await deletePagamento(deletingPagamentoId);

            toast.success('Pagamento excluído com sucesso!');

            if (onPagamentoDeleted) {

                onPagamentoDeleted();

            }

        } catch (err: unknown) {

            console.error('Delete pagamento error:', err);

            toast.error(getErrorMessage(err, 'Erro ao excluir pagamento.'));

        } finally {

            setDeletingPagamentoId(null);

        }

    };



    return (

        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>

            <DialogContent className="sm:max-w-[700px] p-0 rounded-[24px] border-none shadow-2xl flex flex-col max-h-[90vh]">

                <DialogHeader className="shrink-0">

                    <div className="flex flex-col md:flex-row items-start justify-between">

                        <div>

                            <DialogTitle className="text-2xl font-bold text-zinc-900 flex flex-col md:flex-row items-center gap-3">

                                Detalhes da <span className={conta.tipo === 'receita' ? "text-emerald-600" : "text-rose-600"}>

                                    {conta.tipo === 'receita' ? 'Receita' : 'Despesa'}

                                </span>

                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusColors[conta.status]}`}>

                                    {statusIcons[conta.status]}

                                    {statusDict[conta.status] || conta.status}

                                </span>

                            </DialogTitle>

                            <DialogDescription className="text-zinc-500 mt-1">

                                Visualize as informações completas e o histórico de pagamentos desta movimentação.

                            </DialogDescription>

                        </div>

                        <div className={`p-4 rounded-2xl flex flex-col items-end ${conta.tipo === 'receita' ? 'bg-emerald-50' : 'bg-rose-50'} w-full md:w-auto`}>

                            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Valor Total</span>

                            <span className={`text-xl font-bold ${conta.tipo === 'receita' ? 'text-emerald-600' : 'text-rose-600'}`}>

                                {formatCurrency(conta.valor)}

                            </span>

                        </div>

                    </div>

                </DialogHeader>



                {/* Tabs Header */}

                <div className="flex flex-col px-8 pt-2 pb-0 bg-zinc-50/50 shrink-0 border-y border-zinc-100">

                    <div className="flex items-center gap-2">

                        <button

                            type="button"

                            onClick={() => setActiveTab('geral')}

                            className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer ${activeTab === 'geral'

                                ? 'border-indigo-600 text-indigo-600'

                                : 'border-transparent text-zinc-400 hover:text-zinc-600'

                                }`}

                        >

                            <FileText className="w-4 h-4" />

                            Informações Gerais

                        </button>

                        <button

                            type="button"

                            onClick={() => setActiveTab('pagamentos')}

                            className={`px-4 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer ${activeTab === 'pagamentos'

                                ? 'border-indigo-600 text-indigo-600'

                                : 'border-transparent text-zinc-400 hover:text-zinc-600'

                                }`}

                        >

                            <Wallet className="w-4 h-4" />

                            Pagamentos Registrados

                            {conta.pagamentos && conta.pagamentos.length > 0 && (

                                <span className="ml-1.5 bg-indigo-100 text-indigo-700 py-0.5 px-2 rounded-full text-xs font-bold">

                                    {conta.pagamentos.length}

                                </span>

                            )}

                        </button>

                    </div>

                </div>



                {/* Content Area */}

                <div className="flex-1 overflow-y-auto p-8 bg-zinc-50/30">

                    {activeTab === 'geral' ? (

                        <div className="space-y-6">

                            {/* Descrição e Categoria */}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                                <div>

                                    <h4 className="text-sm font-semibold text-zinc-500 mb-1 flex items-center gap-1.5"><FileText className="w-4 h-4" />Descrição</h4>

                                    <p className="text-zinc-900 font-medium text-lg">{conta.descricao}</p>

                                </div>

                                <div>

                                    <h4 className="text-sm font-semibold text-zinc-500 mb-1 flex items-center gap-1.5"><Tag className="w-4 h-4" />Categoria</h4>

                                    <div className="inline-flex">

                                        <span className="bg-zinc-100 text-zinc-700 px-3 py-1 rounded-lg text-sm font-medium border border-zinc-200">

                                            {conta.categoria?.nome || 'Sem categoria'}

                                        </span>

                                    </div>

                                </div>

                            </div>



                            {/* Detalhes de Valor e Data */}

                            <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-6">

                                <div>

                                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Valor</h4>

                                    <p className="text-zinc-900 font-bold">{formatCurrency(conta.valor)}</p>

                                </div>

                                <div>

                                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Vencimento</h4>

                                    <p className={`font-bold ${new Date(conta.data_vencimento) < new Date() && conta.status !== 'pago' ? 'text-rose-600' : 'text-zinc-900'}`}>

                                        {formatDate(conta.data_vencimento)}

                                    </p>

                                </div>

                                <div>

                                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Wallet className="w-3.5 h-3.5" /> Saldo Devedor</h4>

                                    <p className="text-zinc-900 font-bold">{formatCurrency(conta.saldo_devedor ?? conta.valor)}</p>

                                </div>

                                <div>

                                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Hash className="w-3.5 h-3.5" /> Parcela</h4>

                                    <p className="text-zinc-900 font-medium">

                                        {conta.numero_parcela ? `${conta.numero_parcela} de ${conta.quantidade_parcelas || '?'}` : 'Única'}

                                    </p>

                                </div>

                            </div>



                            {/* Referência e Vínculos */}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {(conta.mes_referencia || conta.ano_referencia) && (

                                    <div>

                                        <h4 className="text-sm font-semibold text-zinc-500 mb-1 flex items-center gap-1.5"><Calendar className="w-4 h-4" />Mês/Ano de Referência</h4>

                                        <p className="text-zinc-900 font-medium">

                                            {conta.mes_referencia ? `${conta.mes_referencia.toString().padStart(2, '0')}/` : ''}{conta.ano_referencia || '-'}

                                        </p>

                                    </div>

                                )}



                                {conta.id_aluno && (

                                    <div>

                                        <h4 className="text-sm font-semibold text-zinc-500 mb-1 flex items-center gap-1.5"><Info className="w-4 h-4" />Vínculo Aluno</h4>

                                        <p className="text-zinc-900 font-medium">{conta.aluno?.nome || `ID do Aluno: ${conta.id_aluno}`}</p>

                                    </div>

                                )}

                                {conta.id_professor && (

                                    <div>

                                        <h4 className="text-sm font-semibold text-zinc-500 mb-1 flex items-center gap-1.5"><Info className="w-4 h-4" />Vínculo Professor</h4>

                                        <p className="text-zinc-900 font-medium">{conta.professor?.nome || `ID do Professor: ${conta.id_professor}`}</p>

                                    </div>

                                )}

                            </div>



                            {/* Observações */}

                            {conta.observacoes && (

                                <div>

                                    <h4 className="text-sm font-semibold text-zinc-500 mb-2 flex items-center gap-1.5"><Info className="w-4 h-4" />Observações</h4>

                                    <div className="bg-white p-4 rounded-xl border border-zinc-100 text-sm text-zinc-700 whitespace-pre-wrap">

                                        {conta.observacoes}

                                    </div>

                                </div>

                            )}

                        </div>

                    ) : (

                        <div className="space-y-4">

                            {(!conta.pagamentos || conta.pagamentos.length === 0) ? (

                                <div className="flex flex-col items-center justify-center py-16 text-center">

                                    <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 mb-4">

                                        <Wallet className="w-8 h-8" />

                                    </div>

                                    <h3 className="text-lg font-bold text-zinc-900 mb-1">Nenhum pagamento registrado</h3>

                                    <p className="text-zinc-500 max-w-[280px] text-sm">Esta conta ainda não possui histórico de pagamentos.</p>

                                </div>

                            ) : (

                                <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm">

                                    <table className="w-full text-left border-collapse">

                                        <thead>

                                            <tr className="bg-zinc-50/80 border-b border-zinc-100">

                                                <th className="px-5 py-3 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Data</th>

                                                <th className="px-5 py-3 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Valor Pago</th>

                                                <th className="px-5 py-3 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Forma de Pag.</th>

                                                <th className="px-5 py-3 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Obs.</th>

                                                <th className="px-5 py-3 text-[11px] font-bold text-zinc-500 uppercase tracking-wider text-right">Ação</th>

                                            </tr>

                                        </thead>

                                        <tbody className="divide-y divide-zinc-50">

                                            {conta.pagamentos.map((pag, idx) => (

                                                <tr key={pag.id || idx} className="hover:bg-zinc-50/50 transition-colors">

                                                    <td className="px-5 py-3.5 text-sm font-medium text-zinc-900">

                                                        {formatDate(pag.data_pagamento)}

                                                    </td>

                                                    <td className="px-5 py-3.5 text-sm font-bold text-emerald-600">

                                                        {formatCurrency(pag.valor_pago)}

                                                    </td>

                                                    <td className="px-5 py-3.5">

                                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-zinc-100 text-zinc-700 text-xs font-medium border border-zinc-200 capitalize">

                                                            {pag.forma_pagamento.replace('_', ' ')}

                                                        </span>

                                                    </td>

                                                    <td className="px-5 py-3.5 text-xs text-zinc-500 max-w-[150px] truncate" title={pag.observacoes || ''}>

                                                        {pag.observacoes || '-'}

                                                    </td>

                                                    <td className="px-5 py-3.5 text-right">

                                                        <button

                                                            type="button"

                                                            onClick={() => setDeletingPagamentoId(pag.id)}

                                                            className="text-zinc-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-md transition-colors hover:cursor-pointer"

                                                            title="Excluir Pagamento"

                                                        >

                                                            <Trash2 className="w-4 h-4" />

                                                        </button>

                                                    </td>

                                                </tr>

                                            ))}

                                        </tbody>

                                        <tfoot className="bg-zinc-50/50 border-t border-zinc-100">

                                            <tr>

                                                <td className="px-5 py-3 text-sm font-bold text-zinc-700 text-right">Total Pago:</td>

                                                <td className="px-5 py-3 text-sm font-bold text-emerald-600" colSpan={3}>

                                                    {formatCurrency(conta.pagamentos.reduce((acc, curr) => acc + Number(curr.valor_pago), 0))}

                                                </td>

                                            </tr>

                                        </tfoot>

                                    </table>

                                </div>

                            )}

                        </div>

                    )}

                </div>

            </DialogContent>



            <ConfirmDeleteDialog

                open={!!deletingPagamentoId}

                onOpenChange={(open) => !open && setDeletingPagamentoId(null)}

                title={<>Excluir <span className="text-rose-500">Pagamento</span></>}

                description="Tem certeza que deseja excluir este pagamento? Esta ação também atualizará o status e o saldo da conta vinculada."

                confirmLabel="Excluir"

                onConfirm={handleDeleteConfirm}

                className="z-[60]"

            />

        </Dialog>

    );

};
