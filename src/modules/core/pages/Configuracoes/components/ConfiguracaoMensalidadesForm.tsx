import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2, Save, Wallet } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { useConfiguracaoEmpresa } from '../hooks/useConfiguracaoEmpresa'
import type { InicioParcelasMensalidade, ModoGeracaoMensalidades } from '@/modules/core'

type MensalidadesFormValues = {
  modo_geracao_mensalidades: ModoGeracaoMensalidades
  dia_vencimento_mensalidade: number
  quantidade_parcelas_mensalidade: number
  inicio_parcelas_mensalidade: InicioParcelasMensalidade
}

export const ConfiguracaoMensalidadesForm: React.FC = () => {
  const { config, isLoading, isSaving, salvarConfig } = useConfiguracaoEmpresa()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MensalidadesFormValues>({
    defaultValues: {
      modo_geracao_mensalidades: 'formulario',
      dia_vencimento_mensalidade: 10,
      quantidade_parcelas_mensalidade: 12,
      inicio_parcelas_mensalidade: 'mes_matricula',
    },
  })

  const modo = watch('modo_geracao_mensalidades')
  const inicioParcelas = watch('inicio_parcelas_mensalidade')

  useEffect(() => {
    if (!config) return
    reset({
      modo_geracao_mensalidades: config.modo_geracao_mensalidades ?? 'formulario',
      dia_vencimento_mensalidade: config.dia_vencimento_mensalidade ?? 10,
      quantidade_parcelas_mensalidade: config.quantidade_parcelas_mensalidade ?? 12,
      inicio_parcelas_mensalidade: config.inicio_parcelas_mensalidade ?? 'mes_matricula',
    })
  }, [config, reset])

  const onSubmit = async (data: MensalidadesFormValues) => {
    if (!config) return

    await salvarConfig({
      nome_fantasia: config.nome_fantasia,
      razao_social: config.razao_social,
      cnpj: config.cnpj,
      rua: config.rua,
      numero: config.numero,
      bairro: config.bairro,
      complemento: config.complemento,
      cep: config.cep,
      id_estado: config.id_estado?.toString() ?? null,
      id_cidade: config.id_cidade?.toString() ?? null,
      permitir_aluno_editar_medidas: Boolean(config.permitir_aluno_editar_medidas),
      limite_reposicoes_periodo: config.limite_reposicoes_periodo ?? null,
      prazo_reposicao_dias: config.prazo_reposicao_dias ?? null,
      frequencia_minima: config.frequencia_minima ?? 75,
      modo_geracao_mensalidades: data.modo_geracao_mensalidades,
      dia_vencimento_mensalidade: Number(data.dia_vencimento_mensalidade),
      quantidade_parcelas_mensalidade: Number(data.quantidade_parcelas_mensalidade),
      inicio_parcelas_mensalidade: data.inicio_parcelas_mensalidade,
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-zinc-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Carregando configurações de mensalidades...</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-8 max-w-2xl">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-zinc-900">Geração de mensalidades</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Define o padrão da escola ao matricular alunos em turma. Cada turma pode sobrescrever esses valores.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-zinc-700 font-medium ml-1">Modo de geração</Label>
        <Select
          value={modo}
          onValueChange={(v) => setValue('modo_geracao_mensalidades', v as ModoGeracaoMensalidades, { shouldDirty: true })}
        >
          <SelectTrigger className="h-11 rounded-xl border-zinc-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="formulario">Formulário — secretaria confirma valor e parcelas na matrícula</SelectItem>
            <SelectItem value="automatico">Automático — gera ao salvar com o número fixo de parcelas</SelectItem>
            <SelectItem value="duracao_turma">Duração da turma — gera ao salvar com parcelas pelo período da turma</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-zinc-500 ml-1">
          {modo === 'automatico'
            ? 'Usa o valor da turma e o número de parcelas abaixo, sem pedir confirmação.'
            : modo === 'duracao_turma'
              ? 'Calcula as parcelas do início efetivo (início da turma ou data da matrícula) até a data fim. Sem data fim, usa o número fixo abaixo.'
              : 'Exibe um bloco opcional no formulário de matrícula (turma e curso).'}
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-zinc-700 font-medium ml-1">Início das parcelas</Label>
        <Select
          value={inicioParcelas}
          onValueChange={(v) => setValue('inicio_parcelas_mensalidade', v as InicioParcelasMensalidade, { shouldDirty: true })}
        >
          <SelectTrigger className="h-11 rounded-xl border-zinc-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mes_matricula">Mês da matrícula</SelectItem>
            <SelectItem value="mes_seguinte">Mês seguinte à matrícula</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-zinc-500 ml-1">
          {inicioParcelas === 'mes_seguinte'
            ? 'A primeira parcela começa no primeiro dia do mês seguinte à data da matrícula.'
            : 'A primeira parcela começa na data da matrícula (comportamento atual).'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="dia_vencimento_mensalidade" className="text-zinc-700 font-medium ml-1">
            Dia de vencimento padrão
          </Label>
          <Input
            id="dia_vencimento_mensalidade"
            type="number"
            min={1}
            max={31}
            className="h-11 rounded-xl"
            {...register('dia_vencimento_mensalidade', { valueAsNumber: true, min: 1, max: 31, required: true })}
          />
          {errors.dia_vencimento_mensalidade && (
            <p className="text-[11px] text-rose-500 ml-1">Informe um dia entre 1 e 31.</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantidade_parcelas_mensalidade" className="text-zinc-700 font-medium ml-1">
            Parcelas padrão
          </Label>
          <Input
            id="quantidade_parcelas_mensalidade"
            type="number"
            min={1}
            max={24}
            className="h-11 rounded-xl"
            {...register('quantidade_parcelas_mensalidade', { valueAsNumber: true, min: 1, max: 24, required: true })}
          />
          {errors.quantidade_parcelas_mensalidade && (
            <p className="text-[11px] text-rose-500 ml-1">Informe entre 1 e 24 parcelas.</p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSaving} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar
        </Button>
      </div>
    </form>
  )
}
