import React from 'react'
import { format } from 'date-fns'
import { CustomModalGlobal } from '@/shared/components/CustomModalGlobal'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import type { EnsaioAgendado, EnsaioPayload } from '../../types'
import { useEnsaioForm } from './useEnsaioForm'

interface EnsaioFormDialogProps {
  aberto: boolean
  ensaio: EnsaioAgendado | null
  /** Data do espetáculo (`Y-m-d`), último dia possível para o ensaio. */
  dataLimite: string | null
  isSaving: boolean
  onFechar: () => void
  onSalvar: (payload: EnsaioPayload) => void
}

const ROTULO = 'text-zinc-700 font-medium ml-1'
const ERRO = 'text-[11px] text-rose-500 ml-1'
const campo = (comErro: boolean) => `h-11 rounded-xl ${comErro ? 'border-rose-500' : 'border-zinc-200'}`

export const EnsaioFormDialog: React.FC<EnsaioFormDialogProps> = ({ aberto, ensaio, dataLimite, isSaving, onFechar, onSalvar }) => {
  const { form, enviar } = useEnsaioForm(ensaio, dataLimite, aberto, onSalvar)
  const { register, formState: { errors } } = form
  const criando = ensaio === null

  return (
    <CustomModalGlobal
      open={aberto}
      close={(open: boolean) => !open && onFechar()}
      onClose={onFechar}
      onConfirm={enviar}
      isLoading={isSaving}
      firsChunkTitle={criando ? 'Agendar' : 'Editar'}
      secondChunkTitle="ensaio"
      colorSecondChunkTitle="text-indigo-600"
      titleDescription="Defina quando e onde a apresentação será ensaiada."
      textConfirmButton={criando ? 'Agendar' : 'Salvar'}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          enviar()
        }}
        className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-5"
      >
        <div className="space-y-2">
          <Label htmlFor="data-ensaio" className={ROTULO}>Data *</Label>
          <Input
            id="data-ensaio"
            type="date"
            min={criando ? format(new Date(), 'yyyy-MM-dd') : undefined}
            max={dataLimite ?? undefined}
            disabled={isSaving}
            className={campo(!!errors.data)}
            {...register('data')}
          />
          {errors.data && <p className={ERRO}>{errors.data.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="inicio-ensaio" className={ROTULO}>Início *</Label>
            <Input id="inicio-ensaio" type="time" disabled={isSaving} className={campo(!!errors.hora_inicio)} {...register('hora_inicio')} />
            {errors.hora_inicio && <p className={ERRO}>{errors.hora_inicio.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="termino-ensaio" className={ROTULO}>Término *</Label>
            <Input id="termino-ensaio" type="time" disabled={isSaving} className={campo(!!errors.hora_termino)} {...register('hora_termino')} />
            {errors.hora_termino && <p className={ERRO}>{errors.hora_termino.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="local-ensaio" className={ROTULO}>Local</Label>
          <Input
            id="local-ensaio"
            placeholder="Ex: Sala 2 ou palco do teatro"
            maxLength={255}
            disabled={isSaving}
            className={campo(!!errors.local)}
            {...register('local')}
          />
          {errors.local && <p className={ERRO}>{errors.local.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacoes-ensaio" className={ROTULO}>Observações</Label>
          <Textarea
            id="observacoes-ensaio"
            rows={3}
            maxLength={2000}
            placeholder="Ex: Trazer figurino completo; passagem de som às 14h."
            disabled={isSaving}
            className={`rounded-xl focus-visible:ring-indigo-600 resize-none ${errors.observacoes ? 'border-rose-500' : 'border-zinc-200'}`}
            {...register('observacoes')}
          />
          {errors.observacoes && <p className={ERRO}>{errors.observacoes.message}</p>}
        </div>

        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </CustomModalGlobal>
  )
}
