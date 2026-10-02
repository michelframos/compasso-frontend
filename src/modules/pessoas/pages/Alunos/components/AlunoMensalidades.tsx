import React from 'react';

import {

    Table,

    TableBody,

    TableCell,

    TableHead,

    TableHeader,

    TableRow,

} from '@/shared/components/ui/table';

import { Badge } from '@/shared/components/ui/badge';

import { Card, CardContent } from '@/shared/components/ui/card';

import { Button } from '@/shared/components/ui/button';

import { Plus, ReceiptText, CheckCircle2, Clock, AlertCircle, Loader2, Calendar } from 'lucide-react';

import { ContaModal } from '@/modules/financeiro';

import type { Aluno, Conta } from '../types';

import { descreverMatricula } from '../utils/matricula';

import { format } from 'date-fns';

import { ptBR } from 'date-fns/locale';



interface AlunoMensalidadesProps {

    aluno?: Aluno;

    isLoading?: boolean;

    onSuccess?: () => void;

}



export const AlunoMensalidades: React.FC<AlunoMensalidadesProps> = ({ aluno, isLoading, onSuccess }) => {

    const [isFormOpen, setIsFormOpen] = React.useState(false);

    const lancamentoModal = (
        <ContaModal
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            tipoFluxo="receita"
            id_aluno={aluno?.id}
            title={<>Novo <span className="text-indigo-600">Lançamento</span></>}
            description="Crie uma nova cobrança ou mensalidade para este aluno."
            onSuccess={() => onSuccess?.()}
        />
    );



    if (isLoading) {

        return (

            <div className="flex flex-col items-center justify-center py-12 gap-3">

                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />

                <p className="text-sm text-zinc-500 font-medium">Carregando mensalidades...</p>

            </div>

        );

    }



    const matriculas = aluno?.matriculas || [];

    const contasAvulsas = aluno?.contas?.filter(c => !c.id_matricula) || [];



    const getStatusBadge = (status: Conta['status']) => {

        switch (status) {

            case 'pago':

                return (

                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50 shadow-none flex items-center gap-1">

                        <CheckCircle2 className="w-3 h-3" /> Pago

                    </Badge>

                );

            case 'atrasado':

                return (

                    <Badge className="bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-50 shadow-none flex items-center gap-1">

                        <AlertCircle className="w-3 h-3" /> Atrasado

                    </Badge>

                );

            case 'pendente':

                return (

                    <Badge className="bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-50 shadow-none flex items-center gap-1">

                        <Clock className="w-3 h-3" /> Pendente

                    </Badge>

                );

            case 'cancelado':

                return (

                    <Badge className="bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-100 shadow-none">

                        Cancelado

                    </Badge>

                );

            default:

                return <Badge variant="outline">{status}</Badge>;

        }

    };



    const formatCurrency = (value: number) => {

        return new Intl.NumberFormat('pt-BR', {

            style: 'currency',

            currency: 'BRL',

        }).format(value);

    };



    const renderContasTable = (contas: Conta[]) => (

        <div className="overflow-hidden">

            {/* Desktop Table View */}

            <div className="hidden md:block">

                <Table>

                    <TableHeader>

                        <TableRow className="hover:bg-transparent border-zinc-100">

                            <TableHead className="w-[30%] pl-6">Descrição</TableHead>

                            <TableHead>Vencimento</TableHead>

                            <TableHead>Referência</TableHead>

                            <TableHead>Valor</TableHead>

                            <TableHead>Status</TableHead>

                            <TableHead className="text-right pr-6">Pagamento</TableHead>

                        </TableRow>

                    </TableHeader>

                    <TableBody>

                        {contas.map((conta) => (

                            <TableRow key={conta.id} className="group hover:bg-indigo-50/30 transition-colors border-zinc-50">

                                <TableCell className="font-medium text-zinc-900 pl-6">

                                    <div className="flex flex-col">

                                        <span>{conta.descricao}</span>

                                        {conta.numero_parcela && (

                                            <span className="text-[11px] text-zinc-500 font-normal">

                                                Parcela {conta.numero_parcela} de {conta.quantidade_parcelas}

                                            </span>

                                        )}

                                    </div>

                                </TableCell>

                                <TableCell className="text-zinc-600">

                                    {format(new Date(conta.data_vencimento), 'dd/MM/yyyy')}

                                </TableCell>

                                <TableCell className="text-zinc-600 capitalize">

                                    {conta.mes_referencia ? (

                                        format(new Date(conta.ano_referencia!, conta.mes_referencia - 1), 'MMMM/yyyy', { locale: ptBR })

                                    ) : '-'}

                                </TableCell>

                                <TableCell className="font-bold text-zinc-900">

                                    {formatCurrency(conta.valor)}

                                </TableCell>

                                <TableCell>

                                    {getStatusBadge(conta.status)}

                                </TableCell>

                                <TableCell className="text-right pr-6">

                                    {conta.data_pagamento ? (

                                        <div className="flex flex-col items-end">

                                            <span className="text-zinc-900 font-medium">{format(new Date(conta.data_pagamento), 'dd/MM/yyyy')}</span>

                                            {conta.saldo_devedor > 0 && (

                                                <span className="text-[11px] text-rose-500">Saldo: {formatCurrency(conta.saldo_devedor)}</span>

                                            )}

                                        </div>

                                    ) : (

                                        <span className="text-zinc-400">---</span>

                                    )}

                                </TableCell>

                            </TableRow>

                        ))}

                    </TableBody>

                </Table>

            </div>



            {/* Mobile Cards View */}

            <div className="md:hidden space-y-3 p-4">

                {contas.map((conta) => (

                    <Card key={conta.id} className="overflow-hidden border-zinc-100 shadow-sm hover:shadow-md transition-all group active:scale-[0.98]">

                        <CardContent className="p-0">

                            {/* Header do Card */}

                            <div className="p-4 border-b border-zinc-50 bg-zinc-50/30">

                                <div className="flex items-start justify-between gap-3">

                                    <div className="flex-1 min-w-0">

                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">

                                            {getStatusBadge(conta.status)}

                                            {conta.numero_parcela && (

                                                <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm border border-indigo-100/50">

                                                    Parc. {conta.numero_parcela}/{conta.quantidade_parcelas}

                                                </span>

                                            )}

                                        </div>

                                        <h3 className="text-sm font-bold text-zinc-900 leading-snug break-words">

                                            {conta.descricao}

                                        </h3>

                                    </div>

                                    <div className="text-right shrink-0">

                                        <p className="text-base font-black text-indigo-600">

                                            {formatCurrency(conta.valor)}

                                        </p>

                                        <p className="text-[10px] font-bold text-zinc-400 mt-0.5 uppercase tracking-wider">

                                            ID: #{conta.id}

                                        </p>

                                    </div>

                                </div>

                            </div>



                            {/* Detalhes do Card */}

                            <div className="p-4 grid grid-cols-2 gap-4">

                                <div className="space-y-1">

                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none flex items-center gap-1">

                                        <Calendar className="w-2.5 h-2.5" /> Vencimento

                                    </p>

                                    <p className="text-xs font-bold text-zinc-700">

                                        {format(new Date(conta.data_vencimento), 'dd/MM/yyyy')}

                                    </p>

                                </div>



                                <div className="space-y-1">

                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">Referência</p>

                                    <p className="text-xs font-bold text-zinc-700 capitalize">

                                        {conta.mes_referencia ? (

                                            format(new Date(conta.ano_referencia!, conta.mes_referencia - 1), 'MMMM/yyyy', { locale: ptBR })

                                        ) : '-'}

                                    </p>

                                </div>



                                {conta.data_pagamento && (

                                    <div className="col-span-2 mt-1 p-2 bg-emerald-50/50 rounded-xl border border-emerald-100 border-dashed flex items-center gap-2">

                                        <div className="p-1 bg-white rounded-lg shadow-sm">

                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />

                                        </div>

                                        <p className="text-[10px] font-black text-emerald-700 uppercase tracking-tight">

                                            Pago em: <span className="ml-0.5">{format(new Date(conta.data_pagamento), 'dd/MM/yyyy')}</span>

                                        </p>

                                    </div>

                                )}



                                {!conta.data_pagamento && (

                                    <div className="col-span-2 mt-1 p-2 bg-amber-50/50 rounded-xl border border-amber-100 border-dashed flex items-center gap-2">

                                        <div className="p-1 bg-white rounded-lg shadow-sm">

                                            <Clock className="w-3 h-3 text-amber-500" />

                                        </div>

                                        <p className="text-[10px] font-black text-amber-700 uppercase tracking-tight">

                                            Aguardando Pagamento

                                        </p>

                                    </div>

                                )}

                            </div>



                            {/* Alerta de Saldo Devedor */}

                            {conta.saldo_devedor > 0 && conta.data_pagamento && (

                                <div className="mx-4 mb-4 px-3 py-2 bg-rose-50 rounded-xl border border-rose-100 border-dashed flex items-center gap-2 group-hover:bg-rose-100/50 transition-colors">

                                    <div className="p-1 bg-white rounded-lg shadow-sm">

                                        <AlertCircle className="w-3 h-3 text-rose-500" />

                                    </div>

                                    <p className="text-[10px] font-black text-rose-700 uppercase tracking-tight">

                                        Saldo Devedor: <span className="ml-1 text-xs">{formatCurrency(conta.saldo_devedor)}</span>

                                    </p>

                                </div>

                            )}

                        </CardContent>

                    </Card>

                ))}

            </div>

        </div>

    );



    if (matriculas.length === 0 && contasAvulsas.length === 0) {

        return (

            <div className="space-y-6">

                <div className="flex justify-end pr-2">

                    <Button

                        type="button"

                        onClick={() => setIsFormOpen(true)}

                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-9 px-5 gap-2 shadow-lg shadow-indigo-100 font-bold active:scale-95 transition-all text-sm hover:cursor-pointer w-full md:w-auto"

                    >

                        <Plus className="w-4 h-4" />

                        Novo Lançamento

                    </Button>

                </div>



                <div className="flex flex-col items-center justify-center py-12 text-center">

                    <div className="p-4 bg-zinc-100 rounded-full text-zinc-400 mb-4">

                        <ReceiptText className="w-8 h-8" />

                    </div>

                    <h3 className="text-lg font-bold text-zinc-900">Nenhuma mensalidade encontrada</h3>

                    <p className="text-zinc-500 max-w-xs mx-auto mt-1 text-sm">

                        Este aluno ainda não possui lançamentos ou mensalidades no sistema.

                    </p>

                </div>



                {lancamentoModal}

            </div>

        );

    }



    return (

        <div className="space-y-6 p-1">

            <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">

                <Button

                    type="button"

                    onClick={() => setIsFormOpen(true)}

                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-9 px-5 gap-2 shadow-lg shadow-indigo-100 font-bold active:scale-95 transition-all text-sm hover:cursor-pointer"

                >

                    <Plus className="w-4 h-4" />

                    Novo Lançamento

                </Button>

            </div>



            {contasAvulsas.length > 0 && (

                <Card className="border border-zinc-100 shadow-sm overflow-hidden">

                    <div className="bg-zinc-50/50 px-6 py-4 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">

                        <div className="flex-1">

                            <div className="flex items-center gap-2 mb-1">

                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">

                                    Avulso / Outros

                                </span>

                            </div>

                            <h4 className="text-base font-bold text-zinc-900">

                                Lançamentos Financeiros Diretos

                            </h4>

                            <p className="text-[11px] text-zinc-400 mt-1">Cobranças não vinculadas a matrículas específicas</p>

                        </div>

                    </div>

                    <CardContent className="p-0">

                        {renderContasTable(contasAvulsas)}

                    </CardContent>

                </Card>

            )}



            {matriculas.map((matricula) => {

                const descricao = descreverMatricula(matricula);

                return (

                <Card key={matricula.id} className="border border-zinc-100 shadow-sm overflow-hidden">

                    <div className="bg-zinc-50/50 px-6 py-4 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">

                        <div className="flex-1">

                            <div className="flex flex-wrap items-center gap-2 mb-1">

                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${descricao.isCurso ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>

                                    {descricao.tipoLabel}

                                </span>

                                {descricao.nivel && (

                                    <span className="px-2 py-0.5 bg-zinc-200 text-zinc-700 text-[10px] font-bold rounded-full uppercase tracking-wider">

                                        {descricao.nivel}

                                    </span>

                                )}

                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${matricula.status === 'ativa'

                                    ? 'bg-emerald-100 text-emerald-700'

                                    : 'bg-zinc-100 text-zinc-500'

                                    }`}>

                                    {matricula.status || 'Pendente'}

                                </span>

                            </div>

                            <h4 className="text-base font-bold text-zinc-900">

                                {descricao.titulo}

                            </h4>

                            {descricao.subtitulo && (

                                <p className="text-xs font-medium text-zinc-500">{descricao.subtitulo}</p>

                            )}

                            <p className="text-[11px] text-zinc-400 mt-1">

                                {descricao.professor && <>Professor: <span className="font-semibold text-zinc-500">{descricao.professor}</span> • </>}

                                Matrícula: {format(new Date(`${matricula.data.substring(0, 10)}T00:00:00`), 'dd/MM/yyyy')}

                            </p>

                        </div>

                    </div>

                    <CardContent className="p-0">

                        {!matricula.contas || matricula.contas.length === 0 ? (

                            <div className="p-8 text-center text-zinc-400 text-sm italic">

                                Nenhuma mensalidade encontrada para esta matrícula.

                            </div>

                        ) : (

                            renderContasTable(matricula.contas)

                        )}

                    </CardContent>

                </Card>

                );

            })}



            {lancamentoModal}

        </div>

    );

};
