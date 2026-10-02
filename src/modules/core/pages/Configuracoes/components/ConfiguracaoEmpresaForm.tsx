import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Building2, Loader2, Save, MapPin } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { useConfiguracaoEmpresa } from '../hooks/useConfiguracaoEmpresa';
import type { ConfiguracaoEmpresaFormData } from '@/modules/core';
import { listCidades, listEstados, type Cidade, type Estado } from '@/modules/core/api/localidades';
import { formatCnpj, unmaskCnpj } from '@/shared/lib/utils';

export const ConfiguracaoEmpresaForm: React.FC = () => {
    const { config, isLoading, isSaving, salvarConfig } = useConfiguracaoEmpresa();
    const [estados, setEstados] = useState<Estado[]>([]);
    const [cidades, setCidades] = useState<Cidade[]>([]);
    const [isLoadingEstados, setIsLoadingEstados] = useState(false);
    const [isLoadingCidades, setIsLoadingCidades] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<ConfiguracaoEmpresaFormData>({
        defaultValues: {
            nome_fantasia: '',
            razao_social: '',
            cnpj: '',
            rua: '',
            numero: '',
            bairro: '',
            complemento: '',
            cep: '',
            id_estado: '',
            id_cidade: '',
        },
    });

    const estadoSelecionado = watch('id_estado');

    useEffect(() => {
        const fetchEstados = async () => {
            try {
                setIsLoadingEstados(true);
                const data = await listEstados();
                setEstados(data);
            } catch (error) {
                console.error('Erro ao buscar estados:', error);
            } finally {
                setIsLoadingEstados(false);
            }
        };
        fetchEstados();
    }, []);

    useEffect(() => {
        if (estadoSelecionado) {
            const fetchCidades = async () => {
                try {
                    setIsLoadingCidades(true);
                    const data = await listCidades(estadoSelecionado);
                    setCidades(data);
                } catch (error) {
                    console.error('Erro ao buscar cidades:', error);
                } finally {
                    setIsLoadingCidades(false);
                }
            };
            fetchCidades();
        } else {
            setCidades([]);
        }
    }, [estadoSelecionado]);

    useEffect(() => {
        if (config) {
            reset({
                nome_fantasia: config.nome_fantasia,
                razao_social: config.razao_social || '',
                cnpj: formatCnpj(config.cnpj || ''),
                rua: config.rua || '',
                numero: config.numero || '',
                bairro: config.bairro || '',
                complemento: config.complemento || '',
                cep: config.cep || '',
                id_estado: config.id_estado?.toString() || '',
                id_cidade: config.id_cidade?.toString() || '',
            });
        }
    }, [config, reset]);

    const onSubmit = (data: ConfiguracaoEmpresaFormData) => {
        salvarConfig(data);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20 gap-2 text-zinc-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Carregando dados da empresa...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
            <div className="p-8 space-y-8">
                {/* Dados da Empresa */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Building2 className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-zinc-900">Identificação da Empresa</h2>
                            <p className="text-xs text-zinc-500 mt-0.5">Informações básicas da sua instituição</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="nome_fantasia" className={`font-medium ml-1 ${errors.nome_fantasia ? 'text-rose-500' : 'text-zinc-700'}`}>
                                Nome Fantasia *
                            </Label>
                            <Input
                                id="nome_fantasia"
                                placeholder="Ex: Campasso Escola de Música"
                                className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.nome_fantasia ? 'border-rose-500' : 'border-zinc-200'}`}
                                {...register('nome_fantasia', { required: 'Nome fantasia é obrigatório' })}
                            />
                            {errors.nome_fantasia && <p className="text-[11px] text-rose-500 ml-1">{errors.nome_fantasia.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="razao_social" className="text-zinc-700 font-medium ml-1">Razão Social</Label>
                            <Input
                                id="razao_social"
                                placeholder="Ex: João da Silva ME"
                                className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"
                                {...register('razao_social')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cnpj" className={`font-medium ml-1 ${errors.cnpj ? 'text-rose-500' : 'text-zinc-700'}`}>
                                CNPJ *
                            </Label>
                            <Input
                                id="cnpj"
                                placeholder="00.000.000/0000-00"
                                className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.cnpj ? 'border-rose-500' : 'border-zinc-200'}`}
                                {...register('cnpj', {
                                    required: 'CNPJ é obrigatório',
                                    validate: (value) => unmaskCnpj(value ?? '').length === 14 || 'CNPJ deve ter 14 caracteres',
                                    onChange: (e) => setValue('cnpj', formatCnpj(e.target.value)),
                                })}
                            />
                            <p className="text-[11px] text-zinc-400 ml-1">
                                Usado por todos os usuários da escola para fazer login. Ao alterar, avise sua equipe.
                            </p>
                            {errors.cnpj && <p className="text-[11px] text-rose-500 ml-1">{errors.cnpj.message}</p>}
                        </div>
                    </div>
                </div>

                {/* Endereço */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <MapPin className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-zinc-900">Endereço</h2>
                            <p className="text-xs text-zinc-500 mt-0.5">Localização física da unidade</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="rua" className="text-zinc-700 font-medium ml-1">Rua / Logradouro</Label>
                            <Input
                                id="rua"
                                placeholder="Ex: Av. Sete de Setembro"
                                className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"
                                {...register('rua')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="numero" className="text-zinc-700 font-medium ml-1">Número</Label>
                            <Input
                                id="numero"
                                placeholder="Ex: 123"
                                className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"
                                {...register('numero')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bairro" className="text-zinc-700 font-medium ml-1">Bairro</Label>
                            <Input
                                id="bairro"
                                placeholder="Ex: Centro"
                                className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"
                                {...register('bairro')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="complemento" className="text-zinc-700 font-medium ml-1">Complemento</Label>
                            <Input
                                id="complemento"
                                placeholder="Ex: Sala 402"
                                className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"
                                {...register('complemento')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cep" className="text-zinc-700 font-medium ml-1">CEP</Label>
                            <Input
                                id="cep"
                                placeholder="00000-000"
                                className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"
                                {...register('cep')}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="id_estado" className="text-zinc-700 font-medium ml-1">Estado</Label>
                            <Select
                                value={estadoSelecionado || undefined}
                                onValueChange={(val) => {
                                    setValue('id_estado', val);
                                    setValue('id_cidade', '');
                                }}
                            >
                                <SelectTrigger id="id_estado" className="h-11 rounded-xl border-zinc-200">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {isLoadingEstados ? (
                                        <div className="p-2 flex items-center justify-center">
                                            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                                        </div>
                                    ) : (
                                        estados.map((e) => (
                                            <SelectItem key={e.id} value={e.id.toString()}>
                                                {e.nome} ({e.sigla})
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="id_cidade" className="text-zinc-700 font-medium ml-1">Cidade</Label>
                            <Select
                                value={watch('id_cidade') || undefined}
                                onValueChange={(val) => setValue('id_cidade', val)}
                                disabled={!estadoSelecionado || isLoadingCidades}
                            >
                                <SelectTrigger id="id_cidade" className="h-11 rounded-xl border-zinc-200">
                                    <SelectValue placeholder={isLoadingCidades ? 'Carregando...' : 'Selecione...'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {cidades.map((c) => (
                                        <SelectItem key={c.id} value={c.id.toString()}>
                                            {c.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="pb-8 pl-8 pr-8 pt-6 border-t border-zinc-100 bg-zinc-50/30 flex justify-end gap-3 shrink-0 rounded-b-[24px]">
                <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 h-9 font-bold shadow-lg shadow-indigo-100 transition-all hover:cursor-pointer active:scale-95"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Salvar Dados da Empresa
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
};
