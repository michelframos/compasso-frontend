import React, { useState, useEffect, useCallback } from 'react';

import {

    Calendar as CalendarIcon,

    ChevronLeft,

    ChevronRight,

    Plus,

    Clock,

    LayoutGrid,

    StretchHorizontal,

    CalendarDays,

    User,

    ClipboardCheck

} from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

import {

    Dialog,

    DialogContent,

} from '@/shared/components/ui/dialog';

import { AulaModal } from '../Turmas/components/AulaModal';

import { AulaChamadaModal } from '../Turmas/components/AulaChamadaModal';

import api from '@/shared/lib/axios';

import {

    format,

    addMonths,

    subMonths,

    startOfMonth,

    endOfMonth,

    eachDayOfInterval,

    isSameMonth,

    isSameDay,

    startOfWeek,

    endOfWeek,

    addWeeks,

    subWeeks,

    addDays,

    subDays,

    startOfDay,

    endOfDay

} from 'date-fns';

import { ptBR } from 'date-fns/locale';



type ViewMode = 'month' | 'week' | 'day';



export const AgendaPage: React.FC = () => {

    const [currentDate, setCurrentDate] = useState(new Date());

    const [viewMode, setViewMode] = useState<ViewMode>('month');

    const [aulas, setAulas] = useState<any[]>([]);

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const [isAgendando, setIsAgendando] = useState(false);

    const [aulaParaEditar, setAulaParaEditar] = useState<any>(null);



    // Estado para controle da modal de Chamada

    const [selectedChamadaAula, setSelectedChamadaAula] = React.useState<any>(null);

    const [isChamadaOpen, setIsChamadaOpen] = React.useState(false);



    const fetchAulas = useCallback(async () => {

        try {

            let start, end;

            if (viewMode === 'month') {

                start = startOfMonth(currentDate);

                end = endOfMonth(currentDate);

            } else if (viewMode === 'week') {

                start = startOfWeek(currentDate, { weekStartsOn: 0 });

                end = endOfWeek(currentDate, { weekStartsOn: 0 });

            } else {

                start = startOfDay(currentDate);

                end = endOfDay(currentDate);

            }



            const response = await api.get('/aulas-turmas', {

                params: {

                    data_inicio: format(start, 'yyyy-MM-dd'),

                    data_fim: format(end, 'yyyy-MM-dd')

                }

            });

            setAulas(response.data.data || []);

        } catch (error) {

            console.error('Erro ao buscar aulas:', error);

        }

    }, [currentDate, viewMode]);



    useEffect(() => {

        fetchAulas();

    }, [fetchAulas]);



    const handleNavigate = (direction: 'prev' | 'next') => {

        if (viewMode === 'month') {

            setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));

        } else if (viewMode === 'week') {

            setCurrentDate(direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));

        } else {

            setCurrentDate(direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1));

        }

    };



    const handleDayClick = (day: Date) => {

        setAulaParaEditar(null);

        setSelectedDate(day);

        setIsAgendando(true);

    };



    const handleAulaClick = (e: React.MouseEvent, aula: any) => {

        e.stopPropagation();

        setAulaParaEditar(aula);

        setSelectedDate(null);

        setIsAgendando(true);

    };



    const handleChamadaClick = (e: React.MouseEvent, aula: any) => {

        e.stopPropagation();

        setSelectedChamadaAula(aula);

        setIsChamadaOpen(true);

    };



    const handleCloseModal = () => {

        setIsAgendando(false);

        setAulaParaEditar(null);

        setSelectedDate(null);

    };



    const getAulasDoDia = (day: Date) => {

        return aulas.filter((aula: any) => isSameDay(new Date(aula.data + 'T00:00:00'), day));

    };



    const renderMonthView = () => {

        const monthStart = startOfMonth(currentDate);

        const monthEnd = endOfMonth(monthStart);

        const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });

        const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });



        const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });



        const getStudentName = (aula: any) => {

            if (aula.aluno_especifico?.usuario?.nome) {

                return aula.aluno_especifico.usuario.nome;

            }

            if (aula.turma?.matriculas && aula.turma.matriculas.length > 0) {

                if (['reposicao', 'reforco', 'extra'].includes(aula.tipo) || aula.turma.matriculas.length === 1) {

                    return aula.turma.matriculas[0]?.aluno?.usuario?.nome;

                }

            }

            return null;

        };



        return (

            <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-zinc-100">

                <div className="grid grid-cols-7 border-b border-zinc-100 bg-zinc-50/50">

                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (

                        <div key={day} className="py-4 text-center text-[11px] font-black text-zinc-400 uppercase tracking-widest">

                            {day}

                        </div>

                    ))}

                </div>

                <div className="grid grid-cols-7">

                    {calendarDays.map((day, idx) => {

                        const aulasDia = getAulasDoDia(day);

                        const isCurrentMonth = isSameMonth(day, monthStart);

                        const isToday = isSameDay(day, new Date());



                        return (

                            <div

                                key={idx}

                                onClick={() => handleDayClick(day)}

                                className={`min-h-[120px] p-2 border-r border-b border-zinc-50 transition-colors hover:bg-indigo-50/30 cursor-pointer ${!isCurrentMonth ? 'bg-zinc-50/50 opacity-40' : ''

                                    }`}

                            >

                                <div className="flex justify-between items-center mb-2">

                                    <span className={`text-[13px] font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-zinc-500'

                                        }`}>

                                        {format(day, 'd')}

                                    </span>

                                    {aulasDia.length > 0 && (

                                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">

                                            {aulasDia.length}

                                        </span>

                                    )}

                                </div>

                                <div className="space-y-1">

                                    {aulasDia.slice(0, 3).map((aula: any) => {

                                        const studentName = getStudentName(aula);

                                        return (

                                            <div

                                                key={aula.id}

                                                onClick={(e) => handleAulaClick(e, aula)}

                                                className={`text-[10px] p-1.5 rounded-lg border flex flex-col gap-0.5 shadow-sm truncate capitalize cursor-pointer hover:opacity-75 transition-opacity ${aula.tipo === 'reposicao' ? 'bg-amber-50 border-amber-100 text-amber-700' :

                                                    aula.tipo === 'reforco' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :

                                                        'bg-indigo-50/50 border-indigo-100 text-indigo-700'

                                                    }`}

                                            >

                                                <div className="flex items-center gap-1 font-bold justify-between">

                                                    <div className="flex items-center gap-1">

                                                        <Clock className="w-2.5 h-2.5" />

                                                        {aula.hora_inicio.substring(0, 5)}

                                                    </div>

                                                    <button

                                                        onClick={(e) => handleChamadaClick(e, aula)}

                                                        className="hover:bg-black/10 p-0.5 rounded-md transition-colors"

                                                        title="Fazer chamada"

                                                    >

                                                        <ClipboardCheck className="w-3 h-3" />

                                                    </button>

                                                </div>

                                                <div className="truncate opacity-80 flex flex-col gap-0.5">

                                                    <span>{aula.id_turma ? aula.turma?.curso?.nome : aula.curso?.nome}</span>

                                                    {studentName && (

                                                        <span className="font-black underline decoration-amber-500/50">

                                                            P/ {studentName.split(' ')[0]}

                                                        </span>

                                                    )}

                                                </div>

                                            </div>

                                        );

                                    })}

                                </div>

                            </div>

                        );

                    })}

                </div>

            </div>

        );

    };



    const renderTimeGrid = (days: Date[]) => {

        const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7:00 to 21:00



        const getStudentName = (aula: any) => {

            if (aula.aluno_especifico?.usuario?.nome) {

                return aula.aluno_especifico.usuario.nome;

            }

            if (aula.turma?.matriculas && aula.turma.matriculas.length > 0) {

                if (['reposicao', 'reforco', 'extra'].includes(aula.tipo) || aula.turma.matriculas.length === 1) {

                    return aula.turma.matriculas[0]?.aluno?.usuario?.nome;

                }

            }

            return null;

        };



        return (

            <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-zinc-100 flex flex-col">

                <div className="grid grid-cols-[80px_1fr] border-b border-zinc-100 bg-zinc-50/50">

                    <div className="p-4 border-r border-zinc-100"></div>

                    <div className={`grid ${days.length > 1 ? 'grid-cols-7' : 'grid-cols-1'}`}>

                        {days.map((day, idx) => (

                            <div key={idx} className="py-4 text-center border-r border-zinc-50 last:border-r-0">

                                <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">

                                    {format(day, 'EEE', { locale: ptBR })}

                                </div>

                                <div className={`text-[13px] font-bold mt-1 ${isSameDay(day, new Date()) ? 'text-indigo-600' : 'text-zinc-700'}`}>

                                    {format(day, 'd')}

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

                <div className="flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">

                    {hours.map(hour => (

                        <div key={hour} className="grid grid-cols-[80px_1fr] border-b border-zinc-50 last:border-b-0 min-h-[60px]">

                            <div className="p-2 text-[11px] font-bold text-zinc-400 text-center border-r border-zinc-100 bg-zinc-50/30 flex items-center justify-center">

                                {String(hour).padStart(2, '0')}:00

                            </div>

                            <div className={`grid ${days.length > 1 ? 'grid-cols-7' : 'grid-cols-1'}`}>

                                {days.map((day, idx) => {

                                    const aulasHora = getAulasDoDia(day).filter(aula => {

                                        const h = parseInt(aula.hora_inicio.split(':')[0]);

                                        return h === hour;

                                    });



                                    return (

                                        <div

                                            key={idx}

                                            onClick={() => {

                                                const d = new Date(day);

                                                d.setHours(hour);

                                                handleDayClick(d);

                                            }}

                                            className="p-1 border-r border-zinc-50 last:border-r-0 hover:bg-indigo-50/20 transition-colors cursor-pointer relative"

                                        >

                                            {aulasHora.map(aula => {

                                                const studentName = getStudentName(aula);

                                                return (

                                                    <div

                                                        key={aula.id}

                                                        onClick={(e) => handleAulaClick(e, aula)}

                                                        className={`p-2 rounded-xl border mb-1 shadow-sm flex flex-col gap-1 overflow-hidden cursor-pointer hover:opacity-75 transition-opacity ${aula.tipo === 'reposicao' ? 'bg-amber-50 border-amber-100 text-amber-700' :

                                                            aula.tipo === 'reforco' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :

                                                                'bg-indigo-600 text-white border-indigo-500'

                                                            }`}

                                                    >

                                                        <div className="text-[10px] font-black uppercase flex items-center justify-between gap-1">

                                                            <div className="flex items-center gap-1">

                                                                <Clock className="w-3 h-3" />

                                                                {aula.hora_inicio.substring(0, 5)} - {aula.hora_termino.substring(0, 5)}

                                                            </div>

                                                            <button

                                                                onClick={(e) => handleChamadaClick(e, aula)}

                                                                className="hover:bg-black/10 p-1 rounded-md transition-colors"

                                                                title="Fazer chamada"

                                                            >

                                                                <ClipboardCheck className="w-3.5 h-3.5" />

                                                            </button>

                                                        </div>

                                                        <div className="text-[12px] font-bold truncate leading-tight">

                                                            {aula.id_turma ? (

                                                                aula.turma?.curso?.nome

                                                            ) : (

                                                                <div className="flex flex-col gap-0.5">

                                                                    <span className={`flex items-center gap-1 ${aula.tipo === 'reposicao' ? 'text-amber-700' : aula.tipo === 'reforco' ? 'text-emerald-700' : 'text-white'}`}>

                                                                        <User className="w-3 h-3" />

                                                                        {studentName || 'Agendamento Avulso'}

                                                                    </span>

                                                                    <span className="text-[10px] opacity-90 font-black">

                                                                        Curso: {aula.curso?.nome || 'Não definido'}

                                                                    </span>

                                                                </div>

                                                            )}

                                                        </div>

                                                        {aula.id_turma && studentName && (

                                                            <div className={`text-[11px] font-black px-2 py-0.5 rounded-md backdrop-blur-sm self-start ${aula.tipo === 'reposicao' ? 'bg-amber-100/50' : aula.tipo === 'reforco' ? 'bg-emerald-100/50' : 'bg-black/10'}`}>

                                                                Aluno: {studentName}

                                                            </div>

                                                        )}

                                                        <div className="text-[10px] opacity-80 truncate font-medium">

                                                            Prof: {aula.professor?.usuario?.nome || 'Não definido'}

                                                        </div>

                                                    </div>

                                                );

                                            })}

                                        </div>

                                    );

                                })}

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        );

    };



    return (

        <div className="space-y-6">

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                <div>

                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">

                        Agenda de <span className="text-indigo-600">Aulas</span>

                    </h1>

                    <p className="text-zinc-500 mt-1 text-[14px]">Visualize o cronograma por mês, semana ou dia.</p>

                </div>



                <div className="flex flex-wrap items-center flex-col lg:flex-row gap-4">

                    {/* View Selector */}

                    <div className="flex p-1 bg-zinc-100 rounded-full border border-zinc-200 w-full lg:w-auto justify-center">

                        <Button

                            variant={viewMode === 'month' ? 'default' : 'ghost'}

                            onClick={() => setViewMode('month')}

                            className={`rounded-full h-8 px-4 text-xs font-bold gap-2 transition-all hover:cursor-pointer ${viewMode === 'month' ? 'bg-white text-indigo-600 shadow-sm border-zinc-200' : 'text-zinc-500'}`}

                        >

                            <LayoutGrid className="w-3 h-3" /> Mês

                        </Button>

                        <Button

                            variant={viewMode === 'week' ? 'default' : 'ghost'}

                            onClick={() => setViewMode('week')}

                            className={`rounded-full h-8 px-4 text-xs font-bold gap-2 transition-all hover:cursor-pointer ${viewMode === 'week' ? 'bg-white text-indigo-600 shadow-sm border-zinc-200' : 'text-zinc-500'}`}

                        >

                            <StretchHorizontal className="w-3 h-3" /> Semana

                        </Button>

                        <Button

                            variant={viewMode === 'day' ? 'default' : 'ghost'}

                            onClick={() => setViewMode('day')}

                            className={`rounded-full h-8 px-4 text-xs font-bold gap-2 transition-all hover:cursor-pointer ${viewMode === 'day' ? 'bg-white text-indigo-600 shadow-sm border-zinc-200' : 'text-zinc-500'}`}

                        >

                            <CalendarDays className="w-3 h-3" /> Dia

                        </Button>

                    </div>



                    {/* Navigation */}

                    <div className="flex items-center bg-white rounded-full border border-zinc-200 p-1 shadow-sm w-full lg:w-auto justify-center">

                        <Button variant="ghost" size="icon" onClick={() => handleNavigate('prev')} className="rounded-full h-8 w-8 hover:bg-zinc-50 hover:cursor-pointer">

                            <ChevronLeft className="w-4 h-4" />

                        </Button>

                        <span className="px-4 text-xs font-bold text-zinc-700 min-w-[140px] text-center capitalize">

                            {viewMode === 'day' ? format(currentDate, "dd 'de' MMMM", { locale: ptBR }) :

                                viewMode === 'week' ? `Semana de ${format(startOfWeek(currentDate, { weekStartsOn: 0 }), 'dd/MM')}` :

                                    format(currentDate, 'MMMM yyyy', { locale: ptBR })}

                        </span>

                        <Button variant="ghost" size="icon" onClick={() => handleNavigate('next')} className="rounded-full h-8 w-8 hover:bg-zinc-50 hover:cursor-pointer">

                            <ChevronRight className="w-4 h-4" />

                        </Button>

                    </div>



                    <Button

                        onClick={() => {

                            setSelectedDate(new Date());

                            setAulaParaEditar(null);

                            setIsAgendando(true);

                        }}

                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-9 px-5 gap-2 shadow-lg shadow-indigo-100 font-bold active:scale-95 transition-all text-xs hover:cursor-pointer w-full lg:w-auto"

                    >

                        <Plus className="w-4 h-4" />

                        Novo Agendamento

                    </Button>

                </div>

            </div>



            {viewMode === 'month' ? renderMonthView() :

                viewMode === 'week' ? renderTimeGrid(eachDayOfInterval({

                    start: startOfWeek(currentDate, { weekStartsOn: 0 }),

                    end: endOfWeek(currentDate, { weekStartsOn: 0 })

                })) :

                    renderTimeGrid([currentDate])}



            <AulaModal

                open={isAgendando}

                onOpenChange={(open) => {

                    if (!open) handleCloseModal();

                }}

                title={aulaParaEditar

                    ? <>Editar <span className="text-indigo-600">Agendamento</span></>

                    : <>Agendar <span className="text-indigo-600">Aula / Reposição</span></>

                }

                description={aulaParaEditar

                    ? `Editando aula de ${format(new Date(aulaParaEditar.data + 'T00:00:00'), "dd 'de' MMMM", { locale: ptBR })} às ${aulaParaEditar.hora_inicio?.substring(0, 5)}`

                    : selectedDate

                        ? `Agendando para ${format(selectedDate, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}`

                        : 'Preencha os dados abaixo.'

                }

                initialData={aulaParaEditar ?? {

                    data: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,

                    hora_inicio: selectedDate ? format(selectedDate, 'HH:00') : undefined,

                    tipo: 'regular',

                    status: 'agendada',

                }}

                onSuccess={() => {

                    fetchAulas();

                }}

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

                                fetchAulas();

                            }}

                        />

                    )}

                </DialogContent>

            </Dialog>

        </div>

    );

};



export default AgendaPage;
