import React from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Controller } from 'react-hook-form';
import { useAtribuirContrato } from '../hooks/useAtribuirContrato';
import type { Matricula, Instrumento } from '../types';

interface AtribuirContratoModalProps {
    alunoId?: number;
    alunoNome?: string;
    matriculas?: Matricula[];
    instrumentos?: Instrumento[];
    onClose: () => void;
    onSuccess: () => void;
}

export const AtribuirContratoModal: React.FC<AtribuirContratoModalProps> = ({
    alunoId,
    alunoNome,
    matriculas = [],
    instrumentos = [],
    onClose,
    onSuccess
}) => {
    const { form, onSubmit, isLoading, contratos } = useAtribuirContrato(alunoId, onSuccess);
    const { control, watch, formState: { errors } } = form;

    const tipoVinculo = watch('tipo_vinculo');
    const selectedContratoId = watch('contrato_id');

    return (
        <div className="bg-white rounded-[24px] overflow-hidden">
            <form onSubmit={(e) => { e.stopPropagation(); onSubmit(e); }} className="flex flex-col">
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Tipo de Vínculo */}
                        <div className="space-y-2">
                            <Label htmlFor="tipo_vinculo" className="text-zinc-700 font-medium ml-1">Vincular a *</Label>
                            <Controller
                                name="tipo_vinculo"
                                control={control}
                                render={({ field }) => (
                                    <Select 
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            form.setValue('id_item', ''); // Resetar item ao mudar tipo
                                        }} 
                                        value={field.value}
                                    >
                                        <SelectTrigger className="h-11 rounded-xl border-zinc-200 focus:ring-indigo-600">
                                            <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="matricula">Matrícula</SelectItem>
                                            <SelectItem value="instrumento">Empréstimo de Instrumento</SelectItem>
                                            <SelectItem value="avulso">Aluno (Avulso)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        {/* Seleção do Item (Matrícula ou Instrumento) */}
                        {tipoVinculo !== 'avulso' && (
                            <div className="space-y-2">
                                <Label htmlFor="id_item" className={`font-medium ml-1 ${errors.id_item ? 'text-rose-500' : 'text-zinc-700'}`}>
                                    {tipoVinculo === 'matricula' ? 'Selecionar Matrícula *' : 'Selecionar Instrumento *'}
                                </Label>
                                <Controller
                                    name="id_item"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className={`h-11 rounded-xl border-zinc-200 focus:ring-indigo-600 ${errors.id_item ? 'border-rose-500' : ''}`}>
                                                <SelectValue placeholder={tipoVinculo === 'matricula' ? "Escolha a matrícula" : "Escolha o instrumento"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {tipoVinculo === 'matricula' ? (
                                                    matriculas.length > 0 ? (
                                                        matriculas.map(m => (
                                                            <SelectItem key={m.id} value={String(m.id)}>
                                                                {m.turma?.curso?.nome || 'Matrícula'} - {m.turma?.descricao || `#${m.id}`}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <SelectItem value="none" disabled>Nenhuma matrícula disponível</SelectItem>
                                                    )
                                                ) : (
                                                    instrumentos.length > 0 ? (
                                                        instrumentos.map(i => (
                                                            <SelectItem key={i.id} value={String(i.id)}>
                                                                {i.nome} ({i.tipo})
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <SelectItem value="none" disabled>Nenhum instrumento disponível</SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.id_item && <p className="text-[11px] text-rose-500 ml-1">{errors.id_item.message}</p>}
                            </div>
                        )}

                        {/* Template de Contrato */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="contrato_id" className={`font-medium ml-1 ${errors.contrato_id ? 'text-rose-500' : 'text-zinc-700'}`}>
                                Template de Contrato *
                            </Label>
                            <Controller
                                name="contrato_id"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className={`h-11 rounded-xl border-zinc-200 focus:ring-indigo-600 ${errors.contrato_id ? 'border-rose-500' : ''}`}>
                                            <SelectValue placeholder="Selecione um template para gerar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {contratos.map(c => (
                                                <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.contrato_id && <p className="text-[11px] text-rose-500 ml-1">{errors.contrato_id.message}</p>}
                        </div>

                        {/* Informação de Geração */}
                        {selectedContratoId && (
                            <div className="md:col-span-2 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex gap-3 animate-in fade-in slide-in-from-top-2">
                                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 h-fit">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-indigo-900">Snapshot pronto para geração</p>
                                    <p className="text-xs text-indigo-700 mt-1">
                                        Os dados {tipoVinculo === 'avulso' ? 'do aluno' : (tipoVinculo === 'matricula' ? 'da matrícula' : 'do empréstimo')} e do aluno {alunoNome} serão mesclados ao template selecionado para criar um documento fixo.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="pb-8 pl-8 pr-8 pt-6 border-t border-zinc-100 bg-zinc-50/30 flex justify-end gap-3 shrink-0 rounded-b-[24px]">
                    <Button 
                        variant="ghost" 
                        type="button" 
                        onClick={onClose} 
                        disabled={isLoading} 
                        className="rounded-full px-6 h-9 font-bold hover:cursor-pointer hover:bg-zinc-100"
                    >
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={isLoading} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 h-9 font-bold shadow-lg shadow-indigo-100 transition-all hover:cursor-pointer active:scale-95"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Atribuindo...
                            </>
                        ) : (
                            'Confirmar Atribuição'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};
