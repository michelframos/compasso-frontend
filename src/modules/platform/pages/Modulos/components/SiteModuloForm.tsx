import type { UseFormReturn } from 'react-hook-form'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Button } from '@/shared/components/ui/button'
import { Loader2 } from 'lucide-react'
import { SITE_MODULO_ICONES } from '../../../types'
import type { SiteModuloFormValues } from '../hooks/useSiteModuloForm'

interface SiteModuloFormProps {
  form: UseFormReturn<SiteModuloFormValues>
  isSubmitting: boolean
  onSubmit: () => void
  onCancel: () => void
}

export function SiteModuloForm({ form, isSubmitting, onSubmit, onCancel }: SiteModuloFormProps) {
  const { register, formState: { errors } } = form

  return (
    <form onSubmit={onSubmit} className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome *</Label>
          <Input id="nome" {...register('nome')} placeholder="Ex: Financeiro" />
          {errors.nome && <p className="text-xs text-rose-500">{errors.nome.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="icone">Ícone</Label>
          <select
            id="icone"
            {...register('icone')}
            className="flex h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm"
          >
            {SITE_MODULO_ICONES.map((icone) => (
              <option key={icone} value={icone}>
                {icone}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ordem">Ordem</Label>
          <Input id="ordem" type="number" min="0" {...register('ordem')} />
          {errors.ordem && <p className="text-xs text-rose-500">{errors.ordem.message}</p>}
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="descricao">Descrição *</Label>
          <Textarea id="descricao" rows={3} {...register('descricao')} placeholder="Resumo do módulo no site" />
          {errors.descricao && <p className="text-xs text-rose-500">{errors.descricao.message}</p>}
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="recursos_texto">Recursos</Label>
          <Textarea
            id="recursos_texto"
            rows={6}
            {...register('recursos_texto')}
            placeholder={'Um recurso por linha\nEx: PIX\nContratos'}
          />
          <p className="text-xs text-zinc-400">Um item por linha. Aparecem como lista no card do site.</p>
        </div>
      </div>

      <p className="text-xs text-zinc-500">
        Novos módulos ficam pendentes. Use Aprovar na lista para publicar no site.
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
