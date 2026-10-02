import React, { useEffect } from 'react';

import { Controller, useForm } from 'react-hook-form';

import { QrCode, Loader2, Save } from 'lucide-react';

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

import { Checkbox } from '@/shared/components/ui/checkbox';

import { useConfiguracaoPix } from '../hooks/useConfiguracaoPix';

import type { ConfiguracaoPixFormData } from '@/modules/financeiro';



const TIPOS_CHAVE: { value: ConfiguracaoPixFormData['tipo_chave']; label: string }[] = [

    { value: 'cpf', label: 'CPF' },

    { value: 'cnpj', label: 'CNPJ' },

    { value: 'email', label: 'E-mail' },

    { value: 'telefone', label: 'Telefone' },

    { value: 'evp', label: 'Chave Aleatória (EVP)' },

];



export const ConfiguracaoPixForm: React.FC = () => {

    const { config, isLoading, isSaving, salvarConfig } = useConfiguracaoPix();



    const {

        register,

        handleSubmit,

        setValue,

        watch,

        reset,

        control,

        formState: { errors },

    } = useForm<ConfiguracaoPixFormData>({

        defaultValues: {

            chave_pix: '',

            tipo_chave: 'cpf',

            nome_beneficiario: '',

            cidade: '',

            exibir_qrcode: true,

        },

    });



    useEffect(() => {

        if (config) {

            reset({

                chave_pix: config.chave_pix,

                tipo_chave: config.tipo_chave,

                nome_beneficiario: config.nome_beneficiario,

                cidade: config.cidade,

                exibir_qrcode: config.exibir_qrcode,

            });

        }

    }, [config, reset]);



    const tipoChaveSelecionado = watch('tipo_chave');

    const exibirQrcode = watch('exibir_qrcode');



    const onSubmit = (data: ConfiguracaoPixFormData) => {

        salvarConfig(data);

    };



    if (isLoading) {

        return (

            <div className="flex items-center justify-center py-20 gap-2 text-zinc-400">

                <Loader2 className="w-5 h-5 animate-spin" />

                <span className="text-sm">Carregando configuração...</span>

            </div>

        );

    }



    return (

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">

            <div className="p-8 space-y-6">

                {/* Título da Seção */}

                <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-100">

                    <div className="p-2 bg-emerald-100 rounded-lg">

                        <QrCode className="w-4 h-4 text-emerald-600" />

                    </div>

                    <div>

                        <h2 className="text-sm font-bold text-zinc-900">Configuração PIX</h2>

                        <p className="text-xs text-zinc-500 mt-0.5">

                            Dados do beneficiário usados na geração de QR Code nos carnês

                        </p>

                    </div>

                </div>



                {/* Campos */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Exibir QR Code — movido para o topo para controlar os demais campos */}

                    <div className="space-y-4 md:col-span-2 bg-zinc-50/50 p-4 rounded-xl border border-zinc-100 flex items-center justify-between">

                        <div className="space-y-0.5">

                            <Label htmlFor="exibir_qrcode" className="text-zinc-700 font-bold ml-1 flex items-center gap-2">

                                Exibir QR Code PIX nos Carnês

                            </Label>

                            <p className="text-[12px] text-zinc-500 ml-1">

                                Se desativado, o carnê será gerado sem o QR Code e as instruções de pagamento via PIX.

                            </p>

                        </div>

                        <Controller

                            name="exibir_qrcode"

                            control={control}

                            render={({ field }) => (

                                <Checkbox

                                    id="exibir_qrcode"

                                    checked={field.value}

                                    onCheckedChange={field.onChange}

                                    className="w-5 h-5 rounded-md border-zinc-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 hover:cursor-pointer transition-colors"

                                />

                            )}

                        />

                    </div>



                    {/* Tipo de Chave */}

                    <div className="space-y-2">

                        <Label

                            htmlFor="tipo_chave"

                            className={`font-medium ml-1 ${!exibirQrcode ? 'text-zinc-400' : 'text-zinc-700'}`}

                        >

                            Tipo de Chave PIX

                            {!exibirQrcode && <span className="text-xs ml-1.5 font-normal">(opcional)</span>}

                        </Label>

                        <Select

                            value={tipoChaveSelecionado}

                            disabled={!exibirQrcode}

                            onValueChange={(val) =>

                                setValue('tipo_chave', val as ConfiguracaoPixFormData['tipo_chave'])

                            }

                        >

                            <SelectTrigger

                                id="tipo_chave"

                                className={`h-11 rounded-xl focus:ring-indigo-600 w-full ${

                                    !exibirQrcode ? 'border-zinc-100 bg-zinc-50 text-zinc-400 cursor-not-allowed' : 'border-zinc-200'

                                }`}

                            >

                                <SelectValue placeholder="Selecione o tipo de chave" />

                            </SelectTrigger>

                            <SelectContent>

                                {TIPOS_CHAVE.map((tipo) => (

                                    <SelectItem key={tipo.value} value={tipo.value}>

                                        {tipo.label}

                                    </SelectItem>

                                ))}

                            </SelectContent>

                        </Select>

                    </div>



                    {/* Chave PIX */}

                    <div className="space-y-2">

                        <Label

                            htmlFor="chave_pix"

                            className={`font-medium ml-1 ${

                                errors.chave_pix ? 'text-rose-500' : !exibirQrcode ? 'text-zinc-400' : 'text-zinc-700'

                            }`}

                        >

                            Chave PIX

                            {!exibirQrcode && <span className="text-xs ml-1.5 font-normal">(opcional)</span>}

                        </Label>

                        <Input

                            id="chave_pix"

                            placeholder="Digite a chave PIX"

                            disabled={!exibirQrcode}

                            className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${

                                errors.chave_pix

                                    ? 'border-rose-500 focus-visible:ring-rose-500'

                                    : !exibirQrcode

                                    ? 'border-zinc-100 bg-zinc-50 text-zinc-400 cursor-not-allowed'

                                    : 'border-zinc-200'

                            }`}

                            {...register('chave_pix', {

                                required: exibirQrcode ? 'A chave PIX é obrigatória' : false,

                            })}

                        />

                        {errors.chave_pix && (

                            <p className="text-[11px] text-rose-500 ml-1">{errors.chave_pix.message}</p>

                        )}

                    </div>



                    {/* Nome do Beneficiário */}

                    <div className="space-y-2">

                        <Label

                            htmlFor="nome_beneficiario"

                            className={`font-medium ml-1 ${

                                errors.nome_beneficiario ? 'text-rose-500' : !exibirQrcode ? 'text-zinc-400' : 'text-zinc-700'

                            }`}

                        >

                            Nome do Beneficiário

                            <span className="text-xs ml-1.5 font-normal">

                                {!exibirQrcode ? '(opcional)' : '(máx. 25 caracteres)'}

                            </span>

                        </Label>

                        <Input

                            id="nome_beneficiario"

                            placeholder="Ex: Escola de Dança"

                            maxLength={25}

                            disabled={!exibirQrcode}

                            className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${

                                errors.nome_beneficiario

                                    ? 'border-rose-500 focus-visible:ring-rose-500'

                                    : !exibirQrcode

                                    ? 'border-zinc-100 bg-zinc-50 text-zinc-400 cursor-not-allowed'

                                    : 'border-zinc-200'

                            }`}

                            {...register('nome_beneficiario', {

                                required: exibirQrcode ? 'O nome do beneficiário é obrigatório' : false,

                                maxLength: { value: 25, message: 'Máximo 25 caracteres' },

                            })}

                        />

                        {errors.nome_beneficiario && (

                            <p className="text-[11px] text-rose-500 ml-1">{errors.nome_beneficiario.message}</p>

                        )}

                    </div>



                    {/* Cidade */}

                    <div className="space-y-2">

                        <Label

                            htmlFor="cidade"

                            className={`font-medium ml-1 ${

                                errors.cidade ? 'text-rose-500' : !exibirQrcode ? 'text-zinc-400' : 'text-zinc-700'

                            }`}

                        >

                            Cidade

                            <span className="text-xs ml-1.5 font-normal">

                                {!exibirQrcode ? '(opcional)' : '(máx. 15 caracteres)'}

                            </span>

                        </Label>

                        <Input

                            id="cidade"

                            placeholder="Ex: Sao Paulo"

                            maxLength={15}

                            disabled={!exibirQrcode}

                            className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${

                                errors.cidade

                                    ? 'border-rose-500 focus-visible:ring-rose-500'

                                    : !exibirQrcode

                                    ? 'border-zinc-100 bg-zinc-50 text-zinc-400 cursor-not-allowed'

                                    : 'border-zinc-200'

                            }`}

                            {...register('cidade', {

                                required: exibirQrcode ? 'A cidade é obrigatória' : false,

                                maxLength: { value: 15, message: 'Máximo 15 caracteres' },

                            })}

                        />

                        {errors.cidade && (

                            <p className="text-[11px] text-rose-500 ml-1">{errors.cidade.message}</p>

                        )}

                    </div>

                </div>



                {/* Aviso */}

                <p className="text-xs text-zinc-400 bg-zinc-50 rounded-xl p-3 border border-zinc-100">

                    âš ï¸ Os limites de caracteres do <strong>Nome</strong> e <strong>Cidade</strong> são definidos pelo padrão do Banco Central para geração de QR Code PIX Estático.

                </p>

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

                            Salvar Configuração PIX

                        </>

                    )}

                </Button>

            </div>

        </form>

    );

};
