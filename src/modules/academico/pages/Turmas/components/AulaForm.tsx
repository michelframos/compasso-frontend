import React, { useState, useEffect, useRef } from 'react';

import { useForm, type FieldErrors } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import * as z from 'zod';

import { Loader2 } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

import { Input } from '@/shared/components/ui/input';

import { Label } from '@/shared/components/ui/label';

import api from '@/shared/lib/axios';

import { toast } from 'sonner';

import { CurrencyInput } from '@/shared/components/ui/currency-input';

import { getErrorMessage } from '@/shared/lib/utils';



import { format } from 'date-fns';

import { AlertCircle, Trash2, Wallet } from 'lucide-react';

import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog';

import { PagamentoModal } from '@/modules/financeiro';

import { useHasModulo } from '@/shared/hooks/useHasModulo';



const idConverter = (v: unknown) => {

    const num = Number(v);

    return isNaN(num) || num === 0 ? null : num;

};



const aulaSchema = z.object({

    id_turma: z.number().nullable().optional(),

    id_professor: z.number().min(1, 'Selecione um professor'),

    data: z.string().min(1, 'Data é obrigatória'),

    hora_inicio: z.string().min(1, 'Início é obrigatório'),

    hora_termino: z.string().min(1, 'Término é obrigatório'),

    tipo: z.enum(['regular', 'reposicao', 'reforco', 'extra']),

    id_aluno_especifico: z.number().nullable().optional(),

    id_curso: z.number().nullable().optional(),

    id_nivel: z.number().nullable().optional(),

    status: z.enum(['agendada', 'concluida', 'cancelada']),

    conteudo_dado: z.string().optional().or(z.literal('')),

    gerar_conta: z.boolean(),

    valor_conta: z.number().optional(),

    data_vencimento_conta: z.string().optional(),

    id_categoria_conta: z.number().optional(),

    notificar: z.boolean(),

    recorrente: z.boolean().optional(),

    frequencia_ocorrencias: z.enum(['diaria', 'semanal', 'quinzenal', 'mensal']).optional(),

    quantidade_ocorrencias: z.number().min(1, 'No mínimo 1').max(50, 'Máximo de 50').optional(),

}).superRefine((data, ctx) => {

    // 1. Validação de Turma vs Aluno/Curso

    const hasTurma = data.id_turma && data.id_turma > 0;

    const hasAluno = data.id_aluno_especifico && data.id_aluno_especifico > 0;

    const hasCurso = data.id_curso && data.id_curso > 0;



    if (!hasTurma && !hasAluno) {

        ctx.addIssue({

            code: z.ZodIssueCode.custom,

            message: "Selecione uma turma ou um aluno específico",

            path: ["id_turma"]

        });

    } else if (hasAluno && !hasTurma && !hasCurso) {

        ctx.addIssue({

            code: z.ZodIssueCode.custom,

            message: "Para agendamento avulso, selecione também o curso",

            path: ["id_curso"]

        });

    }



    // 2. Validação Financeira

    if (data.gerar_conta) {

        if (!data.valor_conta || data.valor_conta <= 0) {

            ctx.addIssue({

                code: z.ZodIssueCode.custom,

                message: "Informe o valor da cobrança",

                path: ["valor_conta"]

            });

        }

        if (!data.data_vencimento_conta) {

            ctx.addIssue({

                code: z.ZodIssueCode.custom,

                message: "Informe a data de vencimento",

                path: ["data_vencimento_conta"]

            });

        }

        if (!data.id_categoria_conta || data.id_categoria_conta === 0) {

            ctx.addIssue({

                code: z.ZodIssueCode.custom,

                message: "Selecione a categoria da conta",

                path: ["id_categoria_conta"]

            });

        }

    }

});



type AulaFormValues = z.infer<typeof aulaSchema>;



interface TurmaBasico {

    id: number;

    status: string;

    dia_semana: string;

    horario_inicio: string;

    curso?: { nome: string };

    nivel?: { nome: string };

    id_professor?: number;

}



interface AlunoBasico {

    id: number;

    usuario?: { nome: string };

}



interface CategoriaContaBasico {

    id: number;

    nome: string;

    tipo: string;

}



interface ProfessorBasico {

    id: number;

    usuario?: { nome: string };

}



interface CursoBasico {

    id: number;

    nome: string;

}



interface NivelBasico {

    id: number;

    nome: string;

}



interface MatriculaAlunoBasico {

    id: number;

    status: string;

    id_curso: number | null;

    id_nivel: number | null;

    id_professor: number | null;

    turma?: { id_curso?: number; id_professor?: number | null } | null;

}



const professorDaMatricula = (matricula?: MatriculaAlunoBasico) =>

    matricula?.id_professor ?? matricula?.turma?.id_professor ?? null;



