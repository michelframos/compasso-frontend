import { BookOpen, Clock, CalendarDays, Loader2, ExternalLink, CalendarPlus, Plus, Printer } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import type { Matricula } from '../types';

import { descreverMatricula } from '../utils/matricula';

import { Card, CardContent } from '@/shared/components/ui/card';

import { Button } from '@/shared/components/ui/button';

import {

    Dialog,

    DialogContent,

    DialogHeader,

    DialogTitle,

    DialogDescription

} from '@/shared/components/ui/dialog';

import { AulaModal, MatriculaForm } from '@/modules/academico'

import { useState } from 'react';

import { printContract } from '@/lib/print-utils';

import { substituirPlaceholders } from '@/lib/contrato-utils';



interface AlunoMatriculasProps {

    alunoId?: number;

    matriculas?: Matricula[];

    isLoading?: boolean;

    alunoNome?: string;

    onSuccess?: () => void;

}



const DIAS_SEMANA = [

    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',

    'Quinta-feira', 'Sexta-feira', 'Sábado'

];



export const AlunoMatriculas: React.FC<AlunoMatriculasProps> = ({ alunoId, matriculas, isLoading, alunoNome, onSuccess }) => {

    const navigate = useNavigate();

    const [selectedMatricula, setSelectedMatricula] = useState<Matricula | null>(null);

    const [isMatriculaModalOpen, setIsMatriculaModalOpen] = useState(false);



    if (isLoading) {

        return (

            <div className="flex flex-col items-center justify-center py-12 gap-3">

                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />

                <p className="text-sm text-zinc-500 font-medium">Carregando matrículas...</p>

            </div>

        );

    }



    const renderContent = () => {

        if (!matriculas || matriculas.length === 0) {

            return (

                <div className="space-y-6">

                    <div className="flex justify-end pr-2">

                        <Button

                            type="button"

                            onClick={() => setIsMatriculaModalOpen(true)}

                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-9 px-5 gap-2 shadow-lg shadow-indigo-100 font-bold active:scale-95 transition-all text-sm hover:cursor-pointer w-full md:w-auto"

                        >

                            <Plus className="w-4 h-4" />

                            Nova Matrícula

                        </Button>

                    </div>



                    <div className="flex flex-col items-center justify-center py-12 text-center">

                        <div className="p-4 bg-zinc-100 rounded-full text-zinc-400 mb-4">

                            <BookOpen className="w-8 h-8" />

                        </div>

                        <h3 className="text-lg font-bold text-zinc-900">Nenhuma matrícula encontrada</h3>

                        <p className="text-zinc-500 max-w-xs mx-auto mt-1 text-sm">

                            Este aluno ainda não possui matrículas em turmas no sistema.

                        </p>

                    </div>

                </div>

            );

        }



        return (

            <div className="space-y-6 p-1">

                <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">

                    <Button

                        type="button"

                        onClick={() => setIsMatriculaModalOpen(true)}

                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-9 px-5 gap-2 shadow-lg shadow-indigo-100 font-bold active:scale-95 transition-all text-sm hover:cursor-pointer"

                    >

                        <Plus className="w-4 h-4" />

                        Nova Matrícula

                    </Button>

                </div>

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

                                    <span className="px-2 py-0.5 bg-zinc-200 text-zinc-700 text-[10px] font-bold rounded-full uppercase tracking-wider">

                                        {descricao.nivel ?? 'Sem Nível'}

                                    </span>

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

                                    Matriculado em: {new Date(`${matricula.data.substring(0, 10)}T00:00:00`).toLocaleDateString('pt-BR')}

                                </p>

                            </div>



                            <div className="flex flex-col md:flex-row md:items-center gap-4">

                                {!descricao.isCurso && (

                                <div className="flex flex-col gap-1 pr-4 border-r border-zinc-200">

                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Horários da Turma</p>

                                    {matricula.turma?.horarios.map((horario) => (

                                        <div key={horario.id} className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">

                                            <CalendarDays className="w-3 h-3 text-zinc-400" />

                                            {DIAS_SEMANA[horario.dia_semana]}

                                            <span className="text-zinc-300 mx-1">|</span>

                                            <Clock className="w-3 h-3 text-zinc-400" />

                                            {horario.hora_inicio?.substring(0, 5) ?? '--:--'} - {horario.hora_termino?.substring(0, 5) ?? '--:--'}

                                        </div>

                                    ))}

                                    {(!matricula.turma?.horarios || matricula.turma.horarios.length === 0) && (

                                        <p className="text-[11px] text-zinc-400 italic">Sem horários definidos</p>

                                    )}

                                </div>

                                )}



                                <div className='gap-2 flex flex-col'>

                                    <Button

                                        type="button"

                                        variant="outline"

                                        size="sm"

                                        className="h-9 px-4 gap-2 border-zinc-200 rounded-full hover:bg-zinc-50 hover:text-indigo-600 hover:border-indigo-200 hover:cursor-pointer group"

                                        onClick={() => navigate(`/matriculas/${matricula.id}`)}

                                    >

                                        <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform" />

                                        <span className="text-xs font-bold uppercase tracking-wider">Acessar Matrícula</span>

                                    </Button>



                                    {matricula.status === 'ativa' && (

                                        <Button

                                            type="button"

                                            variant="ghost"

                                            size="sm"

                                            className="h-9 px-4 gap-2 text-indigo-600 rounded-full hover:bg-indigo-50 hover:text-indigo-700 hover:cursor-pointer group shadow-sm bg-white border border-zinc-100"

                                            onClick={() => setSelectedMatricula(matricula)}

                                        >

                                            <CalendarPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />

                                            <span className="text-xs font-bold uppercase tracking-wider">Agendar Reposição</span>

                                        </Button>

                                    )}



                                    {matricula.contrato_gerado && (

                                        <Button

                                            type="button"

                                            variant="outline"

                                            size="sm"

                                            className="h-9 px-4 gap-2 text-zinc-600 border-zinc-200 rounded-full hover:bg-zinc-50 hover:text-indigo-600 hover:border-indigo-200 hover:cursor-pointer group shadow-sm"

                                            onClick={() => {

                                                const alunoObj = matricula.aluno || { usuario: { nome: alunoNome } };

                                                const conteudoFinal = substituirPlaceholders(matricula.contrato_gerado!, {

                                                    aluno: alunoObj as any, // Mantendo any aqui pois Aluno de types.ts é ligeiramente diferente do esperado em ContratoData mas compatível na prática

                                                    turma: matricula.turma ?? undefined,

                                                    data_matricula: matricula.data

                                                });

                                                printContract(conteudoFinal, `Contrato de Matrícula - ${alunoNome}`);

                                            }}

                                        >

                                            <Printer className="w-4 h-4 group-hover:scale-110 transition-transform" />

                                            <span className="text-xs font-bold uppercase tracking-wider">Imprimir Contrato</span>

                                        </Button>

                                    )}

                                </div>

                            </div>

                        </div>

                        {matricula.observacoes && (

                            <CardContent className="px-6 py-3 bg-white border-t border-zinc-50">

                                <p className="text-[11px] text-zinc-500"><span className="font-bold text-zinc-700">Obs:</span> {matricula.observacoes}</p>

                            </CardContent>

                        )}

                    </Card>

                    );

                })}

            </div>

        );

    };



    return (

        <>

            {renderContent()}

            {/* Modal de Agendamento de Reposição */}

            <AulaModal
                open={!!selectedMatricula}
                onOpenChange={(open) => {
                    if (!open) setSelectedMatricula(null);
                }}
                defaultTurmaId={selectedMatricula?.id_turma ?? undefined}
                defaultProfessorId={selectedMatricula?.turma?.id_professor ?? selectedMatricula?.id_professor ?? undefined}
                title={<>Agendar <span className="text-indigo-600">Reposição / Reforço</span></>}
                description={selectedMatricula
                    ? `Agendando para: ${alunoNome} — ${descreverMatricula(selectedMatricula).titulo}`
                    : undefined}
                initialData={{
                    tipo: 'reposicao',
                    id_aluno_especifico: selectedMatricula?.id_aluno,
                    id_curso: selectedMatricula?.id_turma ? undefined : selectedMatricula?.id_curso ?? undefined,
                    id_nivel: selectedMatricula?.id_turma ? undefined : selectedMatricula?.id_nivel ?? undefined,
                }}
            />



            {/* Modal de Nova Matrícula */}

            <Dialog open={isMatriculaModalOpen} onOpenChange={setIsMatriculaModalOpen}>

                <DialogContent className="max-w-4xl rounded-[32px] p-0 border-none shadow-2xl text-zinc-900 bg-white">

                    <DialogHeader className="bg-indigo-50/50 border-b border-indigo-100">

                        <DialogTitle className="text-xl font-black text-zinc-900 flex items-center gap-2 text-zinc-900">

                            <Plus className="w-6 h-6 text-indigo-600" />

                            Realizar <span className="text-indigo-600">Nova Matrícula</span>

                        </DialogTitle>

                        <DialogDescription className="text-zinc-500">

                            Matriculando o aluno {alunoNome} em uma nova turma.

                        </DialogDescription>

                    </DialogHeader>



                    <MatriculaForm

                        onClose={() => setIsMatriculaModalOpen(false)}

                        onSuccess={() => {

                            setIsMatriculaModalOpen(false);

                            onSuccess?.();

                        }}

                        defaultAlunoId={String(alunoId)}

                    />

                </DialogContent>

            </Dialog>

        </>

    );

};
