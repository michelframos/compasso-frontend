import React from 'react';

import { CalendarDays, Clock, Loader2, User, BookOpen, CheckCircle2, XCircle, CalendarClock, Plus, Pencil, Trash2, ClipboardCheck } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

import {

    Dialog,

    DialogContent,

} from '@/shared/components/ui/dialog';

import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog';

import { AulaModal } from './AulaModal';

import { AulaChamadaModal } from './AulaChamadaModal';

import { format } from 'date-fns';

import { ptBR } from 'date-fns/locale';

import { useTurmaAgendamentos } from '../hooks/useTurmaAgendamentos';

import type { AulaAgendamento } from '../hooks/useTurmaAgendamentos';

import api from '@/shared/lib/axios';

import { toast } from 'sonner';

import { getErrorMessage } from '@/shared/lib/utils';



interface TurmaAgendamentosProps {

    turmaId?: number;

    professorId?: number;

}



const TIPO_CONFIG = {

    regular: { label: 'Regular', className: 'bg-indigo-100 text-indigo-700 border-indigo-200' },

    reposicao: { label: 'Reposição', className: 'bg-amber-100 text-amber-700 border-amber-200' },

    reforco: { label: 'Reforço', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },

    extra: { label: 'Extra', className: 'bg-purple-100 text-purple-700 border-purple-200' },

};



const STATUS_CONFIG: Record<string, { icon: React.ReactNode; className: string; label: string }> = {

    agendada: {

        icon: <CalendarClock className="w-3 h-3" />,

        className: 'bg-blue-50 text-blue-600 border-blue-100',

        label: 'Agendada',

    },

    concluida: {

        icon: <CheckCircle2 className="w-3 h-3" />,

        className: 'bg-emerald-50 text-emerald-600 border-emerald-100',

        label: 'Concluída',

    },

    cancelada: {

        icon: <XCircle className="w-3 h-3" />,

        className: 'bg-rose-50 text-rose-600 border-rose-100',

        label: 'Cancelada',

    },

};



