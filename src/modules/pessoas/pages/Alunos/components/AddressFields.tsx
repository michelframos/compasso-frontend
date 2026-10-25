import React, { useEffect, useState, useCallback } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/shared/lib/axios';
import { formatCep, getErrorMessage } from '@/shared/lib/utils';
import type { EnderecoCep } from '@/modules/core/api/localidades';
import { useBuscaCep } from '@/modules/core/hooks/useBuscaCep';
import type { AlunoFormValues } from '../hooks/useAlunoForm';

interface AddressFieldsProps {
  form: UseFormReturn<AlunoFormValues>;
  prefix?: '' | 'responsavel_';
}

interface Estado {
  id: number;
  nome: string;
  sigla: string;
}

interface Cidade {
  id: number;
  nome: string;
  id_estado: number;
}

export const AddressFields: React.FC<AddressFieldsProps> = ({ form, prefix = '' }) => {
  const { register, watch, setValue, getValues, setFocus, control, formState: { errors } } = form;
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);

  const idEstadoAtual = watch((prefix + 'id_estado') as any);

  useEffect(() => {
    api.get('/estados').then(res => setEstados(res.data)).catch((err) => toast.error(getErrorMessage(err, 'Erro ao carregar estados')));
  }, []);

  useEffect(() => {
    if (idEstadoAtual) {
      api.get(`/estados/${idEstadoAtual}/cidades`)
        .then(res => {
          const cidadesLocal = res.data as Cidade[];
          setCidades(cidadesLocal);
          
          const currentCidade = getValues((prefix + 'id_cidade') as any);
          if (currentCidade) {
            const cidadeExists = cidadesLocal.some(c => c.id.toString() === currentCidade.toString());
            if (!cidadeExists) {
              setValue((prefix + 'id_cidade') as any, null, { shouldDirty: true });
            }
          }
        })
        .catch((err) => toast.error(getErrorMessage(err, 'Erro ao carregar cidades')));
    } else {
      setCidades([]);
      setValue((prefix + 'id_cidade') as any, null, { shouldDirty: true });
    }
  }, [idEstadoAtual, prefix, getValues, setValue]);

  const preencherEndereco = useCallback((endereco: EnderecoCep) => {
    const opcoes = { shouldValidate: true, shouldDirty: true };
    const campo = (nome: string) => (prefix + nome) as any;

    setValue(campo('cep'), endereco.cep, opcoes);
    if (endereco.logradouro) setValue(campo('rua'), endereco.logradouro, opcoes);
    if (endereco.bairro) setValue(campo('bairro'), endereco.bairro, opcoes);
    if (endereco.complemento && !getValues(campo('complemento'))) {
      setValue(campo('complemento'), endereco.complemento, opcoes);
    }
    if (endereco.id_estado) setValue(campo('id_estado'), endereco.id_estado, opcoes);
    if (endereco.id_cidade) setValue(campo('id_cidade'), endereco.id_cidade, opcoes);

    setFocus(campo('numero'));
  }, [prefix, setValue, getValues, setFocus]);

  const { buscar: buscarCep, isBuscando: isLoadingCep } = useBuscaCep({ onEncontrado: preencherEndereco });

  const getErrorProp = (field: string) => {
    return prefix ? (errors as any)[`${prefix}${field}`] : (errors as any)[field];
  };

  return (
    <div className="space-y-4 w-full mt-4 bg-zinc-50/50 p-6 rounded-2xl border border-zinc-100">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-indigo-500" />
        <h3 className="font-semibold text-zinc-800">Endereço {prefix ? 'do Responsável' : 'do Aluno'}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="space-y-2 md:col-span-3">
          <Label className="text-zinc-700 font-medium ml-1 flex items-center gap-2">
            CEP
            {isLoadingCep && <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />}
          </Label>
          <Input
            {...register((prefix + 'cep') as any, {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const cep = formatCep(e.target.value);
                setValue((prefix + 'cep') as any, cep, { shouldDirty: true });
                buscarCep(cep);
              },
              onBlur: (e: React.FocusEvent<HTMLInputElement>) => buscarCep(e.target.value),
            })}
            inputMode="numeric"
            placeholder="00000-000"
            className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"
            maxLength={9}
          />
          {getErrorProp('cep') && <p className="text-[11px] text-rose-500 ml-1">{getErrorProp('cep').message}</p>}
        </div>
        <div className="space-y-2 md:col-span-9">
          <Label className="text-zinc-700 font-medium ml-1">Rua / Logradouro</Label>
          <Input
            {...register((prefix + 'rua') as any)}
            placeholder="Ex: Av. Paulista"
            className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="space-y-2 md:col-span-3">
          <Label className="text-zinc-700 font-medium ml-1">Número</Label>
          <Input
            {...register((prefix + 'numero') as any)}
            placeholder="Ex: 1000"
            className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"
          />
        </div>
        <div className="space-y-2 md:col-span-3">
          <Label className="text-zinc-700 font-medium ml-1">Complemento</Label>
          <Input
            {...register((prefix + 'complemento') as any)}
            placeholder="Ex: Apto 32"
            className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"
          />
        </div>
        <div className="space-y-2 md:col-span-6">
          <Label className="text-zinc-700 font-medium ml-1">Bairro</Label>
          <Input
            {...register((prefix + 'bairro') as any)}
            placeholder="Ex: Centro"
            className="h-11 rounded-xl border-zinc-200 focus-visible:ring-indigo-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-zinc-700 font-medium ml-1">Estado</Label>
          <Controller
            control={control}
            name={(prefix + 'id_estado') as any}
            render={({ field }) => (
              <select
                {...field}
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                className="flex h-11 w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Selecione...</option>
                {estados.map(est => (
                  <option key={est.id} value={est.id}>{est.nome} ({est.sigla})</option>
                ))}
              </select>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-zinc-700 font-medium ml-1">Cidade</Label>
          <Controller
            control={control}
            name={(prefix + 'id_cidade') as any}
            render={({ field }) => (
              <select
                {...field}
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                className="flex h-11 w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!idEstadoAtual || cidades.length === 0}
              >
                <option value="">Selecione...</option>
                {cidades.map(cid => (
                  <option key={cid.id} value={cid.id}>{cid.nome}</option>
                ))}
              </select>
            )}
          />
        </div>
      </div>
    </div>
  );
};
