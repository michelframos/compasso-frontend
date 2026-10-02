import type { UseFormReturn } from 'react-hook-form'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Button } from '@/shared/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { DepoimentoFormValues } from '../hooks/useDepoimentoForm'

interface DepoimentoFormProps {
  form: UseFormReturn<DepoimentoFormValues>
  isSubmitting: boolean
  onSubmit: () => void
  onCancel: () => void
}

export function DepoimentoForm({ form, isSubmitting, onSubmit, onCancel }: DepoimentoFormProps) {
  const { register, formState: { errors } } = form

  return (
    <form onSubmit={onSubmit} className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome *</Label>
          <Input id="nome" {...register('nome')} placeholder="Ex: Carla Mendes" />
          {errors.nome && <p className="text-xs text-rose-500">{errors.nome.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cargo">Cargo *</Label>
          <Input id="cargo" {...register('cargo')} placeholder="Ex: Diretora" />
          {errors.cargo && <p className="text-xs text-rose-500">{errors.cargo.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="escola">Escola *</Label>
          <Input id="escola" {...register('escola')} placeholder="Ex: Escola Harmonia" />
          {errors.escola && <p className="text-xs text-rose-500">{errors.escola.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="ordem">Ordem</Label>
          <Input id="ordem" type="number" min="0" {...register('ordem')} />
          {errors.ordem && <p className="text-xs text-rose-500">{errors.ordem.message}</p>}
          <p className="text-xs text-zinc-400">Menor número aparece primeiro no site.</p>
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="conteudo">Depoimento *</Label>
          <Textarea id="conteudo" rows={4} {...register('conteudo')} placeholder="Texto que aparece no site" />
          {errors.conteudo && <p className="text-xs text-rose-500">{errors.conteudo.message}</p>}
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="avatar_url">URL do avatar</Label>
          <Input id="avatar_url" {...register('avatar_url')} placeholder="https://… (opcional)" />
          {errors.avatar_url && <p className="text-xs text-rose-500">{errors.avatar_url.message}</p>}
        </div>
      </div>

      <p className="text-xs text-zinc-500">
        Novos depoimentos ficam pendentes. Use Aprovar na lista para publicar no site.
      </p>

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
