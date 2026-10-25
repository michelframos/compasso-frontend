import React, { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'
import { CustomModalGlobal } from '@/shared/components/CustomModalGlobal'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import type { FichaAluno, NivelOpcao } from '../../../types'
import type { SugestaoPayload } from '../hooks/useProgressoes'
import { rotuloMatricula } from './rotuloMatricula'

type Matricula = FichaAluno['matriculas'][number]

const schema = z.object({
  id_matricula: z.number({ message: 'Escolha a matrícula' }).nullable().refine((v) => v !== null, 'Escolha a matrícula'),
  id_nivel_sugerido: z.number().nullable().refine((v) => v !== null, 'Escolha o nível sugerido'),
  justificativa: z.string().trim().min(1, 'Explique por que o aluno deve mudar de nível').max(2000, 'Máximo de 2000 caracteres'),
})

type Valores = z.input<typeof schema>

interface SugestaoProgressaoDialogProps {
  aberto: boolean
  matriculas: Matricula[]
  niveis: NivelOpcao[] | null
  isSaving: boolean
  onFechar: () => void
  onSalvar: (payload: SugestaoPayload) => void
}

const SELECT =
  'flex h-11 w-full rounded-xl border bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:opacity-50'

export const SugestaoProgressaoDialog: React.FC<SugestaoProgressaoDialogProps> = ({
  aberto,
  matriculas,
  niveis,
  isSaving,
  onFechar,
  onSalvar,
}) => {
  const matriculaPadrao = matriculas.length === 1 ? matriculas[0].id : null
  const form = useForm<Valores, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { id_matricula: matriculaPadrao, id_nivel_sugerido: null, justificativa: '' },
  })
  const { register, setValue, formState: { errors } } = form

  useEffect(() => {
    if (aberto) form.reset({ id_matricula: matriculaPadrao, id_nivel_sugerido: null, justificativa: '' })
  }, [aberto, matriculaPadrao, form])

  const idMatricula = useWatch({ control: form.control, name: 'id_matricula' })
  const idNivel = useWatch({ control: form.control, name: 'id_nivel_sugerido' })
  const matricula = matriculas.find((m) => m.id === idMatricula) ?? null

  const niveisPossiveis = useMemo(
    () =>
      matricula && niveis
        ? niveis.filter((n) => n.id !== matricula.id_nivel && (n.curso_id === null || n.curso_id === matricula.id_curso))
        : [],
    [matricula, niveis]
  )

  const enviar = form.handleSubmit((valores) =>
    onSalvar({
      id_matricula: valores.id_matricula,
      id_nivel_sugerido: valores.id_nivel_sugerido,
      justificativa: valores.justificativa.trim(),
    })
  )

  return (
    <CustomModalGlobal
      open={aberto}
      close={(open: boolean) => !open && onFechar()}
      onClose={onFechar}
      onConfirm={enviar}
      isLoading={isSaving}
      firsChunkTitle="Sugerir"
      secondChunkTitle="progressão"
      colorSecondChunkTitle="text-indigo-600"
      titleDescription="A secretaria analisa a sugestão e, se aprovar, muda o aluno de nível."
      textConfirmButton="Enviar sugestão"
    >
      {niveis === null ? (
        <div className="flex items-center justify-center py-16 gap-2 text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Carregando níveis...</span>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            enviar()
          }}
          className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-5"
        >
          {matriculas.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="matricula-progressao" className="text-zinc-700 font-medium ml-1">Matrícula *</Label>
              <select
                id="matricula-progressao"
                value={idMatricula ?? ''}
                disabled={isSaving}
                onChange={(e) => {
                  setValue('id_matricula', e.target.value ? Number(e.target.value) : null, { shouldValidate: true })
                  setValue('id_nivel_sugerido', null)
                }}
                className={`${SELECT} ${errors.id_matricula ? 'border-rose-500' : 'border-zinc-200'}`}
              >
                <option value="">Selecione</option>
                {matriculas.map((m) => (
                  <option key={m.id} value={m.id}>{rotuloMatricula(m)}</option>
                ))}
              </select>
              {errors.id_matricula && <p className="text-[11px] text-rose-500 ml-1">{errors.id_matricula.message}</p>}
            </div>
          )}

          {matricula && (
            <p className="text-xs text-zinc-500 ml-1">
              Nível atual: <span className="font-semibold text-zinc-700">{matricula.nivel?.nome ?? '—'}</span>
              {matriculas.length === 1 && <> · {rotuloMatricula(matricula)}</>}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="nivel-progressao" className="text-zinc-700 font-medium ml-1">Nível sugerido *</Label>
            <select
              id="nivel-progressao"
              value={idNivel ?? ''}
              disabled={isSaving || !matricula}
              onChange={(e) => setValue('id_nivel_sugerido', e.target.value ? Number(e.target.value) : null, { shouldValidate: true })}
              className={`${SELECT} ${errors.id_nivel_sugerido ? 'border-rose-500' : 'border-zinc-200'}`}
            >
              <option value="">{matricula ? 'Selecione o nível' : 'Escolha a matrícula primeiro'}</option>
              {niveisPossiveis.map((n) => (
                <option key={n.id} value={n.id}>{n.nome}</option>
              ))}
            </select>
            {errors.id_nivel_sugerido && <p className="text-[11px] text-rose-500 ml-1">{errors.id_nivel_sugerido.message}</p>}
            {matricula && niveisPossiveis.length === 0 && (
              <p className="text-[11px] text-zinc-500 ml-1">Não há outros níveis cadastrados para este curso.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="justificativa-progressao" className="text-zinc-700 font-medium ml-1">Justificativa *</Label>
            <Textarea
              id="justificativa-progressao"
              rows={5}
              maxLength={2000}
              placeholder="Ex: Domina as escalas maiores e lê partitura com fluência."
              disabled={isSaving}
              className={`rounded-xl focus-visible:ring-indigo-600 resize-none ${errors.justificativa ? 'border-rose-500' : 'border-zinc-200'}`}
              {...register('justificativa')}
            />
            {errors.justificativa && <p className="text-[11px] text-rose-500 ml-1">{errors.justificativa.message}</p>}
          </div>

          <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
        </form>
      )}
    </CustomModalGlobal>
  )
}
