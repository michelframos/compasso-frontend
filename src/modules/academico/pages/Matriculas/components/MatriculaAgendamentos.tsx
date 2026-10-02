import React, { useState } from 'react';

import { CalendarDays, Clock, Loader2, User, CheckCircle2, XCircle, CalendarClock, UserCircle, Plus, Pencil, Trash2 } from 'lucide-react';

import { format } from 'date-fns';

import { ptBR } from 'date-fns/locale';

import { toast } from 'sonner';

import { getErrorMessage } from '@/shared/lib/utils';

import { useMatriculaAgendamentos, type AulaTurmaAgendamento } from '../hooks/useMatriculaAgendamentos';

import { Button } from '@/shared/components/ui/button';

import { AulaModal } from '../../Turmas/components/AulaModal';

import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog';

import { Label } from '@/shared/components/ui/label';




interface MatriculaAgendamentosProps {

    turmaId?: number;

    alunoId?: number;

    professorId?: number | null;

    cursoId?: number | null;

    nivelId?: number | null;

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



export const MatriculaAgendamentos: React.FC<MatriculaAgendamentosProps> = ({ turmaId, alunoId, professorId, cursoId, nivelId }) => {

    const { agendamentos, isLoading, refetch, deleteAgendamento } = useMatriculaAgendamentos(turmaId, alunoId);

    const [isAgendando, setIsAgendando] = useState(false);

    const [editingAula, setEditingAula] = useState<AulaTurmaAgendamento | null>(null);

    const [deletingAula, setDeletingAula] = useState<AulaTurmaAgendamento | null>(null);

    const [excluirContaVinculada, setExcluirContaVinculada] = useState(false);

    const [isDeleting, setIsDeleting] = useState(false);

    const aulaModal = (
        <AulaModal
            open={isAgendando || !!editingAula}
            onOpenChange={(open) => {
                if (!open) {
                    setIsAgendando(false);
                    setEditingAula(null);
                }
            }}
            defaultTurmaId={turmaId}
            initialData={editingAula ? {
                ...editingAula,
                id_turma: editingAula.turma?.id,
                id_professor: editingAula.id_professor,
                id_aluno_especifico: editingAula.id_aluno_especifico,
                id_curso: editingAula.id_curso,
                id_nivel: editingAula.id_nivel,
                status: editingAula.status || undefined,
                conteudo_dado: editingAula.conteudo_dado || undefined,
            } : {
                id_aluno_especifico: alunoId,
                tipo: 'regular',
                id_professor: professorId ?? undefined,
                id_curso: turmaId ? undefined : cursoId ?? undefined,
                id_nivel: turmaId ? undefined : nivelId ?? undefined,
            }}
            title={editingAula ? <>Editar <span className="text-indigo-600">Agendamento</span></> : <>Novo <span className="text-indigo-600">Agendamento</span></>}
            description={editingAula ? 'Altere as informações deste agendamento.' : 'Agende uma aula para este aluno nesta turma.'}
            onSuccess={() => {
                refetch();
            }}
        />
    );



    const handleDelete = async () => {

        if (!deletingAula) return;

        setIsDeleting(true);

        try {

            await deleteAgendamento(deletingAula.id, excluirContaVinculada);

            toast.success('Agendamento excluído com sucesso!');

            setDeletingAula(null);

            setExcluirContaVinculada(false);

        } catch (err) {

            toast.error(getErrorMessage(err, 'Erro ao excluir agendamento.'));

        } finally {

            setIsDeleting(false);

        }

    };



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

            <div className="flex flex-col items-center justify-center py-12 text-center">

                <div className="p-4 bg-zinc-100 rounded-full text-zinc-400 mb-4">

                    <CalendarDays className="w-8 h-8" />

                </div>

                <h3 className="text-lg font-bold text-zinc-900">Nenhum agendamento encontrado</h3>

                <p className="text-zinc-500 max-w-xs mx-auto mt-1 mb-6 text-sm">

                    Esta matrícula não possui aulas agendadas para este aluno nesta turma no sistema.

                </p>

                <Button
                    type="button"
                    onClick={() => setIsAgendando(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-9 px-5 gap-2 shadow-lg shadow-indigo-100 font-bold active:scale-95 transition-all text-sm hover:cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    Novo Agendamento
                </Button>

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



    return (

        <div className="space-y-6 p-1">

            {/* Header com botão de novo agendamento */}

            <div className="flex flex-col md:flex-row md:items-center justify-between pb-2">

                <h4 className="text-xs mb-2 md:mb-0 font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">

                    <CalendarClock className="w-4 h-4" />

                    Cronograma de Aulas

                </h4>

                <Button
                    type="button"
                    onClick={() => setIsAgendando(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-9 px-5 gap-2 shadow-lg shadow-indigo-100 font-bold active:scale-95 transition-all text-sm hover:cursor-pointer"
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

                    <div className="space-y-2">

                        {aulas.map((aula) => {

                            const tipoConfig = TIPO_CONFIG[aula.tipo] || TIPO_CONFIG.regular;

                            const statusKey = aula.status || 'agendada';

                            const statusConfig = STATUS_CONFIG[statusKey] || STATUS_CONFIG.agendada;



                            return (

                                <div

                                    key={aula.id}

                                    className={`flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl border transition-all group ${aula.status === 'cancelada'

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

                                        <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap mb-1">

                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${tipoConfig.className}`}>

                                                {tipoConfig.label}

                                            </span>

                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.className}`}>

                                                {statusConfig.icon}

                                                {statusConfig.label}

                                            </span>

                                        </div>



                                        <div className="flex items-center justify-center md:justify-start gap-3 mt-0.5 flex-wrap">

                                            <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium">

                                                <Clock className="w-3 h-3" />

                                                {aula.hora_inicio.substring(0, 5)} – {aula.hora_termino.substring(0, 5)}

                                            </span>

                                            {/* Professor */}

                                            {aula.professor?.usuario?.nome && (

                                                <span className="flex items-center gap-1 text-[11px] text-zinc-500 font-bold truncate">

                                                    <User className="w-3 h-3 text-zinc-400" />

                                                    Prof: {aula.professor.usuario.nome.split(' ')[0]}

                                                </span>

                                            )}

                                            {/* Aluno específico (reposição/reforço) - Mostrar somente se for um aluno diferente ou reforçar */}

                                            {aula.aluno_especifico?.usuario?.nome && (

                                                <span className="flex items-center gap-1 text-[11px] text-amber-700 font-black">

                                                    <UserCircle className="w-3 h-3" />

                                                    Individual: {aula.aluno_especifico.usuario.nome}

                                                </span>

                                            )}

                                        </div>

                                    </div>



                                    {/* Ações */}

                                    <div className="flex items-center justify-center md:justify-start gap-1">

                                        <Button

                                            type="button"

                                            variant="ghost"

                                            size="icon"

                                            onClick={() => setEditingAula(aula)}

                                            className="h-8 w-8 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg hover:cursor-pointer transition-colors"

                                            title="Editar agendamento"

                                        >

                                            <Pencil className="w-4 h-4" />

                                        </Button>

                                        <Button

                                            type="button"

                                            variant="ghost"

                                            size="icon"

                                            onClick={() => {

                                                setDeletingAula(aula);

                                                setExcluirContaVinculada(false);

                                            }}

                                            className="h-8 w-8 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg hover:cursor-pointer transition-colors"

                                            title="Excluir agendamento"

                                        >

                                            <Trash2 className="w-4 h-4" />

                                        </Button>

                                    </div>

                                </div>

                            );

                        })}

                    </div>

                </div>

            ))}



            {/* Modal de Edição */}

            {aulaModal}



            <ConfirmDeleteDialog

                open={!!deletingAula}

                onOpenChange={(open) => !open && setDeletingAula(null)}

                description={

                    <>

                        Tem certeza que deseja excluir esta aula agendada para o dia{' '}

                        <strong>{deletingAula && format(new Date(deletingAula.data + 'T00:00:00'), 'dd/MM/yyyy')}</strong>

                        {' '}às <strong>{deletingAula?.hora_inicio.substring(0, 5)}</strong>? Esta ação não pode ser desfeita.

                    </>

                }

                isLoading={isDeleting}

                onConfirm={handleDelete}

            >

                {deletingAula?.id_conta && (

                    <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4">

                        <input

                            type="checkbox"

                            id="excluir_conta_agendamento"

                            checked={excluirContaVinculada}

                            onChange={(e) => setExcluirContaVinculada(e.target.checked)}

                            className="h-5 w-5 cursor-pointer rounded border-rose-300 text-rose-600 focus:ring-rose-600"

                        />

                        <Label htmlFor="excluir_conta_agendamento" className="cursor-pointer text-sm font-bold text-rose-900">

                            Excluir também a conta a receber atrelada?

                        </Label>

                    </div>

                )}

            </ConfirmDeleteDialog>

        </div>

    );

};



export default MatriculaAgendamentos;
