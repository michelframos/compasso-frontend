import React from 'react'
import { FileUp, Link2, Paperclip } from 'lucide-react'
import { CustomModalGlobal } from '@/shared/components/CustomModalGlobal'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Switch } from '@/shared/components/ui/switch'
import { Textarea } from '@/shared/components/ui/textarea'
import type { MaterialDaTurma, MaterialPayload, TipoMaterial } from '../../../types'
import { EXTENSOES_ACEITAS, useMaterialForm } from '../hooks/useMaterialForm'

interface MaterialFormDialogProps {
  aberto: boolean
  material: MaterialDaTurma | null
  isSaving: boolean
  onFechar: () => void
  onSalvar: (payload: MaterialPayload) => void
}

const TIPOS: { valor: TipoMaterial; label: string; icon: typeof FileUp }[] = [
  { valor: 'arquivo', label: 'Arquivo', icon: FileUp },
  { valor: 'link', label: 'Link', icon: Link2 },
]

const tamanho = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`

export const MaterialFormDialog: React.FC<MaterialFormDialogProps> = ({ aberto, material, isSaving, onFechar, onSalvar }) => {
  const { form, enviar, tipo, arquivo, publico, arquivoAtual } = useMaterialForm(material, aberto, onSalvar)
  const { register, setValue, formState: { errors } } = form

  return (
    <CustomModalGlobal
      open={aberto}
      close={(open: boolean) => !open && onFechar()}
      onClose={onFechar}
      onConfirm={enviar}
      isLoading={isSaving}
      firsChunkTitle={material ? 'Editar' : 'Novo'}
      secondChunkTitle="material"
      colorSecondChunkTitle="text-indigo-600"
      titleDescription="Compartilhe apostilas, partituras, áudios ou links com a turma."
      textConfirmButton={material ? 'Salvar' : 'Publicar'}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          enviar()
        }}
        className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-5"
      >
        <div className="space-y-2">
          <Label htmlFor="titulo" className="text-zinc-700 font-medium ml-1">Título *</Label>
          <Input
            id="titulo"
            placeholder="Ex: Apostila de acordes"
            disabled={isSaving}
            className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.titulo ? 'border-rose-500' : 'border-zinc-200'}`}
            {...register('titulo')}
          />
          {errors.titulo && <p className="text-[11px] text-rose-500 ml-1">{errors.titulo.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao" className="text-zinc-700 font-medium ml-1">Descrição</Label>
          <Textarea
            id="descricao"
            rows={3}
            placeholder="Orientações para os alunos (opcional)"
            disabled={isSaving}
            className="rounded-xl border-zinc-200 focus-visible:ring-indigo-600 resize-none"
            {...register('descricao')}
          />
          {errors.descricao && <p className="text-[11px] text-rose-500 ml-1">{errors.descricao.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-700 font-medium ml-1">Conteúdo *</Label>
          <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-zinc-100">
            {TIPOS.map(({ valor, label, icon: Icon }) => (
              <button
                key={valor}
                type="button"
                disabled={isSaving}
                onClick={() => setValue('tipo', valor, { shouldValidate: false })}
                className={`flex items-center justify-center gap-1.5 h-9 rounded-xl text-sm font-bold transition-all hover:cursor-pointer ${tipo === valor ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {tipo === 'arquivo' ? (
            <div className="space-y-1.5">
              <label
                htmlFor="arquivo"
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed transition-colors hover:cursor-pointer ${errors.arquivo ? 'border-rose-300 bg-rose-50/40' : 'border-zinc-200 hover:border-indigo-300 hover:bg-indigo-50/30'
                  }`}
              >
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                  <Paperclip className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  {arquivo ? (
                    <>
                      <p className="text-sm font-bold text-zinc-900 truncate">{arquivo.name}</p>
                      <p className="text-xs text-zinc-500">{tamanho(arquivo.size)} · toque para trocar</p>
                    </>
                  ) : arquivoAtual ? (
                    <>
                      <p className="text-sm font-bold text-zinc-900 truncate">Manter arquivo atual</p>
                      <p className="text-xs text-zinc-500">Toque para enviar um novo arquivo</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-zinc-900">Selecionar arquivo</p>
                      <p className="text-xs text-zinc-500">PDF, documentos, imagens, áudio ou vídeo · até 10MB</p>
                    </>
                  )}
                </div>
              </label>
              <input
                id="arquivo"
                type="file"
                accept={EXTENSOES_ACEITAS}
                className="sr-only"
                disabled={isSaving}
                onChange={(e) => {
                  setValue('arquivo', e.target.files?.[0] ?? null, { shouldValidate: true })
                  e.target.value = ''
                }}
              />
              {errors.arquivo && <p className="text-[11px] text-rose-500 ml-1">{errors.arquivo.message}</p>}
            </div>
          ) : (
            <div className="space-y-1.5">
              <Input
                id="link"
                type="url"
                inputMode="url"
                placeholder="https://..."
                disabled={isSaving}
                className={`h-11 rounded-xl focus-visible:ring-indigo-600 ${errors.link ? 'border-rose-500' : 'border-zinc-200'}`}
                {...register('link')}
              />
              {errors.link && <p className="text-[11px] text-rose-500 ml-1">{errors.link.message}</p>}
            </div>
          )}
        </div>

        <label className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:cursor-pointer">
          <div>
            <p className="text-sm font-bold text-zinc-900">Visível para os alunos</p>
            <p className="text-xs text-zinc-500">Desative para deixar o material só para você.</p>
          </div>
          <Switch
            checked={publico}
            disabled={isSaving}
            onCheckedChange={(valor) => setValue('publico', valor)}
            className="data-[state=checked]:bg-indigo-600"
          />
        </label>

        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </CustomModalGlobal>
  )
}