export type AulaFormInitialData = {

    id?: number;

    id_turma?: number;

    id_professor?: number;

    data?: string;

    hora_inicio?: string;

    hora_termino?: string;

    tipo?: 'regular' | 'reposicao' | 'reforco' | 'extra';

    id_aluno_especifico?: number;

    id_curso?: number;

    id_nivel?: number;

    status?: 'agendada' | 'concluida' | 'cancelada';

    conteudo_dado?: string;

    id_conta?: number | null;

    conta?: {

        id: number;

        valor: string;

        data_vencimento: string;

        status: string;

        saldo_devedor?: number;

        categoria?: { nome: string };

    };

    notificar?: boolean;

};

interface AulaFormProps {

    onClose: () => void;

    onSuccess: () => void;

    initialData?: AulaFormInitialData;

    defaultTurmaId?: number;

    defaultProfessorId?: number;

}



export const AulaForm: React.FC<AulaFormProps> = ({

    onClose,

    onSuccess,

    initialData,

    defaultTurmaId,

    defaultProfessorId

}) => {

    const hasFinanceiro = useHasModulo('financeiro');

    const [turmas, setTurmas] = useState<TurmaBasico[]>([]);

    const [alunos, setAlunos] = useState<AlunoBasico[]>([]);

    const [todosAlunos, setTodosAlunos] = useState<AlunoBasico[]>([]);

    const [isLoadingTurmas, setIsLoadingTurmas] = useState(false);

    const [isLoadingAlunos, setIsLoadingAlunos] = useState(false);

    const [turmaDetalhes, setTurmaDetalhes] = useState<any>(null); // Turma completa

    const [professores, setProfessores] = useState<ProfessorBasico[]>([]);

    const [cursos, setCursos] = useState<CursoBasico[]>([]);

    const [niveis, setNiveis] = useState<NivelBasico[]>([]);

    const [isLoadingProfessores, setIsLoadingProfessores] = useState(false);

    const [isLoadingCursos, setIsLoadingCursos] = useState(false);

    const [isLoadingNiveis, setIsLoadingNiveis] = useState(false);

    const [financeiroCategorias, setFinanceiroCategorias] = useState<CategoriaContaBasico[]>([]);

    const [isLoadingFinanceiro, setIsLoadingFinanceiro] = useState(false);

    const [excluirContaVinculada, setExcluirContaVinculada] = useState(false);

    const [isLoadingMatriculas, setIsLoadingMatriculas] = useState(false);

    const [matriculasAtivasAluno, setMatriculasAtivasAluno] = useState<MatriculaAlunoBasico[]>([]);

    const [formError, setFormError] = useState<string | null>(null);

    const cursoAnteriorRef = useRef<number | null | undefined>(undefined);

    const turmaInicial = initialData?.id_turma || defaultTurmaId || 0;



    const [localConta, setLocalConta] = useState<any>(initialData?.conta || null);

    const [isPagamentoModalOpen, setIsPagamentoModalOpen] = useState(false);



    useEffect(() => {

        if (initialData?.conta) {

            setLocalConta(initialData.conta);

        }

    }, [initialData?.conta]);



    const handlePagamentoSuccess = async () => {

        try {

            const response = await api.get(`/contas/${localConta.id}`);

            if (response.data && response.data.data) {

                const contaAtualizada = response.data.data;

                setLocalConta({

                    ...localConta,

                    ...contaAtualizada,

                });

            }

        } catch (error) {

            console.error('Erro ao recarregar a conta atualizada:', error);

        }

    };



    const { register, handleSubmit, watch, setValue, getValues, formState: { errors, isSubmitting } } = useForm<AulaFormValues>({

        resolver: zodResolver(aulaSchema),

        defaultValues: {

            id_turma: initialData?.id_turma || defaultTurmaId || 0,

            id_professor: initialData?.id_professor || defaultProfessorId || 0,

            data: initialData?.data || format(new Date(), 'yyyy-MM-dd'),

            hora_inicio: initialData?.hora_inicio?.substring(0, 5) || '14:00',

            hora_termino: initialData?.hora_termino?.substring(0, 5) || '15:00',

            tipo: initialData?.tipo || 'regular',

            id_aluno_especifico: initialData?.id_aluno_especifico || 0,

            id_curso: initialData?.id_curso || 0,

            id_nivel: initialData?.id_nivel || 0,

            status: initialData?.status || 'agendada',

            conteudo_dado: initialData?.conteudo_dado || '',

            gerar_conta: false,

            valor_conta: 0,

            data_vencimento_conta: initialData?.data || format(new Date(), 'yyyy-MM-dd'),

            id_categoria_conta: 0,

            notificar: initialData?.notificar ?? true,

            recorrente: false,

            frequencia_ocorrencias: 'semanal',

            quantidade_ocorrencias: 1,

        }

    });



    const tipoAula = watch('tipo');

    const idTurma = watch('id_turma');

    const idAlunoEspecifico = watch('id_aluno_especifico');

    const idCurso = watch('id_curso');

    const gerarConta = watch('gerar_conta');

    const valorConta = watch('valor_conta');

    const dataAula = watch('data');

    const isRecorrente = watch('recorrente');



    // Carrega turmas ativas ao montar (exceto quando a turma vem via prop direta)

    useEffect(() => {

        if (defaultTurmaId) return;



        const fetchTurmas = async () => {

            setIsLoadingTurmas(true);

            try {

                const response = await api.get('/turmas', { params: { per_page: 100 } });

                const todasTurmas: TurmaBasico[] = response.data.data || [];

                const turmasFiltradas = todasTurmas.filter((t: TurmaBasico) => t.status === 'aberta' || t.status === 'em_andamento');



                if (initialData?.id_turma) {

                    const turmaNaLista = turmasFiltradas.find((t: TurmaBasico) => t.id === initialData.id_turma);

                    if (!turmaNaLista) {

                        const turmaOriginal = todasTurmas.find((t: TurmaBasico) => t.id === initialData.id_turma);

                        if (turmaOriginal) turmasFiltradas.push(turmaOriginal);

                    }

                }



                setTurmas(turmasFiltradas);

                if (initialData?.id_turma) {

                    setTimeout(() => setValue('id_turma', Number(initialData.id_turma)), 0);

                }

            } catch (error) {

                console.error('Erro ao buscar turmas:', error);

                toast.error(getErrorMessage(error, 'Não foi possível carregar as turmas.'));

            } finally {

                setIsLoadingTurmas(false);

            }

        };

        fetchTurmas();

    }, [defaultTurmaId, initialData?.id_turma, setValue]);



    // Carrega todos os alunos ativos para agendamento avulso

    useEffect(() => {

        const fetchTodosAlunos = async () => {

            setIsLoadingAlunos(true);

            try {

                const response = await api.get('/alunos', { params: { per_page: 500, status: 'ativo' } });

                setTodosAlunos(response.data.data || []);

            } catch (error) {

                console.error('Erro ao buscar alunos:', error);

            } finally {

                setIsLoadingAlunos(false);

            }

        };

        fetchTodosAlunos();

    }, []);



    // Carrega professores para o select

    useEffect(() => {

        const fetchProfessores = async () => {

            setIsLoadingProfessores(true);

            try {

                const response = await api.get('/professores', { params: { per_page: 100 } });

                setProfessores(response.data.data || []);

            } catch (error) {

                console.error('Erro ao buscar professores:', error);

            } finally {

                setIsLoadingProfessores(false);

            }

        };

        fetchProfessores();

    }, []);



    // Carrega cursos para o select (agendamento avulso)

    useEffect(() => {

        const fetchCursos = async () => {

            setIsLoadingCursos(true);

            try {

                const response = await api.get('/cursos');

                setCursos(response.data.data || []);

                if (initialData?.id_curso) {

                    setTimeout(() => setValue('id_curso', Number(initialData.id_curso)), 0);

                }

            } catch (error) {

                console.error('Erro ao buscar cursos:', error);

            } finally {

                setIsLoadingCursos(false);

            }

        };

        fetchCursos();

    }, [initialData?.id_curso, setValue]);



    // Carrega níveis para o select (agendamento avulso)

    useEffect(() => {

        const fetchNiveis = async () => {

            setIsLoadingNiveis(true);

            try {

                const response = await api.get('/niveis');

                setNiveis(response.data.data || []);

                if (initialData?.id_nivel) {

                    setTimeout(() => setValue('id_nivel', Number(initialData.id_nivel)), 0);

                }

            } catch (error) {

                console.error('Erro ao buscar níveis:', error);

            } finally {

                setIsLoadingNiveis(false);

            }

        };

        fetchNiveis();

    }, [initialData?.id_nivel, setValue]);



    // Carrega categorias de conta (receitas)

    useEffect(() => {

        const fetchCategorias = async () => {

            setIsLoadingFinanceiro(true);

            try {

                const response = await api.get('/categorias-contas');

                const categorias = response.data.data || [];

                // Filtra apenas categorias de receita

                setFinanceiroCategorias(categorias.filter((c: any) => c.tipo === 'receita'));

            } catch (error) {

                console.error('Erro ao buscar categorias:', error);

            } finally {

                setIsLoadingFinanceiro(false);

            }

        };

        if (hasFinanceiro) fetchCategorias();

    }, [hasFinanceiro]);



    // Atualiza a data de vencimento padrão quando a data da aula muda

    useEffect(() => {

        if (dataAula) {

            setValue('data_vencimento_conta', dataAula);

        }

    }, [dataAula, setValue]);



    // Effect 1: Ao selecionar uma turma, busca detalhes e preenche o professor titular

    useEffect(() => {

        if (!idTurma || idTurma === 0) {

            setTurmaDetalhes(null);

            return;

        }



        const fetchTurmaDetalhes = async () => {

            try {

                const response = await api.get(`/turmas/${idTurma}`);

                const turma = response.data.data;

                setTurmaDetalhes(turma);



                // Na turma inicial respeita o professor já informado; ao trocar de turma, assume o titular da nova.
                const turmaFoiAlterada = idTurma !== turmaInicial;

                if (turma?.id_professor && (!getValues('id_professor') || turmaFoiAlterada)) {

                    setValue('id_professor', turma.id_professor, { shouldValidate: true });

                }

            } catch (error) {

                console.error('Erro ao buscar detalhes da turma:', error);

                setFormError(getErrorMessage(error, 'Não foi possível carregar os dados da turma. Selecione o professor manualmente.'));

            }

        };

        fetchTurmaDetalhes();

    }, [idTurma, turmaInicial, getValues, setValue]);





    // Effect 2: Carrega alunos da turma ou todos os alunos se não houver turma

    useEffect(() => {

        if (idTurma && idTurma !== 0) {

            // Para reposição/reforço: mostra todos os alunos ativos do sistema

            if (tipoAula === 'reposicao' || tipoAula === 'reforco') {

                setAlunos(todosAlunos);

                if (initialData?.id_aluno_especifico) {

                    setValue('id_aluno_especifico', Number(initialData.id_aluno_especifico));

                }

            } else if (turmaDetalhes) {

                // Para aulas regulares/extras: mostra apenas os alunos da turma

                const alunosDaTurma: AlunoBasico[] = turmaDetalhes.matriculas

                    ?.map((m: any) => m.aluno)

                    .filter(Boolean) || [];

                setAlunos(alunosDaTurma);



                if (initialData?.id_aluno_especifico) {

                    setValue('id_aluno_especifico', Number(initialData.id_aluno_especifico));

                }

            }

        } else {

            setAlunos(todosAlunos);

            if (initialData?.id_aluno_especifico) {

                setValue('id_aluno_especifico', Number(initialData.id_aluno_especifico));

            }

        }

    }, [tipoAula, turmaDetalhes, idTurma, todosAlunos, initialData?.id_aluno_especifico, setValue]);



    // Effect 3: Busca as matrículas do aluno p/ pré-selecionar o curso em agendamentos avulsos

    useEffect(() => {

        // Só dispara se:

        // 1. For agendamento avulso (idTurma === 0 ou null)

        // 2. Tiver um aluno selecionado

        // 3. O curso ainda não estiver selecionado (ou se estivermos mudando de aluno)

        if (idTurma && idTurma !== 0) return;

        if (!idAlunoEspecifico || idAlunoEspecifico === 0) {

            setMatriculasAtivasAluno([]);

            return;

        }



        const handleAutoSelectCurso = async () => {

            setIsLoadingMatriculas(true);

            try {

                const response = await api.get(`/alunos/${idAlunoEspecifico}/matriculas`);

                const matriculas: MatriculaAlunoBasico[] = response.data.data || [];



                // Filtra apenas matrículas ativas

                const ativas = matriculas.filter((m) => m.status === 'ativa');

                setMatriculasAtivasAluno(ativas);



                if (ativas.length === 1 && !getValues('id_curso')) {

                    const matricula = ativas[0];

                    if (matricula.id_curso) {

                        setValue('id_curso', matricula.id_curso, { shouldValidate: true });

                        if (matricula.id_nivel) {

                            setValue('id_nivel', matricula.id_nivel, { shouldValidate: true });

                        }

                    }

                }

            } catch (error) {

                console.error('Erro ao buscar matrículas do aluno:', error);

                setMatriculasAtivasAluno([]);

            } finally {

                setIsLoadingMatriculas(false);

            }

        };



        handleAutoSelectCurso();

    }, [idAlunoEspecifico, idTurma, getValues, setValue]);



    // Effect 4: Em agendamentos avulsos, preenche o professor da matrícula do aluno no curso selecionado

    useEffect(() => {

        if (idTurma && idTurma !== 0) return;



        const cursoAnterior = cursoAnteriorRef.current;

        cursoAnteriorRef.current = idCurso;

        if (!idCurso) return;



        const matricula = matriculasAtivasAluno.find((m) => (m.id_curso ?? m.turma?.id_curso) === idCurso);

        const professor = professorDaMatricula(matricula);

        if (!professor) return;



        const cursoFoiAlterado = !!cursoAnterior && cursoAnterior !== idCurso;

        if (!getValues('id_professor') || cursoFoiAlterado) {

            setValue('id_professor', professor, { shouldValidate: true });

        }

    }, [idCurso, idTurma, matriculasAtivasAluno, getValues, setValue]);



    const onInvalid = (formErrors: FieldErrors<AulaFormValues>) => {

        const mensagens = Array.from(new Set(

            Object.values(formErrors)

                .map((erro) => erro?.message)

                .filter((mensagem): mensagem is string => typeof mensagem === 'string' && mensagem.length > 0)

        ));

        setFormError(mensagens.length > 0

            ? `Verifique os dados do agendamento: ${mensagens.join('; ')}.`

            : 'Verifique os dados do agendamento.');

    };



    const onSubmit = async (values: AulaFormValues) => {

        setFormError(null);

        try {

            // Limpa os dados para o backend

            const formattedData = {

                ...values,

                id_turma: values.id_turma || null,

                id_aluno_especifico: values.id_aluno_especifico || null,

                id_curso: values.id_curso || null,

                id_nivel: values.id_nivel || null,

                hora_inicio: values.hora_inicio.substring(0, 5),

                hora_termino: values.hora_termino.substring(0, 5),

                // Limpa campos financeiros se gerar_conta não estiver marcado

                ...(values.gerar_conta ? {} : {

                    valor_conta: null,

                    data_vencimento_conta: null,

                    id_categoria_conta: null

                })

            };



            if (initialData?.id) {

                await api.put(`/aulas-turmas/${initialData.id}`, formattedData);

                toast.success('Aula atualizada com sucesso!');

            } else {

                await api.post('/aulas-turmas', formattedData);

                toast.success('Aula agendada com sucesso!');

            }

            onSuccess();

        } catch (error: any) {

            const mensagem = getErrorMessage(error, 'Erro ao salvar aula.');

            setFormError(mensagem);

            toast.error(mensagem);

        }

    };



    const handleDeletar = async () => {

        if (!initialData?.id) return;



        try {

            await api.delete(`/aulas-turmas/${initialData.id}`, {

                params: { excluir_conta: excluirContaVinculada }

            });

            toast.success('Agendamento excluído com sucesso!');

            onSuccess();

        } catch (error: any) {

            const mensagem = getErrorMessage(error, 'Erro ao excluir agendamento.');

            setFormError(mensagem);

            toast.error(mensagem);

        }

    };



    const selectClass = "flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-600 outline-none";



    return (

        <form

            onSubmit={(e) => {

                e.stopPropagation();

                handleSubmit(onSubmit as any, onInvalid)(e);

            }}

            className="flex flex-col h-full overflow-hidden"

        >

            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">



                {/* Seleção de Turma — exibida apenas quando não vem de uma turma específica */}

                {!defaultTurmaId && (

                    <div className="space-y-2 md:col-span-2">

                        <Label htmlFor="id_turma">Turma</Label>

                        {isLoadingTurmas ? (

                            <div className="flex items-center gap-2 text-sm text-zinc-500 py-2">

                                <Loader2 className="w-4 h-4 animate-spin" />

                                Carregando turmas...

                            </div>

                        ) : (

                            <select

                                {...register('id_turma', { valueAsNumber: true })}

                                className={selectClass}

                            >

                                <option value={0}>Agendamento Avulso (Sem Turma)</option>

                                {turmas.map((turma: TurmaBasico) => (

                                    <option key={turma.id} value={turma.id}>

                                        {turma.curso?.nome} — {turma.nivel?.nome} ({turma.dia_semana}, {turma.horario_inicio?.substring(0, 5)})

                                    </option>

                                ))}

                            </select>

                        )}

                        {errors.id_turma && <p className="text-xs text-rose-500">{errors.id_turma.message}</p>}

                    </div>

                )}



                {/* Campos de Curso e Nível para agendamento avulso */}

                {!idTurma && (

                    <>

                        <div className="space-y-2">

                            <Label htmlFor="id_curso" className="text-zinc-900 font-bold">

                                Curso <span className="text-rose-500">*</span>

                            </Label>

                            {isLoadingCursos || isLoadingMatriculas ? (

                                <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium py-2.5 px-3 bg-indigo-50/50 rounded-xl border border-indigo-100">

                                    <Loader2 className="w-4 h-4 animate-spin" />

                                    {isLoadingMatriculas ? 'Buscando curso do aluno...' : 'Carregando cursos...'}

                                </div>

                            ) : (

                                <select

                                    {...register('id_curso', { valueAsNumber: true })}

                                    className={`${selectClass} ${errors.id_curso ? 'border-rose-300 bg-rose-50/20' : ''}`}

                                >

                                    <option value={0}>Selecione um curso...</option>

                                    {cursos.map((curso: CursoBasico) => (

                                        <option key={curso.id} value={curso.id}>

                                            {curso.nome}

                                        </option>

                                    ))}

                                </select>

                            )}

                            {errors.id_curso && <p className="text-xs text-rose-500">{errors.id_curso.message}</p>}

                        </div>



                        <div className="space-y-2">

                            <Label htmlFor="id_nivel">Nível (Opcional)</Label>

                            {isLoadingNiveis ? (

                                <div className="flex items-center gap-2 text-sm text-zinc-500 py-2">

                                    <Loader2 className="w-4 h-4 animate-spin" />

                                    Carregando...

                                </div>

                            ) : (

                                <select

                                    {...register('id_nivel', { valueAsNumber: true })}

                                    className={selectClass}

                                >

                                    <option value={0}>Selecione um nível...</option>

                                    {niveis.map((nivel: NivelBasico) => (

                                        <option key={nivel.id} value={nivel.id}>

                                            {nivel.nome}

                                        </option>

                                    ))}

                                </select>

                            )}

                            {errors.id_nivel && <p className="text-xs text-rose-500">{errors.id_nivel.message}</p>}

                        </div>

                    </>

                )}



                {/* Professor — movido para cima ou tornado visível sempre */}

                <div className="space-y-2">

                    <Label htmlFor="id_professor">Professor *</Label>

                    {isLoadingProfessores ? (

                        <div className="flex items-center gap-2 text-sm text-zinc-500 py-2">

                            <Loader2 className="w-4 h-4 animate-spin" />

                            Carregando...

                        </div>

                    ) : (

                        <select

                            {...register('id_professor', { valueAsNumber: true })}

                            className={selectClass}

                        >

                            <option value={0}>Selecione um professor...</option>

                            {professores.map((prof: ProfessorBasico) => (

                                <option key={prof.id} value={prof.id}>

                                    {prof.usuario?.nome}

                                </option>

                            ))}

                        </select>

                    )}

                    {errors.id_professor && <p className="text-xs text-rose-500">{errors.id_professor.message}</p>}

                </div>



                {/* Tipo de Aula */}

                <div className="space-y-2">

                    <Label>Tipo de Aula</Label>

                    <select

                        {...register('tipo')}

                        className={selectClass}

                    >

                        <option value="regular">Aula Regular</option>

                        <option value="reposicao">Reposição</option>

                        <option value="reforco">Reforço</option>

                        <option value="extra">Aula Extra</option>

                    </select>

                </div>



                {/* Status */}

                <div className="space-y-2">

                    <Label>Status</Label>

                    <select

                        {...register('status')}

                        className={selectClass}

                    >

                        <option value="agendada">Agendada</option>

                        <option value="concluida">Concluída (Presença)</option>

                        <option value="cancelada">Cancelada</option>

                    </select>

                </div>



                {/* Data */}

                <div className="space-y-2">

                    <Label>Data</Label>

                    <Input type="date" {...register('data')} className="h-11 rounded-xl focus-visible:ring-indigo-600" />

                    {errors.data && <p className="text-xs text-rose-500">{errors.data.message}</p>}

                </div>



                {/* Horários */}

                <div className="space-y-2">

                    <Label>Início</Label>

                    <Input type="time" {...register('hora_inicio')} className="h-11 rounded-xl focus-visible:ring-indigo-600" />

                </div>

                <div className="space-y-2">

                    <Label>Término</Label>

                    <Input type="time" {...register('hora_termino')} className="h-11 rounded-xl focus-visible:ring-indigo-600" />

                </div>



                {/* Aluno — obrigatório para agendamentos sem turma ou tipos específicos */}

                {(!idTurma || tipoAula === 'reposicao' || tipoAula === 'reforco') && (

                    <div className="space-y-2 md:col-span-2">

                        <Label htmlFor="id_aluno_especifico" className={`${!idTurma ? 'text-indigo-600' : 'text-zinc-700'} font-medium`}>

                            Aluno {idTurma ? '(Opcional/Toda Turma)' : '*'}

                        </Label>

                        {isLoadingAlunos ? (

                            <div className="flex items-center gap-2 text-sm text-zinc-500 py-2">

                                <Loader2 className="w-4 h-4 animate-spin" />

                                Carregando alunos...

                            </div>

                        ) : (

                            <select

                                {...register('id_aluno_especifico', { setValueAs: idConverter })}

                                className={selectClass}

                            >

                                <option value={0}>{idTurma ? 'Toda a Turma' : 'Selecione o aluno...'}</option>

                                {alunos.map((aluno: AlunoBasico) => (

                                    <option key={aluno.id} value={aluno.id}>

                                        {aluno.usuario?.nome}

                                    </option>

                                ))}

                            </select>

                        )}

                        {errors.id_aluno_especifico && <p className="text-xs text-rose-500">{errors.id_aluno_especifico.message}</p>}

                        {!idTurma && (

                            <p className="text-[11px] text-zinc-400 italic">

                                * Agendamentos avulsos exigem a seleção de um aluno.

                            </p>

                        )}

                    </div>

                )}



                <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 md:col-span-2">

                    <input

                        type="checkbox"

                        id="notificar"

                        {...register('notificar')}

                        className="w-5 h-5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"

                    />

                    <div className="space-y-0.5">

                        <Label htmlFor="notificar" className="font-bold text-zinc-900 cursor-pointer">Enviar Notificações?</Label>

                        <p className="text-[11px] text-zinc-500">Se desmarcado, não serão enviados lembretes de WhatsApp para este agendamento.</p>

                    </div>

                </div>



                {!initialData?.id && (

                    <>

                        <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 md:col-span-2">

                            <input

                                type="checkbox"

                                id="recorrente"

                                {...register('recorrente')}

                                className="w-5 h-5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"

                            />

                            <div className="space-y-0.5">

                                <Label htmlFor="recorrente" className="font-bold text-zinc-900 cursor-pointer">Agendamento Recorrente?</Label>

                                <p className="text-[11px] text-zinc-500">Marque para gerar múltiplas ocorrências repetidas no tempo.</p>

                            </div>

                        </div>



                        {isRecorrente && (

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:col-span-2 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 animate-in fade-in slide-in-from-top-2 duration-300">

                                <div className="space-y-2">

                                    <Label className="text-xs font-bold uppercase tracking-wider text-indigo-900">Frequência</Label>

                                    <select

                                        {...register('frequencia_ocorrencias')}

                                        className={selectClass}

                                    >

                                        <option value="diaria">Diária</option>

                                        <option value="semanal">Semanal</option>

                                        <option value="quinzenal">Quinzenal</option>

                                        <option value="mensal">Mensal</option>

                                    </select>

                                </div>

                                <div className="space-y-2">

                                    <Label className="text-xs font-bold uppercase tracking-wider text-indigo-900">Número de Ocorrências</Label>

                                    <Input

                                        type="number"

                                        min={1}

                                        max={50}

                                        {...register('quantidade_ocorrencias', { valueAsNumber: true })}

                                        className="h-11 rounded-xl focus-visible:ring-indigo-600 bg-white"

                                    />

                                    {errors.quantidade_ocorrencias && <p className="text-xs text-rose-500">{errors.quantidade_ocorrencias.message}</p>}

                                </div>

                            </div>

                        )}

                    </>

                )}



                {/* Conteúdo / Observações */}

                <div className="space-y-2 md:col-span-2">

                    <Label>Conteúdo / Observações</Label>

                    <textarea

                        {...register('conteudo_dado')}

                        className="w-full min-h-[100px] p-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-indigo-600 outline-none resize-none text-sm"

                        placeholder="O que será abordado nesta aula?"

                    />

                </div>



                {/* Seção Financeira — exibida apenas para tipos de aula que podem ser cobrados avulsos */}

                {hasFinanceiro && (tipoAula === 'reposicao' || tipoAula === 'reforco' || tipoAula === 'extra' || !idTurma) && (

                    <>

                        {localConta ? (

                            <div className="space-y-4 md:col-span-2 p-6 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 w-full">

                                <div className="space-y-3">

                                    <div className="flex items-center justify-between">

                                        <Label className="text-sm font-bold text-indigo-900">Conta a Receber Gerada</Label>

                                        {localConta.status !== 'pago' && localConta.status !== 'cancelado' && (localConta.saldo_devedor === undefined || localConta.saldo_devedor === null || Number(localConta.saldo_devedor) > 0) && (

                                            <Button

                                                type="button"

                                                size="sm"

                                                onClick={() => setIsPagamentoModalOpen(true)}

                                                className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 text-xs font-bold gap-1.5 shadow-sm hover:cursor-pointer"

                                            >

                                                <Wallet className="w-3.5 h-3.5" />

                                                Realizar Pagamento

                                            </Button>

                                        )}

                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/60 rounded-xl border border-indigo-100">

                                        <div className="space-y-1">

                                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Valor</span>

                                            <p className="text-sm font-bold text-zinc-900">

                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(localConta.valor))}

                                            </p>

                                        </div>

                                        <div className="space-y-1">

                                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Vencimento</span>

                                            <p className="text-sm font-bold text-zinc-900">

                                                {(() => {

                                                    if (!localConta.data_vencimento) return '-';

                                                    const dateStr = localConta.data_vencimento.includes('T')

                                                        ? localConta.data_vencimento

                                                        : `${localConta.data_vencimento}T00:00:00`;

                                                    const d = new Date(dateStr);

                                                    return isNaN(d.getTime()) ? '-' : format(d, 'dd/MM/yyyy');

                                                })()}

                                            </p>

                                        </div>

                                        <div className="space-y-1">

                                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Status</span>

                                            <p className={`text-sm font-bold uppercase flex flex-col items-start ${localConta.status === 'pago' ? 'text-emerald-600' :

                                                localConta.status === 'vencido' ? 'text-rose-600' :

                                                    'text-amber-600'

                                                }`}>

                                                {localConta.status}

                                                {localConta.saldo_devedor !== undefined && localConta.saldo_devedor > 0 && localConta.status !== 'pago' && (

                                                    <span className="text-[10px] text-rose-600 mt-0.5 normal-case font-medium">Falta: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(localConta.saldo_devedor))}</span>

                                                )}

                                            </p>

                                        </div>

                                    </div>

                                    <p className="text-[11px] text-zinc-500 italic">

                                        Para editar os dados financeiros, acesse o menu Financeiro &gt; Contas a Receber.

                                    </p>

                                </div>

                            </div>

                        ) : (

                            !initialData?.id_turma && !initialData?.id && (

                                <div className="space-y-4 md:col-span-2 p-6 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">

                                    <div className="flex items-center justify-between">

                                        <div className="space-y-0.5">

                                            <Label className="text-sm font-bold text-indigo-900">Gerar Conta a Receber?</Label>

                                            <p className="text-[11px] text-indigo-600/70">Marque para criar uma cobrança automática para este agendamento.</p>

                                        </div>

                                        <input

                                            type="checkbox"

                                            {...register('gerar_conta')}

                                            className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"

                                        />

                                    </div>



                                    {gerarConta && (

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">

                                            <div className="space-y-2">

                                                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Valor (R$)</Label>

                                                <CurrencyInput

                                                    id="valor_conta"

                                                    value={Number(valorConta || 0)}

                                                    onChange={(val) => setValue('valor_conta', val, { shouldValidate: true })}

                                                    prefix="R$"

                                                    className="h-10 rounded-xl border-zinc-200 focus:ring-indigo-600"

                                                    placeholder="0,00"

                                                />

                                                {errors.valor_conta && <p className="text-[10px] text-rose-500 font-medium">{errors.valor_conta.message}</p>}

                                            </div>



                                            <div className="space-y-2">

                                                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Vencimento</Label>

                                                <Input

                                                    type="date"

                                                    {...register('data_vencimento_conta')}

                                                    className="h-10 rounded-xl border-zinc-200 focus:ring-indigo-600"

                                                />

                                            </div>



                                            <div className="space-y-2">

                                                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Categoria</Label>

                                                {isLoadingFinanceiro ? (

                                                    <div className="h-10 flex items-center justify-center">

                                                        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />

                                                    </div>

                                                ) : (

                                                    <select

                                                        {...register('id_categoria_conta', { setValueAs: idConverter })}

                                                        className="flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-600 outline-none"

                                                    >

                                                        <option value={0}>Selecione...</option>

                                                        {financeiroCategorias.map((cat: CategoriaContaBasico) => (

                                                            <option key={cat.id} value={cat.id}>{cat.nome}</option>

                                                        ))}

                                                    </select>

                                                )}

                                            </div>

                                        </div>

                                    )}

                                </div>

                            )

                        )}

                    </>

                )}

                </div>

            </div>



            {formError && (

                <div

                    role="alert"

                    className="mx-8 mb-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shrink-0"

                >

                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />

                    <p className="flex-1 font-medium">{formError}</p>

                    <button

                        type="button"

                        onClick={() => setFormError(null)}

                        className="text-xs font-bold text-rose-500 hover:text-rose-700 hover:cursor-pointer"

                    >

                        Fechar

                    </button>

                </div>

            )}



            <div className="p-8 border-t border-zinc-100 bg-zinc-50/30 flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-3 shrink-0 rounded-b-[32px]">

                <div>

                    {initialData?.id && (

                        <ConfirmDeleteDialog

                            trigger={

                                <Button

                                    type="button"

                                    variant="ghost"

                                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-full px-4 h-9 font-bold hover:cursor-pointer transition-colors gap-2"

                                >

                                    <Trash2 className="w-4 h-4" />

                                    Excluir

                                </Button>

                            }

                            description="Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita."

                            onConfirm={handleDeletar}

                        >

                            {hasFinanceiro && initialData?.id_conta && (

                                <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4">

                                    <input

                                        type="checkbox"

                                        id="excluir_conta_vinculada"

                                        checked={excluirContaVinculada}

                                        onChange={(e) => setExcluirContaVinculada(e.target.checked)}

                                        className="h-5 w-5 cursor-pointer rounded border-rose-300 text-rose-600 focus:ring-rose-600"

                                    />

                                    <Label htmlFor="excluir_conta_vinculada" className="cursor-pointer text-sm font-bold text-rose-900">

                                        Excluir também a conta a receber atrelada?

                                    </Label>

                                </div>

                            )}

                        </ConfirmDeleteDialog>

                    )}

                </div>



                <div className="flex flex-col-reverse md:flex-row gap-3 w-full md:w-auto">

                    <Button

                        type="button"

                        variant="ghost"

                        onClick={onClose}

                        className="rounded-full px-6 h-9 font-bold hover:cursor-pointer w-full md:w-auto"

                    >

                        Cancelar

                    </Button>

                    <Button

                        type="submit"

                        disabled={isSubmitting}

                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 h-9 font-bold shadow-lg shadow-indigo-100 hover:cursor-pointer w-full md:w-auto"

                    >

                        {isSubmitting ? (

                            <>

                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                                Salvando...

                            </>

                        ) : (

                            'Salvar Aula'

                        )}

                    </Button>

                </div>

            </div>



            {hasFinanceiro && (

            <PagamentoModal

                open={isPagamentoModalOpen}

                onOpenChange={setIsPagamentoModalOpen}

                conta={localConta}

                onSuccess={handlePagamentoSuccess}

            />

            )}

        </form>

    );

};
