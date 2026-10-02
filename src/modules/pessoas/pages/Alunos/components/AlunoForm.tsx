import React, { useState, useEffect } from 'react';
import { UserCircle, GraduationCap, CalendarDays, Music, ReceiptText, Loader2, FileText, Search, X, Users } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useAlunoForm } from '../hooks/useAlunoForm';
import { useResponsaveis, type Responsavel } from '../hooks/useResponsaveis';
import { AlunoMatriculas } from './AlunoMatriculas';
import { AlunoMensalidades } from './AlunoMensalidades';
import { AlunoAgendamentos } from './AlunoAgendamentos';
import { AlunoInstrumentos } from './AlunoInstrumentos';
import { AlunoContratos } from './AlunoContratos';
import { AddressFields } from './AddressFields';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Controller } from 'react-hook-form';
import type { Aluno } from '../types';
import { useHasModulo } from '@/shared/hooks/useHasModulo';

type AlunoTab = 'dados' | 'responsavel' | 'matriculas' | 'mensalidades' | 'agendamentos' | 'instrumentos' | 'contratos';

interface AlunoFormProps {
    onClose: () => void;
    onSuccess: () => void;
    aluno?: Aluno;
}

export const AlunoForm: React.FC<AlunoFormProps> = ({ onClose, onSuccess, aluno }) => {
    const [activeTab, setActiveTab] = useState<AlunoTab>('dados');
    const { form, onSubmit, isLoading, fullAlunoData, isFetchingFullData, refetch } = useAlunoForm(onSuccess, aluno);
    const { register, formState: { errors }, setValue, control, watch } = form;
    const { responsaveis, fetchResponsaveis, isLoading: isLoadingResponsaveis } = useResponsaveis();
    const [searchTerm, setSearchTerm] = useState('');
    const isEditing = !!aluno;
    const hasFinanceiro = useHasModulo('financeiro');
    const hasInstrumentos = useHasModulo('instrumentos');

    useEffect(() => {
        if (activeTab === 'responsavel' || (isEditing && responsaveis.length === 0)) {
            fetchResponsaveis();
        }
    }, [activeTab, fetchResponsaveis, isEditing, responsaveis.length]);

    useEffect(() => {
        const blocked =
            (activeTab === 'mensalidades' && !hasFinanceiro) ||
            (activeTab === 'contratos' && !hasFinanceiro) ||
            (activeTab === 'instrumentos' && !hasInstrumentos);
        if (blocked) setActiveTab('dados');
    }, [activeTab, hasFinanceiro, hasInstrumentos]);

    const handleSelectResponsavel = (id: string) => {
        const resp = responsaveis.find(r => r.id.toString() === id);
        if (resp) {
            setValue('id_responsavel', resp.id);
            setValue('responsavel_nome', resp.usuario.nome);
            setValue('responsavel_email', resp.usuario.email || '');
            setValue('responsavel_cpf', resp.usuario.cpf || '');
            setValue('responsavel_telefone', resp.usuario.telefone || '');
            setValue('responsavel_whatsapp', resp.usuario.whatsapp || '');
            setValue('responsavel_observacoes', resp.observacoes || '');
            setValue('responsavel_cep', resp.usuario.cep || '');
            setValue('responsavel_rua', resp.usuario.rua || '');
            setValue('responsavel_numero', resp.usuario.numero || '');
            setValue('responsavel_complemento', resp.usuario.complemento || '');
            setValue('responsavel_bairro', resp.usuario.bairro || '');
            setValue('responsavel_id_estado', resp.usuario.id_estado);
            setValue('responsavel_id_cidade', resp.usuario.id_cidade);
        }
    };

    const clearResponsavel = () => {
        setValue('id_responsavel', null);
        setValue('responsavel_nome', '');
        setValue('responsavel_email', '');
        setValue('responsavel_cpf', '');
        setValue('responsavel_telefone', '');
        setValue('responsavel_whatsapp', '');
        setValue('responsavel_observacoes', '');
        setValue('responsavel_cep', '');
        setValue('responsavel_rua', '');
        setValue('responsavel_numero', '');
        setValue('responsavel_complemento', '');
        setValue('responsavel_bairro', '');
        setValue('responsavel_id_estado', null);
        setValue('responsavel_id_cidade', null);
    };


    const filteredResponsaveis = responsaveis.filter(r => 
        r.usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.usuario.cpf && r.usuario.cpf.includes(searchTerm))
    );

    return (
        <div className="flex flex-col bg-white">
            {/* Header - Apenas Abas se for Edição */}
            {/* Header - Abas */}
            <div className="flex flex-col px-6 pt-4 pb-0 bg-zinc-50/30 shrink-0 border-b border-zinc-100 overflow-x-auto scrollbar-hide">
                <div className="flex items-center gap-1 min-w-max">
                        <button
                            type="button"
                            onClick={() => setActiveTab('dados')}
                            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer whitespace-nowrap ${activeTab === 'dados'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-zinc-400 hover:text-zinc-600'
                                }`}
                        >
                            <UserCircle className="w-4 h-4" />
                            Dados Gerais
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('responsavel')}
                            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer whitespace-nowrap ${activeTab === 'responsavel'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-zinc-400 hover:text-zinc-600'
                                }`}
                        >
                            <UserCircle className="w-4 h-4" />
                            Responsável
                        </button>
                        
                        {isEditing && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('matriculas')}
                                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer whitespace-nowrap ${activeTab === 'matriculas'
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-zinc-400 hover:text-zinc-600'
                                        }`}
                                >
                                    <GraduationCap className="w-4 h-4" />
                                    Matrículas
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('agendamentos')}
                                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer whitespace-nowrap ${activeTab === 'agendamentos'
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-zinc-400 hover:text-zinc-600'
                                        }`}
                                >
                                    <CalendarDays className="w-4 h-4" />
                                    Agendamentos
                                </button>
                                {hasInstrumentos && (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('instrumentos')}
                                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer whitespace-nowrap ${activeTab === 'instrumentos'
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-zinc-400 hover:text-zinc-600'
                                        }`}
                                >
                                    <Music className="w-4 h-4" />
                                    Instrumentos
                                </button>
                                )}
                                {hasFinanceiro && (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('mensalidades')}
                                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer whitespace-nowrap ${activeTab === 'mensalidades'
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-zinc-400 hover:text-zinc-600'
                                        }`}
                                >
                                    <ReceiptText className="w-4 h-4" />
                                    Mensalidades
                                </button>
                                )}
                                {hasFinanceiro && (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('contratos')}
                                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 hover:cursor-pointer whitespace-nowrap ${activeTab === 'contratos'
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-zinc-400 hover:text-zinc-600'
                                        }`}
                                >
                                    <FileText className="w-4 h-4" />
                                    Contratos
                                </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

            {/* Form Content */}
            <div className="flex flex-col">
                {['dados', 'responsavel'].includes(activeTab) ? (
                    <form onSubmit={onSubmit} className="flex flex-col flex-1">
                        {activeTab === 'dados' ? (
                            <div key="tab-dados" className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="nome" className={`font-medium ml-1 ${errors.nome ? 'text-rose-500' : 'text-zinc-700'}`}>
                                            Nome Completo *
                                        </Label>
                                        <Input
                                            id="nome"
                                            {...register('nome')}
                                            placeholder="Ex: Maria Souza"
                                            className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.nome ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}
                                        />
                                        {errors.nome && <p className="text-[11px] text-rose-500 ml-1">{errors.nome.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className={`font-medium ml-1 ${errors.email ? 'text-rose-500' : 'text-zinc-700'}`}>
                                            E-mail
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            {...register('email')}
                                            autoComplete="email"
                                            placeholder="maria@email.com"
                                            className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.email ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}
                                        />
                                        {errors.email && <p className="text-[11px] text-rose-500 ml-1">{errors.email.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password" className={`font-medium ml-1 ${errors.password ? 'text-rose-500' : 'text-zinc-700'}`}>
                                            Senha (opcional)
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            {...register('password')}
                                            placeholder="••••••••"
                                            className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.password ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}
                                        />
                                        {errors.password && <p className="text-[11px] text-rose-500 ml-1">{errors.password.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation" className={`font-medium ml-1 ${errors.password_confirmation ? 'text-rose-500' : 'text-zinc-700'}`}>
                                            Confirmar Senha (opcional)
                                        </Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            {...register('password_confirmation')}
                                            placeholder="••••••••"
                                            className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.password_confirmation ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}
                                        />
                                        {errors.password_confirmation && <p className="text-[11px] text-rose-500 ml-1">{errors.password_confirmation.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="cpf" className={`font-medium ml-1 ${errors.cpf ? 'text-rose-500' : 'text-zinc-700'}`}>
                                            CPF
                                        </Label>
                                        <Input
                                            id="cpf"
                                            {...register('cpf')}
                                            placeholder="000.000.000-00"
                                            className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.cpf ? 'border-rose-500 focus-visible:ring-rose-500' : 'border-zinc-200'}`}
                                        />
                                        {errors.cpf && <p className="text-[11px] text-rose-500 ml-1">{errors.cpf.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="telefone" className="text-zinc-700 font-medium ml-1">Telefone</Label>
                                        <Input
                                            id="telefone"
                                            {...register('telefone')}
                                            placeholder="(00) 0000-0000"
                                            className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="whatsapp" className="text-zinc-700 font-medium ml-1">WhatsApp</Label>
                                        <Input
                                            id="whatsapp"
                                            {...register('whatsapp')}
                                            placeholder="(00) 00000-0000"
                                            className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="data_nascimento" className="text-zinc-700 font-medium ml-1">Data de Nascimento</Label>
                                        <Input
                                            id="data_nascimento"
                                            type="date"
                                            {...register('data_nascimento')}
                                            className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"
                                        />
                                    </div>
                                </div>

                                <AddressFields form={form as any} />

                                <div className="space-y-2">
                                    <Label htmlFor="observacoes" className="text-zinc-700 font-medium ml-1">Observações</Label>
                                    <textarea
                                        id="observacoes"
                                        {...register('observacoes')}
                                        className="w-full min-h-[100px] p-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-all resize-none text-sm"
                                        placeholder="Detalhes adicionais sobre o aluno..."
                                    />
                                </div>
                            </div>
                        ) : (
                            <div key="tab-responsavel" className="p-8 space-y-6">
                                {/* Seleção de Responsável Existente */}
                                <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-indigo-600 rounded-lg">
                                                <Users className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-indigo-900 leading-tight">Vincular Responsável Existente</h3>
                                                <p className="text-[11px] text-indigo-600 font-medium">Economize tempo selecionando um responsável já cadastrado.</p>
                                            </div>
                                        </div>
                                        {watch('id_responsavel') && (
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={clearResponsavel}
                                                className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1.5 px-3 rounded-full font-bold"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                                Limpar Seleção
                                            </Button>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Controller
                                            name="id_responsavel"
                                            control={control}
                                            render={({ field }) => (
                                                <div className="relative group">
                                                    <Select
                                                        onValueChange={handleSelectResponsavel}
                                                        value={field.value?.toString() || ""}
                                                    >
                                                        <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm rounded-xl border-indigo-200/60 focus:ring-indigo-600 shadow-sm transition-all group-hover:border-indigo-300">
                                                            <div className="flex items-center gap-2 truncate">
                                                                <Search className="w-4 h-4 text-indigo-400 shrink-0" />
                                                                <SelectValue placeholder="Pesquisar por nome ou CPF...">
                                                                    {watch('responsavel_nome') || "Pesquisar por nome ou CPF..."}
                                                                </SelectValue>
                                                            </div>
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl border-indigo-100 shadow-xl overflow-hidden">
                                                            <div className="p-2 border-b border-zinc-50">
                                                                <Input 
                                                                    placeholder="Filtrar responsáveis..." 
                                                                    value={searchTerm}
                                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                                    className="h-9 text-xs border-zinc-100 bg-zinc-50/50 focus-visible:ring-indigo-600 rounded-lg"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            </div>
                                                            <div className="max-h-[250px] overflow-y-auto">
                                                                {isLoadingResponsaveis ? (
                                                                    <div className="p-4 flex items-center justify-center gap-2 text-indigo-600">
                                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                                        <span className="text-xs font-medium">Buscando responsáveis...</span>
                                                                    </div>
                                                                ) : filteredResponsaveis.length === 0 ? (
                                                                    <div className="p-4 text-center">
                                                                        <p className="text-xs text-zinc-400 font-medium italic">Nenhum responsável encontrado.</p>
                                                                    </div>
                                                                ) : (
                                                                    filteredResponsaveis.map((resp) => (
                                                                        <SelectItem 
                                                                            key={resp.id} 
                                                                            value={resp.id.toString()}
                                                                            className="py-3 px-4 focus:bg-indigo-50/50 hover:cursor-pointer transition-colors"
                                                                        >
                                                                            <div className="flex flex-col gap-0.5">
                                                                                <span className="font-bold text-zinc-900 text-[13px]">{resp.usuario.nome}</span>
                                                                                <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                                                                    {resp.usuario.cpf && (
                                                                                        <span className="bg-zinc-100 px-1.5 py-0.5 rounded uppercase font-mono tracking-tighter">
                                                                                            {resp.usuario.cpf}
                                                                                        </span>
                                                                                    )}
                                                                                    {resp.usuario.email && (
                                                                                        <span className="flex items-center gap-1">
                                                                                            <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                                                                                            {resp.usuario.email}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </div>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="responsavel_nome" className="text-zinc-700 font-medium ml-1">
                                            Nome do Responsável
                                        </Label>
                                        <Input
                                            id="responsavel_nome"
                                            {...register('responsavel_nome')}
                                            placeholder="Ex: João da Silva"
                                            className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="responsavel_email" className="text-zinc-700 font-medium ml-1">
                                            E-mail do Responsável
                                        </Label>
                                        <Input
                                            id="responsavel_email"
                                            type="email"
                                            {...register('responsavel_email')}
                                            autoComplete="off"
                                            placeholder="responsavel@email.com"
                                            className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="responsavel_cpf" className="text-zinc-700 font-medium ml-1">
                                            CPF do Responsável
                                        </Label>
                                        <Input
                                            id="responsavel_cpf"
                                            {...register('responsavel_cpf')}
                                            placeholder="000.000.000-00"
                                            className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="responsavel_telefone" className="text-zinc-700 font-medium ml-1">
                                            Telefone do Responsável
                                        </Label>
                                        <Input
                                            id="responsavel_telefone"
                                            {...register('responsavel_telefone')}
                                            placeholder="(00) 0000-0000"
                                            className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="responsavel_whatsapp" className="text-zinc-700 font-medium ml-1">
                                            WhatsApp do Responsável
                                        </Label>
                                        <Input
                                            id="responsavel_whatsapp"
                                            {...register('responsavel_whatsapp')}
                                            placeholder="(00) 00000-0000"
                                            className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"
                                        />
                                    </div>
                                </div>

                                <AddressFields form={form as any} prefix="responsavel_" />

                                <div className="space-y-2">
                                    <Label htmlFor="responsavel_observacoes" className="text-zinc-700 font-medium ml-1">Observações do Responsável</Label>
                                    <textarea
                                        id="responsavel_observacoes"
                                        {...register('responsavel_observacoes')}
                                        className="w-full min-h-[100px] p-4 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-all resize-none text-sm"
                                        placeholder="Detalhes adicionais sobre o responsável..."
                                    />
                                </div>
                            </div>
                        )}

                        <div className="pb-8 pl-8 pr-8 pt-6 border-t border-zinc-100 bg-zinc-50/30 flex flex-col-reverse md:flex-row md:justify-end gap-3 shrink-0 rounded-b-[24px] mt-auto">
                            <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading} className="rounded-full px-6 h-9 font-bold hover:cursor-pointer hover:bg-zinc-100 w-full md:w-auto">
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 h-9 font-bold shadow-lg shadow-indigo-100 transition-all hover:cursor-pointer active:scale-95 w-full md:w-auto">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    aluno ? 'Atualizar Dados' : 'Salvar Aluno'
                                )}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <>
                        <div className="p-8 space-y-6">
                            {activeTab === 'matriculas' ? (
                                <AlunoMatriculas
                                    alunoId={aluno?.id}
                                    matriculas={fullAlunoData?.matriculas}
                                    isLoading={isFetchingFullData}
                                    alunoNome={fullAlunoData?.usuario?.nome}
                                    onSuccess={() => {
                                        refetch();
                                        setActiveTab(hasFinanceiro ? 'contratos' : 'matriculas');
                                    }}
                                />
                            ) : activeTab === 'mensalidades' && hasFinanceiro ? (
                                <AlunoMensalidades
                                    aluno={fullAlunoData || undefined}
                                    isLoading={isFetchingFullData}
                                    onSuccess={refetch}
                                />
                            ) : activeTab === 'agendamentos' ? (
                                <AlunoAgendamentos alunoId={aluno?.id} />
                            ) : activeTab === 'instrumentos' && hasInstrumentos ? (
                                <AlunoInstrumentos
                                    alunoId={aluno?.id as number}
                                    instrumentos={fullAlunoData?.instrumentos}
                                    isLoading={isFetchingFullData}
                                    onSuccess={() => {
                                        refetch();
                                        setActiveTab(hasFinanceiro ? 'contratos' : 'instrumentos');
                                    }}
                                />
                            ) : activeTab === 'contratos' && hasFinanceiro ? (
                                <AlunoContratos
                                    alunoId={aluno?.id}
                                    alunoNome={fullAlunoData?.usuario?.nome}
                                    matriculas={fullAlunoData?.matriculas}
                                    instrumentos={fullAlunoData?.instrumentos}
                                    apresentacoes={fullAlunoData?.apresentacoes}
                                    contratosAvulsos={fullAlunoData?.contratosAvulsos}
                                    isLoading={isFetchingFullData}
                                    onSuccess={refetch}
                                />
                            ) : null}
                        </div>

                        {/* Footer genérico para as outras abas */}
                        <div className="pb-8 pl-8 pr-8 pt-6 border-t border-zinc-100 bg-zinc-50/30 flex justify-end gap-3 shrink-0 rounded-b-[24px]">
                            <Button variant="ghost" type="button" onClick={onClose} className="rounded-full px-6 h-9 font-bold hover:cursor-pointer hover:bg-zinc-100">
                                Fechar
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AlunoForm;