export const TurmaAgendamentos: React.FC<TurmaAgendamentosProps> = ({ turmaId, professorId }) => {

    const { agendamentos, isLoading, refetch } = useTurmaAgendamentos(turmaId);

    const [isFormOpen, setIsFormOpen] = React.useState(false);

    const [selectedAula, setSelectedAula] = React.useState<AulaAgendamento | null>(null);

    const [aulaToDelete, setAulaToDelete] = React.useState<AulaAgendamento | null>(null);

    const [isDeleting, setIsDeleting] = React.useState(false);

    

    // Estado para controle da modal de Chamada

    const [selectedChamadaAula, setSelectedChamadaAula] = React.useState<AulaAgendamento | null>(null);

    const [isChamadaOpen, setIsChamadaOpen] = React.useState(false);



    const handleEdit = (aula: AulaAgendamento) => {

        setSelectedAula(aula);

        setIsFormOpen(true);

    };



    const handleDelete = async () => {

        if (!aulaToDelete) return;



        setIsDeleting(true);

        try {

            await api.delete(`/aulas-turmas/${aulaToDelete.id}`);

            toast.success('Agendamento excluído com sucesso!');

            refetch();

        } catch (error: unknown) {

            toast.error(getErrorMessage(error, 'Erro ao excluir agendamento'));

        } finally {

            setIsDeleting(false);

            setAulaToDelete(null);

        }

    };



    const handleNew = () => {

        setSelectedAula(null);

        setIsFormOpen(true);

    };



    const handleChamada = (aula: AulaAgendamento) => {

        setSelectedChamadaAula(aula);

        setIsChamadaOpen(true);

    };

    const aulaModal = (
        <AulaModal
            open={isFormOpen}
            onOpenChange={(open) => {
                setIsFormOpen(open);
                if (!open) setSelectedAula(null);
            }}
            initialData={selectedAula ? {
                ...selectedAula,
                status: selectedAula.status || undefined,
                conteudo_dado: selectedAula.conteudo_dado || undefined,
                conta: selectedAula.conta
                    ? { ...selectedAula.conta, status: selectedAula.conta.status_pagamento }
                    : undefined,
            } : { status: 'agendada', tipo: 'regular' }}
            defaultTurmaId={turmaId}
            defaultProfessorId={professorId}
            onSuccess={() => {
                setSelectedAula(null);
                refetch();
            }}
        />
    );



    if (isLoading) {

        return (

            <div className="flex flex-col items-center justify-center py-12 gap-3">

                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />

                <p className="text-sm text-zinc-500 font-medium">Carregando agendamentos...</p>

            </div>

        );

    }



    if (agendamentos.length === 0) {

        return (

            <div className="space-y-6">

                <div className="flex justify-end pr-2">

                    <Button

                        type="button"

                        onClick={handleNew}

                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-9 px-5 gap-2 shadow-lg shadow-indigo-100 font-bold active:scale-95 transition-all text-sm hover:cursor-pointer"

                    >

                        <Plus className="w-4 h-4" />

                        Novo Agendamento

                    </Button>

                </div>



                <div className="flex flex-col items-center justify-center py-12 text-center">

                    <div className="p-4 bg-zinc-100 rounded-full text-zinc-400 mb-4">

                        <CalendarDays className="w-8 h-8" />

                    </div>

                    <h3 className="text-lg font-bold text-zinc-900">Nenhum agendamento encontrado</h3>

                    <p className="text-zinc-500 max-w-xs mx-auto mt-1 text-sm">

                        Esta turma não possui aulas agendadas no sistema.

                    </p>

                </div>



                {aulaModal}

            </div>

        );

    }



    // Agrupar por mês/ano

    const grouped = agendamentos.reduce<Record<string, typeof agendamentos>>((acc, aula) => {

        const key = format(new Date(aula.data + 'T00:00:00'), 'MMMM yyyy', { locale: ptBR });

        if (!acc[key]) acc[key] = [];

        acc[key].push(aula);

        return acc;

    }, {});



    const getStudentName = (aula: AulaAgendamento) => {

        if (aula.aluno_especifico?.usuario?.nome) {

            return aula.aluno_especifico.usuario.nome;

        }

        if (aula.turma?.matriculas && aula.turma.matriculas.length > 0) {

            if (['reposicao', 'reforco'].includes(aula.tipo) || aula.turma.matriculas.length === 1) {

                return aula.turma.matriculas[0]?.aluno?.usuario?.nome;

            }

        }

        return 'Toda a Turma';

    };



    return (

        <div className="space-y-6 p-1">

            <div className="flex justify-end z-10 py-1">

                <Button

                    type="button"

                    onClick={handleNew}

                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-9 px-5 gap-2 shadow-lg shadow-indigo-100 font-bold active:scale-95 transition-all text-sm hover:cursor-pointer w-full md:w-auto"

                >

                    <Plus className="w-4 h-4" />

                    Novo Agendamento

                </Button>

            </div>



            {Object.entries(grouped).map(([mesAno, aulas]) => (

                <div key={mesAno}>

                    {/* Cabeçalho do mês */}

                    <div className="flex items-center gap-3 mb-3">

                        <div className="h-px flex-1 bg-zinc-100" />

                        <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest capitalize">

                            {mesAno}

                        </span>

                        <div className="h-px flex-1 bg-zinc-100" />

                    </div>



                    {/* Cards de aulas */}

                    <div className="space-y-3">

                        {aulas.map((aula) => {

                            const tipoConfig = TIPO_CONFIG[aula.tipo] ?? TIPO_CONFIG.regular;

                            const statusKey = aula.status ?? 'agendada';

                            const statusConfig = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.agendada;



                            return (

                                <React.Fragment key={aula.id}>

                                    {/* Desktop View */}

                                    <div

                                        className={`hidden md:flex items-center gap-4 p-4 rounded-2xl border transition-all ${aula.status === 'cancelada'

                                            ? 'bg-zinc-50/50 border-zinc-100 opacity-60'

                                            : aula.status === 'concluida'

                                                ? 'bg-white border-zinc-100'

                                                : 'bg-white border-indigo-50 shadow-sm shadow-indigo-50/50'

                                            }`}

                                    >

                                        {/* Coluna de data */}

                                        <div className="flex flex-col items-center justify-center min-w-[56px] h-14 bg-zinc-50 rounded-xl border border-zinc-100">

                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider capitalize">

                                                {format(new Date(aula.data + 'T00:00:00'), 'EEE', { locale: ptBR })}

                                            </span>

                                            <span className="text-xl font-black text-zinc-800 leading-tight">

                                                {format(new Date(aula.data + 'T00:00:00'), 'dd')}

                                            </span>

                                            <span className="text-[9px] font-bold text-zinc-400">

                                                {format(new Date(aula.data + 'T00:00:00'), 'MMM', { locale: ptBR })}

                                            </span>

                                        </div>



                                        {/* Info principal */}

                                        <div className="flex-1 min-w-0">

                                            <div className="flex items-center gap-2 flex-wrap mb-1">

                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${tipoConfig.className}`}>

                                                    {tipoConfig.label}

                                                </span>

                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.className}`}>

                                                    {statusConfig.icon}

                                                    {statusConfig.label}

                                                </span>

                                            </div>

                                            <p className="text-sm font-bold text-zinc-900 truncate">

                                                {getStudentName(aula)}

                                            </p>

                                            <div className="flex items-center gap-3 mt-0.5">

                                                <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium">

                                                    <Clock className="w-3 h-3" />

                                                    {aula.hora_inicio.substring(0, 5)} – {aula.hora_termino.substring(0, 5)}

                                                </span>

                                                {aula.professor?.usuario?.nome && (

                                                    <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium truncate">

                                                        <User className="w-3 h-3" />

                                                        {aula.professor.usuario.nome.split(' ')[0]}

                                                    </span>

                                                )}

                                                {aula.turma?.descricao && (

                                                    <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium truncate">

                                                        <BookOpen className="w-3 h-3" />

                                                        {aula.turma.descricao}

                                                    </span>

                                                )}

                                            </div>

                                        </div>



                                        {/* Ações */}

                                        <div className="flex items-center gap-1">

                                            <Button

                                                type="button"

                                                variant="ghost"

                                                size="icon"

                                                onClick={() => handleChamada(aula)}

                                                className="w-8 h-8 text-emerald-600 hover:bg-emerald-50 rounded-full hover:cursor-pointer mr-1"

                                                title="Fazer chamada"

                                            >

                                                <ClipboardCheck className="w-4 h-4" />

                                            </Button>

                                            <Button

                                                type="button"

                                                variant="ghost"

                                                size="icon"

                                                onClick={() => handleEdit(aula)}

                                                className="w-8 h-8 text-indigo-600 hover:bg-indigo-50 rounded-full hover:cursor-pointer"

                                                title="Editar agendamento"

                                            >

                                                <Pencil className="w-4 h-4" />

                                            </Button>

                                            <Button

                                                type="button"

                                                variant="ghost"

                                                size="icon"

                                                onClick={() => setAulaToDelete(aula)}

                                                className="w-8 h-8 text-rose-500 hover:bg-rose-50 rounded-full hover:cursor-pointer"

                                                title="Excluir agendamento"

                                            >

                                                <Trash2 className="w-4 h-4" />

                                            </Button>

                                        </div>

                                    </div>



                                    {/* Mobile View */}

                                    <div

                                        className={`md:hidden p-5 space-y-4 rounded-[24px] border transition-all active:scale-[0.98] ${aula.status === 'cancelada'

                                            ? 'bg-zinc-50/50 border-zinc-100 opacity-60'

                                            : 'bg-white border-zinc-100 shadow-sm'

                                            }`}

                                    >

                                        <div className="flex items-center justify-between gap-3">

                                            <div className="flex items-center gap-3">

                                                <div className="flex flex-col items-center justify-center w-12 h-12 bg-indigo-50 rounded-2xl border border-indigo-100 shrink-0">

                                                    <span className="text-[10px] font-black text-indigo-400 uppercase leading-none">

                                                        {format(new Date(aula.data + 'T00:00:00'), 'EEE', { locale: ptBR })}

                                                    </span>

                                                    <span className="text-lg font-black text-indigo-600 leading-tight">

                                                        {format(new Date(aula.data + 'T00:00:00'), 'dd')}

                                                    </span>

                                                </div>

                                                <div>

                                                    <h3 className="text-[15px] font-bold text-zinc-900 leading-tight">

                                                        {getStudentName(aula)}

                                                    </h3>

                                                    <div className="flex items-center gap-1.5 mt-1">

                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${tipoConfig.className}`}>

                                                            {tipoConfig.label}

                                                        </span>

                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${statusConfig.className}`}>

                                                            {statusConfig.label}

                                                        </span>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>



                                        <div className="grid grid-cols-2 gap-2 p-3 bg-zinc-50/50 rounded-2xl border border-zinc-100">

                                            <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-bold">

                                                <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />

                                                <span>{aula.hora_inicio.substring(0, 5)} - {aula.hora_termino.substring(0, 5)}</span>

                                            </div>

                                            {aula.professor?.usuario?.nome && (

                                                <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-bold">

                                                    <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />

                                                    <span className="truncate">{aula.professor.usuario.nome.split(' ')[0]}</span>

                                                </div>

                                            )}

                                        </div>



                                        <div className="flex items-center gap-2 pt-1">

                                            <Button

                                                type="button"

                                                onClick={() => handleChamada(aula)}

                                                className="flex-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 h-9 rounded-full font-bold text-xs uppercase transition-all active:scale-95 hover:cursor-pointer"

                                            >

                                                <ClipboardCheck className="w-4 h-4 mr-2" />

                                                Chamada

                                            </Button>

                                            <Button

                                                type="button"

                                                onClick={() => handleEdit(aula)}

                                                className="w-11 h-9 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 rounded-full transition-all active:scale-95 flex items-center justify-center hover:cursor-pointer"

                                            >

                                                <Pencil className="w-4 h-4" />

                                            </Button>

                                            <Button

                                                type="button"

                                                onClick={() => setAulaToDelete(aula)}

                                                className="w-11 h-9 bg-rose-50 text-rose-500 hover:bg-rose-100 border border-rose-100 rounded-full transition-all active:scale-95 flex items-center justify-center hover:cursor-pointer"

                                            >

                                                <Trash2 className="w-4 h-4" />

                                            </Button>

                                        </div>

                                    </div>

                                </React.Fragment>

                            );

                        })}

                    </div>

                </div>

            ))}



            {aulaModal}



            <ConfirmDeleteDialog

                open={!!aulaToDelete}

                onOpenChange={(open) => !open && setAulaToDelete(null)}

                description="Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita."

                isLoading={isDeleting}

                onConfirm={handleDelete}

            />



            {/* Modal de Chamada */}

            <Dialog open={isChamadaOpen} onOpenChange={setIsChamadaOpen}>

                <DialogContent className="max-w-3xl h-[85vh] md:h-[600px] p-0 border-none shadow-2xl rounded-[32px] overflow-hidden">

                    {selectedChamadaAula && (

                        <AulaChamadaModal

                            aula={selectedChamadaAula}

                            onClose={() => {

                                setIsChamadaOpen(false);

                                setSelectedChamadaAula(null);

                            }}

                            onSuccess={() => {

                                setIsChamadaOpen(false);

                                setSelectedChamadaAula(null);

                                refetch();

                            }}

                        />

                    )}

                </DialogContent>

            </Dialog>

        </div>

    );

};



export default TurmaAgendamentos;
