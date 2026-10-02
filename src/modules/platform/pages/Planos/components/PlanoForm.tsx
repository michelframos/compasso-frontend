import type { UseFormReturn } from 'react-hook-form'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Switch } from '@/shared/components/ui/switch'
import { Button } from '@/shared/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { ModuloAppCatalogItem } from '../../../types'
import type { PlanoFormValues } from '../hooks/usePlanoForm'

interface PlanoFormProps {
  form: UseFormReturn<PlanoFormValues>
  isSubmitting: boolean
  onSubmit: () => void
  onCancel: () => void
  modulosCatalog: ModuloAppCatalogItem[]
}

export function PlanoForm({ form, isSubmitting, onSubmit, onCancel, modulosCatalog }: PlanoFormProps) {
  const { register, watch, setValue, formState: { errors } } = form
  const ativo = watch('ativo')
  const modulos = watch('modulos') ?? []

  const toggleModulo = (key: string, checked: boolean) => {
    const next = checked
      ? Array.from(new Set([...modulos, key]))
      : modulos.filter((m) => m !== key)
    setValue('modulos', next, { shouldDirty: true })
  }

  return (
    <form onSubmit={onSubmit} className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome *</Label>
          <Input id="nome" {...register('nome')} placeholder="Ex: Profissional" />
          {errors.nome && <p className="text-xs text-rose-500">{errors.nome.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input id="slug" {...register('slug')} placeholder="Ex: profissional" />
          {errors.slug && <p className="text-xs text-rose-500">{errors.slug.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="preco_mensal">Preço mensal (R$) *</Label>
          <Input id="preco_mensal" type="number" step="0.01" min="0" {...register('preco_mensal')} />
          {errors.preco_mensal && <p className="text-xs text-rose-500">{errors.preco_mensal.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="limite_alunos">Limite de alunos</Label>
          <Input id="limite_alunos" type="number" min="1" {...register('limite_alunos')} placeholder="Opcional — vazio = ilimitado" />
          {errors.limite_alunos && <p className="text-xs text-rose-500">{errors.limite_alunos.message}</p>}
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea id="descricao" rows={3} {...register('descricao')} placeholder="Descrição comercial do plano" />
        </div>

        <div className="md:col-span-2 space-y-3">
          <Label>Módulos incluídos</Label>
          <p className="text-xs text-zinc-500">
            Dashboard, agenda, alunos e acadêmico ficam sempre liberados. Trial libera todos os módulos.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {modulosCatalog.map((item) => {
              const checked = modulos.includes(item.key)
              return (
                <label
                  key={item.key}
                  className="flex items-start gap-3 rounded-lg border border-zinc-200 p-3 cursor-pointer hover:bg-zinc-50"
                >
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={checked}
                    onChange={(e) => toggleModulo(item.key, e.target.checked)}
                  />
                  <span>
                    <span className="block text-sm font-medium text-zinc-900">{item.label}</span>
                    <span className="block text-xs text-zinc-500 mt-0.5">{item.descricao}</span>
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            id="ativo"
            checked={ativo}
            onCheckedChange={(checked) => setValue('ativo', checked, { shouldDirty: true })}
          />
          <Label htmlFor="ativo">Plano ativo para novas escolas</Label>
        </div>
      </div>

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
