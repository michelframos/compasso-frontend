import React, { useEffect, useState } from 'react';

import { useAulaPresencas } from '../hooks/useAulaPresencas';

import { format } from 'date-fns';

import { ptBR } from 'date-fns/locale';

import { Loader2, User, Check, X, AlertTriangle, Save, BookOpen } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';



interface AlunoChamada {

    id: number;

    nome: string;

}



interface AulaChamadaModalProps {

    aula: any;

    onClose: () => void;

    onSuccess: () => void;

}



export const AulaChamadaModal: React.FC<AulaChamadaModalProps> = ({ aula, onClose, onSuccess }) => {

    const { presencas, isLoading, isSaving, fetchPresencas, syncPresencas } = useAulaPresencas(aula.id);

    const [marcacoes, setMarcacoes] = useState<Record<number, 'presente' | 'falta' | 'falta_justificada'>>({});

    const [observacoes, setObservacoes] = useState<Record<number, string>>({});

    const [conteudoDado, setConteudoDado] = useState<string>(aula.conteudo_dado || '');



    // Extrai a lista de alunos que devem aparecer na chamada

    const alunosParaChamada: AlunoChamada[] = React.useMemo(() => {

        // Se for aula avulsa (ou reforço/reposição focado em 1 aluno), mostra só ele

        if (aula.aluno_especifico) {

            return [{

                id: aula.aluno_especifico.id,

                nome: aula.aluno_especifico.usuario?.nome || 'Aluno'

            }];

        }



        // Se for aula de turma regular, mostra todos os ativos da turma

        if (aula.turma?.matriculas) {

            return aula.turma.matriculas

                .filter((m: any) => m.status === 'ativa')

                .map((m: any) => ({

                    id: m.aluno?.id,

                    nome: m.aluno?.usuario?.nome || 'Aluno'

                }))

                .filter((a: any) => a.id);

        }



        return [];

    }, [aula]);



    useEffect(() => {

        fetchPresencas();

    }, [fetchPresencas]);



    // Quando o backend retorna as presenças salvas, preenche os estados locais

    useEffect(() => {

        if (!isLoading) {

            const novasMarcacoes: Record<number, 'presente' | 'falta' | 'falta_justificada'> = {};

            const novasObservacoes: Record<number, string> = {};



            alunosParaChamada.forEach(aluno => {

                const registroSalvo = presencas.find(p => p.id_aluno === aluno.id);

                if (registroSalvo) {

                    novasMarcacoes[aluno.id] = registroSalvo.status;

                    if (registroSalvo.observacao) {

                        novasObservacoes[aluno.id] = registroSalvo.observacao;

                    }

                }

            });



            setMarcacoes(novasMarcacoes);

            setObservacoes(novasObservacoes);

        }

    }, [presencas, isLoading, alunosParaChamada]);



    const handleMarcar = (alunoId: number, status: 'presente' | 'falta' | 'falta_justificada') => {

        setMarcacoes(prev => ({

            ...prev,

            [alunoId]: status

        }));

        // Limpa a observação se deixar de ser justificada

        if (status !== 'falta_justificada') {

            setObservacoes(prev => {

                const next = { ...prev };

                delete next[alunoId];

                return next;

            });

        }

    };



    const handleObservacao = (alunoId: number, texto: string) => {

        setObservacoes(prev => ({

            ...prev,

            [alunoId]: texto

        }));

    };



    const handleSalvar = async () => {

        const payload = {

            conteudo_dado: conteudoDado || null,

            presencas: Object.entries(marcacoes).map(([id_aluno, status]) => ({

                id_aluno: Number(id_aluno),

                status,

                observacao: status === 'falta_justificada'

                    ? (observacoes[Number(id_aluno)] || null)

                    : null,

            }))

        };



        const success = await syncPresencas(payload);

        if (success) {

            onSuccess();

        }

    };



    const isAulaPassadaOuHoje = new Date(aula.data + 'T00:00:00') <= new Date();

    const canEdit = aula.status !== 'cancelada' && isAulaPassadaOuHoje;



    return (

        <div className="flex flex-col h-full bg-white">

            {/* Header com Info da Aula */}

            <div className="p-8 bg-indigo-50/30 border-b border-indigo-100/50 space-y-4">

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                    <div>

                        <h3 className="text-lg font-black text-indigo-900 leading-tight">

                            Lista de Chamada

                        </h3>

                        <div className="flex flex-col mt-1">

                            <span className="text-sm font-medium text-zinc-600">

                                {format(new Date(aula.data + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} • {aula.hora_inicio?.substring(0, 5)} às {aula.hora_termino?.substring(0, 5)}

                            </span>

                            <span className="text-xs font-bold text-zinc-500 mt-0.5">

                                {aula.turma?.curso?.nome || 'Aula Avulsa'} {aula.turma?.descricao ? `- ${aula.turma.descricao}` : ''}

                            </span>

                        </div>

                    </div>

                    {aula.status === 'cancelada' && (

                        <div className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg shadow-sm">

                            Aula Cancelada

                        </div>

                    )}

                    {!isAulaPassadaOuHoje && aula.status !== 'cancelada' && (

                        <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-lg shadow-sm">

                            Aula Futura

                        </div>

                    )}

                </div>



                {/* Campo de Conteúdo da Aula */}

                <div className="space-y-1.5">

                    <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 uppercase tracking-wider">

                        <BookOpen className="w-3.5 h-3.5 text-indigo-500" />

                        Conteúdo da Aula

                    </label>

                    <textarea

                        value={conteudoDado}

                        onChange={(e) => setConteudoDado(e.target.value)}

                        disabled={!canEdit}

                        rows={3}

                        placeholder="Descreva o conteúdo abordado nesta aula..."

                        className="w-full p-3 rounded-xl border border-indigo-100 bg-white focus:ring-2 focus:ring-indigo-400 outline-none resize-none text-sm text-zinc-800 placeholder-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed transition"

                    />

                </div>

            </div>



            {/* Lista de Alunos */}

            <div className="flex-1 overflow-y-auto p-8 bg-zinc-50/30">

                {isLoading ? (

                    <div className="flex flex-col items-center justify-center py-12 gap-3">

                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />

                        <p className="text-sm text-zinc-500 font-medium">Carregando lista de chamada...</p>

                    </div>

                ) : alunosParaChamada.length === 0 ? (

                    <div className="flex flex-col items-center justify-center py-12 text-center">

                        <div className="p-4 bg-zinc-100 rounded-full text-zinc-400 mb-4">

                            <User className="w-8 h-8" />

                        </div>

                        <h3 className="text-lg font-bold text-zinc-900">Nenhum aluno ativo</h3>

                        <p className="text-zinc-500 max-w-xs mx-auto mt-1 text-sm">

                            Não há alunos ativos matriculados nesta turma para realizar a chamada.

                        </p>

                    </div>

                ) : (

                    <div className="space-y-3">

                        {alunosParaChamada.map(aluno => {

                            const status = marcacoes[aluno.id];

                            const isJustificada = status === 'falta_justificada';



                            return (

                                <div

                                    key={aluno.id}

                                    className="flex flex-col gap-3 p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm hover:border-indigo-200 transition-colors"

                                >

                                    {/* Linha do aluno + botões */}

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                                        <div className="flex items-center gap-3">

                                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 shrink-0">

                                                {aluno.nome.charAt(0).toUpperCase()}

                                            </div>

                                            <div className="flex flex-col">

                                                <span className="text-sm font-bold text-zinc-900">{aluno.nome}</span>

                                                <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">

                                                    ID: {aluno.id}

                                                </span>

                                            </div>

                                        </div>



                                        <div className="flex items-center gap-2 self-start sm:self-auto bg-zinc-50/80 p-1.5 rounded-xl border border-zinc-200/60">

                                            <Button

                                                type="button"

                                                variant="ghost"

                                                disabled={!canEdit}

                                                onClick={() => handleMarcar(aluno.id, 'presente')}

                                                className={`h-9 px-4 rounded-lg font-bold text-xs transition-all flex items-center gap-2 hover:cursor-pointer ${

                                                    status === 'presente'

                                                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:text-emerald-800'

                                                        : 'text-zinc-500 hover:bg-zinc-200/50'

                                                }`}

                                            >

                                                <Check className="w-3.5 h-3.5" />

                                                Presente

                                            </Button>



                                            <Button

                                                type="button"

                                                variant="ghost"

                                                disabled={!canEdit}

                                                onClick={() => handleMarcar(aluno.id, 'falta')}

                                                className={`h-9 px-4 rounded-lg font-bold text-xs transition-all flex items-center gap-2 hover:cursor-pointer ${

                                                    status === 'falta'

                                                        ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 hover:text-rose-800'

                                                        : 'text-zinc-500 hover:bg-zinc-200/50'

                                                }`}

                                            >

                                                <X className="w-3.5 h-3.5" />

                                                Falta

                                            </Button>



                                            <Button

                                                type="button"

                                                variant="ghost"

                                                disabled={!canEdit}

                                                onClick={() => handleMarcar(aluno.id, 'falta_justificada')}

                                                className={`h-9 px-4 rounded-lg font-bold text-xs transition-all flex items-center gap-2 hover:cursor-pointer ${

                                                    status === 'falta_justificada'

                                                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 hover:text-amber-800'

                                                        : 'text-zinc-500 hover:bg-zinc-200/50'

                                                }`}

                                            >

                                                <AlertTriangle className="w-3.5 h-3.5" />

                                                Justificada

                                            </Button>

                                        </div>

                                    </div>



                                    {/* Campo de justificativa — exibido apenas quando falta_justificada */}

                                    {isJustificada && (

                                        <div className="animate-in fade-in slide-in-from-top-1 duration-200">

                                            <textarea

                                                value={observacoes[aluno.id] || ''}

                                                onChange={(e) => handleObservacao(aluno.id, e.target.value)}

                                                disabled={!canEdit}

                                                rows={2}

                                                placeholder="Descreva a justificativa da falta (ex: atestado médico)..."

                                                className="w-full p-3 rounded-xl border border-amber-200 bg-amber-50/40 focus:ring-2 focus:ring-amber-400 outline-none resize-none text-sm text-zinc-800 placeholder-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed transition"

                                            />

                                        </div>

                                    )}

                                </div>

                            );

                        })}

                    </div>

                )}

            </div>



            {/* Footer com Botões */}

            <div className="p-8 bg-white border-t border-zinc-100 flex items-center justify-between gap-4">

                <Button

                    type="button"

                    variant="ghost"

                    onClick={onClose}

                    className="h-11 px-6 rounded-xl font-bold text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors hover:cursor-pointer"

                >

                    Cancelar

                </Button>



                <Button

                    type="button"

                    onClick={handleSalvar}

                    disabled={!canEdit || isSaving || alunosParaChamada.length === 0}

                    className="bg-indigo-600 hover:bg-indigo-700 text-white h-11 px-8 rounded-xl shadow-lg shadow-indigo-100 font-bold transition-all active:scale-95 flex items-center gap-2 hover:cursor-pointer"

                >

                    {isSaving ? (

                        <Loader2 className="w-4 h-4 animate-spin" />

                    ) : (

                        <Save className="w-4 h-4" />

                    )}

                    Salvar Chamada

                </Button>

            </div>

        </div>

    );

};
