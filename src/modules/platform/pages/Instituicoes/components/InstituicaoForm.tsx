import { useCallback, useEffect, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Button } from '@/shared/components/ui/button'
import { Loader2 } from 'lucide-react'
import api from '@/shared/lib/axios'
import { formatCep, formatCnpj } from '@/shared/lib/utils'
import type { EnderecoCep } from '@/modules/core/api/localidades'
import { useBuscaCep } from '@/modules/core/hooks/useBuscaCep'
import type { PlanoAssinatura } from '../../../types'
import type { InstituicaoFormValues } from '../hooks/useInstituicaoForm'

interface Estado {
  id: number
  nome: string
  sigla: string
}

interface Cidade {
  id: number
  nome: string
}

interface InstituicaoFormProps {
  form: UseFormReturn<InstituicaoFormValues>
  isSubmitting: boolean
  onSubmit: () => void
  onCancel: () => void
  defaultTrialDays: number
  planos: PlanoAssinatura[]
  isCreate?: boolean
}

const STATUS_LABELS: Record<string, string> = {
  a: 'Ativo',
  i: 'Inativo',
  s: 'Suspenso',
}

const ASSINATURA_LABELS: Record<string, string> = {
  trialing: 'Em trial',
  active: 'Ativa',
  past_due: 'Em atraso',
  canceled: 'Cancelada',
}

