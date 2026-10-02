import React, { useState } from 'react';
import { FileText, Printer, BookOpen, Music, Loader2, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { substituirPlaceholders } from '@/lib/contrato-utils';
import { printContract } from '@/lib/print-utils';
import type { Matricula, Instrumento, Apresentacao, Espetaculo, AlunoContrato } from '../types';
import { descreverMatricula } from '../utils/matricula';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/shared/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { AtribuirContratoModal } from './AtribuirContratoModal';
import { useRemoverContratoAvulso } from '../hooks/useRemoverContratoAvulso';
import { useHasModulo } from '@/shared/hooks/useHasModulo';

interface AlunoContratosProps {
    alunoId?: number;
    alunoNome?: string;
    matriculas?: Matricula[];
    instrumentos?: Instrumento[];
    apresentacoes?: Apresentacao[];
    contratosAvulsos?: AlunoContrato[];
    isLoading?: boolean;
    onSuccess?: () => void;
}

export const AlunoContratos: React.FC<AlunoContratosProps> = ({
    alunoId,
    alunoNome,
    matriculas = [],
    instrumentos = [],
    apresentacoes = [],
    contratosAvulsos = [],
    isLoading = false,
    onSuccess
}) => {
    const [isAtribuirModalOpen, setIsAtribuirModalOpen] = useState(false);
    const hasEspetaculos = useHasModulo('espetaculos');

    const {
        contratoParaRemover,
        isRemoving,
        confirmarRemocao,
        cancelarRemocao,
        executarRemocao,
    } = useRemoverContratoAvulso(alunoId, () => onSuccess?.());

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-sm text-zinc-500 font-medium">Carregando contratos...</p>
            </div>
        );
    }

    const hasMatriculaContracts = matriculas.some(m => m.contrato_gerado);
    const hasInstrumentoContracts = instrumentos.some(i => i.contrato_gerado);

    // Pegar espetáculos únicos que possuem contrato
    const espetaculosUnicosMap = new Map<number, Espetaculo>();
    if (hasEspetaculos) {
      apresentacoes.forEach(ap => {
          if (ap.espetaculo?.contrato) {
              espetaculosUnicosMap.set(ap.espetaculo.id, ap.espetaculo);
          }
      });
    }
    const espetaculosComContrato = Array.from(espetaculosUnicosMap.values());
    const hasEspetaculoContracts = espetaculosComContrato.length > 0;

    const hasAvulsoContracts = contratosAvulsos.length > 0;

    const renderEmpty = () => (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-zinc-100 rounded-full text-zinc-400 mb-4">
                <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Nenhum contrato encontrado</h3>
            <p className="text-zinc-500 max-w-xs mx-auto mt-1 text-sm">
                Este aluno ainda não possui contratos gerados (matrículas, empréstimos ou espetáculos).
            </p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Contratos Disponíveis
                </h3>

                <Button
                    type="button"
                    onClick={() => setIsAtribuirModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full h-9 px-5 gap-2 shadow-lg shadow-indigo-100 font-bold active:scale-95 transition-all text-sm hover:cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    Atribuir Contrato
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {(!hasMatriculaContracts && !hasInstrumentoContracts && !hasEspetaculoContracts && !hasAvulsoContracts) ? (
                    renderEmpty()
                ) : (
                    <>
                        {/* Contratos Avulsos */}
                        {contratosAvulsos.map((avulso) => (
                            <Card key={`avulso-${avulso.id}`} className="border-zinc-100 shadow-sm overflow-hidden group hover:border-indigo-100 transition-colors">
                                <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-zinc-900 leading-none">
                                                Contrato Avulso - {avulso.contrato?.nome || 'Documento'}
                                            </h4>
                                            <p className="text-[11px] text-zinc-500 mt-1 uppercase tracking-wider font-medium">
                                                Gerado em {new Date(avulso.created_at).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-9 px-4 gap-2 text-zinc-600 border-zinc-200 rounded-full hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 hover:cursor-pointer transition-all w-full md:w-auto w-full md:w-auto"
                                            onClick={() => {
                                                const alunoObj = { usuario: { nome: alunoNome } };
                                                const conteudoFinal = substituirPlaceholders(avulso.contrato_gerado, {
                                                    aluno: alunoObj as import('@/lib/contrato-utils').AlunoPayload,
                                                });
                                                printContract(conteudoFinal, `Contrato Avulso - ${alunoNome}`);
                                            }}
                                        >
                                            <Printer className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase tracking-wider">Imprimir</span>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-9 px-4 gap-2 text-red-500 border-red-200 rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-300 hover:cursor-pointer transition-all w-full md:w-auto"
                                            onClick={() => confirmarRemocao(avulso)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="text-xs font-bold uppercase tracking-wider">Remover</span>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Contratos de Matrícula */}
                        {matriculas.map((matricula) => {
                            if (!matricula.contrato_gerado) return null;
                            const descricao = descreverMatricula(matricula);
                            return (
                            <Card key={`mat-${matricula.id}`} className="border-zinc-100 shadow-sm overflow-hidden group hover:border-indigo-100 transition-colors">
                                <CardContent className="p-4 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <BookOpen className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-zinc-900 leading-none">
                                                Contrato de Matrícula - {descricao.curso || 'Curso'}
                                            </h4>
                                            <p className="text-[11px] text-zinc-500 mt-1 uppercase tracking-wider font-medium">
                                                {descricao.isCurso ? descricao.tipoLabel : descricao.titulo} • Gerado em {new Date(`${matricula.data.substring(0, 10)}T00:00:00`).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-9 px-4 gap-2 text-zinc-600 border-zinc-200 rounded-full hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 hover:cursor-pointer transition-all"
                                        onClick={() => {
                                            const alunoObj = matricula.aluno || { usuario: { nome: alunoNome } };
                                            const conteudoFinal = substituirPlaceholders(matricula.contrato_gerado!, {
                                                aluno: alunoObj as import('@/lib/contrato-utils').AlunoPayload,
                                                turma: matricula.turma ?? undefined,
                                                data_matricula: matricula.data
                                            });
                                            printContract(conteudoFinal, `Contrato de Matrícula - ${alunoNome}`);
                                        }}
                                    >
                                        <Printer className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Imprimir</span>
                                    </Button>
                                </CardContent>
                            </Card>
                            );
                        })}

                        {/* Contratos de Instrumentos */}
                        {instrumentos.map((inst) => inst.contrato_gerado && (
                            <Card key={`inst-${inst.id}`} className="border-zinc-100 shadow-sm overflow-hidden group hover:border-indigo-100 transition-colors">
                                <CardContent className="p-4 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                            <Music className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-zinc-900 leading-none">
                                                Termo de Responsabilidade - {inst.nome}
                                            </h4>
                                            <p className="text-[11px] text-zinc-500 mt-1 uppercase tracking-wider font-medium">
                                                {inst.tipo} {inst.numero_serie ? `• SN: ${inst.numero_serie}` : ''} • Emprestado em {inst.data_emprestimo ? new Date(inst.data_emprestimo).toLocaleDateString('pt-BR') : '-'}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-9 px-4 gap-2 text-zinc-600 border-zinc-200 rounded-full hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 hover:cursor-pointer transition-all"
                                        onClick={() => {
                                            const conteudoFinal = substituirPlaceholders(inst.contrato_gerado!, {
                                                instrumento: inst as import('@/lib/contrato-utils').InstrumentoPayload,
                                                data_emprestimo: inst.data_emprestimo || undefined
                                            });
                                            printContract(conteudoFinal, `Termo de Responsabilidade - ${inst.nome}`);
                                        }}
                                    >
                                        <Printer className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Imprimir</span>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Contratos de Espetáculos */}
                        {espetaculosComContrato.map((espetaculo) => espetaculo.contrato && (
                            <Card key={`esp-${espetaculo.id}`} className="border-zinc-100 shadow-sm overflow-hidden group hover:border-indigo-100 transition-colors">
                                <CardContent className="p-4 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-zinc-900 leading-none">
                                                Contrato de Espetáculo - {espetaculo.titulo}
                                            </h4>
                                            <p className="text-[11px] text-zinc-500 mt-1 uppercase tracking-wider font-medium">
                                                {espetaculo.local || 'Local Definir'} • Evento em {espetaculo.data_evento ? new Date(espetaculo.data_evento + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-9 px-4 gap-2 text-zinc-600 border-zinc-200 rounded-full hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 hover:cursor-pointer transition-all"
                                        onClick={() => {
                                            const alunoObj = { usuario: { nome: alunoNome } };
                                            let conteudoFinal = substituirPlaceholders(espetaculo.contrato!.conteudo, {
                                                aluno: alunoObj as import('@/lib/contrato-utils').AlunoPayload,
                                            });
                                            // Substituir os dados do espetáculo, adaptando se precisar
                                            if (espetaculo.data_evento) {
                                                conteudoFinal = conteudoFinal.replace(/\[DATA_EVENTO\]/g, new Date(espetaculo.data_evento + 'T00:00:00').toLocaleDateString('pt-BR'));
                                            }
                                            if (espetaculo.titulo) {
                                                conteudoFinal = conteudoFinal.replace(/\[ESPETACULO_TITULO\]/g, espetaculo.titulo);
                                            }
                                            if (espetaculo.local) {
                                                conteudoFinal = conteudoFinal.replace(/\[LOCAL_EVENTO\]/g, espetaculo.local);
                                            }
                                            printContract(conteudoFinal, `Contrato de Espetáculo - ${espetaculo.titulo} (${alunoNome})`);
                                        }}
                                    >
                                        <Printer className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Imprimir</span>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </>
                )}
            </div>

            {/* Modal de Atribuição de Contrato */}
            <Dialog open={isAtribuirModalOpen} onOpenChange={setIsAtribuirModalOpen}>
                <DialogContent className="max-w-2xl rounded-[32px] p-0 border-none shadow-2xl text-zinc-900 bg-white">
                    <DialogHeader className=" bg-indigo-50/50 border-b border-indigo-100">
                        <DialogTitle className="text-xl font-black text-zinc-900 flex items-center gap-2">
                            <Plus className="w-6 h-6 text-indigo-600" />
                            Atribuir <span className="text-indigo-600">Contrato</span>
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500">
                            Selecione uma matrícula ou instrumento para gerar o contrato do aluno {alunoNome}.
                        </DialogDescription>
                    </DialogHeader>

                    <AtribuirContratoModal
                        alunoId={alunoId}
                        alunoNome={alunoNome}
                        matriculas={matriculas}
                        instrumentos={instrumentos}
                        onClose={() => setIsAtribuirModalOpen(false)}
                        onSuccess={() => {
                            setIsAtribuirModalOpen(false);
                            onSuccess?.();
                        }}
                    />
                </DialogContent>
            </Dialog>

            {/* AlertDialog de Confirmação de Remoção */}
            <AlertDialog open={!!contratoParaRemover} onOpenChange={(open) => !open && cancelarRemocao()}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-zinc-900">
                            <Trash2 className="w-5 h-5 text-red-500" />
                            Remover Contrato Avulso
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-500">
                            Tem certeza que deseja remover o contrato{' '}
                            <span className="font-semibold text-zinc-700">
                                {contratoParaRemover?.contrato?.nome || 'selecionado'}
                            </span>
                            ? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={cancelarRemocao}
                            className="rounded-full h-9 hover:cursor-pointer"
                        >
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={executarRemocao}
                            disabled={isRemoving}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-full h-9 hover:cursor-pointer gap-2"
                        >
                            {isRemoving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4" />
                            )}
                            {isRemoving ? 'Removendo...' : 'Remover'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