export function InstituicaoForm({
  form,
  isSubmitting,
  onSubmit,
  onCancel,
  defaultTrialDays,
  planos,
  isCreate = false,
}: InstituicaoFormProps) {
  const { register, watch, setValue, getValues, setFocus, formState: { errors } } = form
  const [estados, setEstados] = useState<Estado[]>([])
  const [cidades, setCidades] = useState<Cidade[]>([])
  const trialMode = watch('trial_mode')
  const idEstado = watch('id_estado')
  const idCidade = watch('id_cidade')

  const preencherEndereco = useCallback((endereco: EnderecoCep) => {
    const opcoes = { shouldDirty: true }

    setValue('cep', endereco.cep, opcoes)
    if (endereco.logradouro) setValue('rua', endereco.logradouro, opcoes)
    if (endereco.bairro) setValue('bairro', endereco.bairro, opcoes)
    if (endereco.complemento && !getValues('complemento')) setValue('complemento', endereco.complemento, opcoes)
    if (endereco.id_estado) setValue('id_estado', endereco.id_estado, opcoes)
    if (endereco.id_cidade) setValue('id_cidade', endereco.id_cidade, opcoes)

    setFocus('numero')
  }, [setValue, getValues, setFocus])

  const { buscar: buscarCep, isBuscando: isBuscandoCep } = useBuscaCep({ onEncontrado: preencherEndereco })

  useEffect(() => {
    api.get('/estados').then((res) => setEstados(res.data)).catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!idEstado) {
      setCidades([])
      return
    }
    api.get(`/estados/${idEstado}/cidades`).then((res) => setCidades(res.data)).catch(() => undefined)
  }, [idEstado])

  return (
    <form onSubmit={onSubmit} className="p-6 space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Dados cadastrais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="nome_fantasia">Nome fantasia *</Label>
            <Input id="nome_fantasia" {...register('nome_fantasia')} />
            {errors.nome_fantasia && <p className="text-xs text-rose-500">{errors.nome_fantasia.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input id="slug" {...register('slug')} placeholder="ex: escola-exemplo" />
            {errors.slug && <p className="text-xs text-rose-500">{errors.slug.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="razao_social">Razão social</Label>
            <Input id="razao_social" {...register('razao_social')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ *</Label>
            <Input
              id="cnpj"
              placeholder="00.000.000/0000-00"
              {...register('cnpj', {
                onChange: (e) => setValue('cnpj', formatCnpj(e.target.value)),
              })}
            />
            <p className="text-xs text-zinc-400">Usado pelos usuários da escola para fazer login.</p>
            {errors.cnpj && <p className="text-xs text-rose-500">{errors.cnpj.message}</p>}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Endereço</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label htmlFor="cep" className="flex items-center gap-2">
              CEP
              {isBuscandoCep && <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />}
            </Label>
            <Input
              id="cep"
              placeholder="00000-000"
              inputMode="numeric"
              maxLength={9}
              {...register('cep', {
                onChange: (e) => {
                  const cep = formatCep(e.target.value)
                  setValue('cep', cep)
                  buscarCep(cep)
                },
                onBlur: (e) => buscarCep(e.target.value),
              })}
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="rua">Rua</Label>
            <Input id="rua" {...register('rua')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numero">Número</Label>
            <Input id="numero" {...register('numero')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bairro">Bairro</Label>
            <Input id="bairro" {...register('bairro')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="complemento">Complemento</Label>
            <Input id="complemento" {...register('complemento')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="id_estado">Estado</Label>
            <select
              id="id_estado"
              className="w-full h-10 rounded-md border border-zinc-200 px-3 text-sm"
              value={idEstado ?? ''}
              onChange={(e) => {
                setValue('id_estado', e.target.value ? Number(e.target.value) : null, { shouldDirty: true })
                setValue('id_cidade', null, { shouldDirty: true })
              }}
            >
              <option value="">Selecione</option>
              {estados.map((e) => (
                <option key={e.id} value={e.id}>{e.nome}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="id_cidade">Cidade</Label>
            <select
              id="id_cidade"
              className="w-full h-10 rounded-md border border-zinc-200 px-3 text-sm"
              value={idCidade ?? ''}
              onChange={(e) => setValue('id_cidade', e.target.value ? Number(e.target.value) : null, { shouldDirty: true })}
            >
              <option value="">Selecione</option>
              {cidades.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Assinatura</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label htmlFor="id_plano_assinatura">Plano</Label>
            <select
              id="id_plano_assinatura"
              className="w-full h-10 rounded-md border border-zinc-200 px-3 text-sm"
              {...register('id_plano_assinatura')}
            >
              <option value="">Sem plano</option>
              {planos.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status administrativo</Label>
            <select id="status" className="w-full h-10 rounded-md border border-zinc-200 px-3 text-sm" {...register('status')}>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assinatura_status">Status da assinatura</Label>
            <select id="assinatura_status" className="w-full h-10 rounded-md border border-zinc-200 px-3 text-sm" {...register('assinatura_status')}>
              {Object.entries(ASSINATURA_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assinatura_inicia_em">Assinatura inicia em</Label>
            <Input id="assinatura_inicia_em" type="date" {...register('assinatura_inicia_em')} />
          </div>
        </div>
      </section>

      {isCreate && (
        <section className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-5">
          <div>
            <h2 className="text-sm font-bold text-zinc-700 uppercase tracking-wider">Usuário administrador</h2>
            <p className="text-xs text-zinc-500 mt-1">Credenciais para o primeiro acesso ao painel desta escola.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="admin_nome">Nome *</Label>
              <Input id="admin_nome" {...register('admin_nome')} placeholder="Nome do gestor" />
              {errors.admin_nome && <p className="text-xs text-rose-500">{errors.admin_nome.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_email">E-mail *</Label>
              <Input id="admin_email" type="email" {...register('admin_email')} placeholder="admin@escola.com" />
              {errors.admin_email && <p className="text-xs text-rose-500">{errors.admin_email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_password">Senha *</Label>
              <Input id="admin_password" type="password" {...register('admin_password')} autoComplete="new-password" />
              {errors.admin_password && <p className="text-xs text-rose-500">{errors.admin_password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin_password_confirmation">Confirmar senha *</Label>
              <Input id="admin_password_confirmation" type="password" {...register('admin_password_confirmation')} autoComplete="new-password" />
              {errors.admin_password_confirmation && <p className="text-xs text-rose-500">{errors.admin_password_confirmation.message}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="admin_cpf">CPF (opcional)</Label>
              <Input id="admin_cpf" {...register('admin_cpf')} placeholder="000.000.000-00" />
              {errors.admin_cpf && <p className="text-xs text-rose-500">{errors.admin_cpf.message}</p>}
            </div>
          </div>
        </section>
      )}

      <section className="space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/30 p-5">
        <div>
          <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-wider">Período de gratuidade (trial)</h2>
          <p className="text-xs text-zinc-500 mt-1">Padrão do sistema: {defaultTrialDays} dias</p>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" value="padrao" {...register('trial_mode')} />
            Usar trial padrão ({defaultTrialDays} dias)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" value="dias" {...register('trial_mode')} />
            Definir duração em dias
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" value="data" {...register('trial_mode')} />
            Definir data fim do trial
          </label>
        </div>

        {trialMode === 'dias' && (
          <div className="space-y-2 max-w-xs">
            <Label htmlFor="trial_dias">Dias de trial</Label>
            <Input id="trial_dias" type="number" min="1" max="3650" {...register('trial_dias')} />
            {errors.trial_dias && <p className="text-xs text-rose-500">{errors.trial_dias.message}</p>}
          </div>
        )}

        {trialMode === 'data' && (
          <div className="space-y-2 max-w-xs">
            <Label htmlFor="trial_ends_at">Trial até</Label>
            <Input id="trial_ends_at" type="datetime-local" {...register('trial_ends_at')} />
            {errors.trial_ends_at && <p className="text-xs text-rose-500">{errors.trial_ends_at.message}</p>}
          </div>
        )}
      </section>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-full">
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting} className="rounded-full bg-indigo-600 hover:bg-indigo-700">
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Salvar
        </Button>
      </div>
    </form>
  )
}
