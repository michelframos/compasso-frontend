import React from 'react'
import { format } from 'date-fns'
import { CustomModalGlobal } from '@/shared/components/CustomModalGlobal'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { AVALIACAO_TIPOS, CONCEITOS } from '../../constants'
import type { AvaliacaoAluno, AvaliacaoPayload, ConceitoAvaliacao, TipoAvaliacao } from '../../types'
import { type AvaliacaoFormContexto, useAvaliacaoForm } from './useAvaliacaoForm'

export interface OpcaoAvaliacao {
  id: number | null
  label: string
}

interface AvaliacaoFormDialogProps {
  aberto: boolean
  avaliacao: AvaliacaoAluno | null
  contexto: AvaliacaoFormContexto
  /** Alunos para escolher (avaliação lançada a partir da turma). */
  alunos?: OpcaoAvaliacao[]
  /** Turmas para escolher (avaliação lançada a partir da ficha); `id` nulo = sem turma. */
  turmas?: OpcaoAvaliacao[]
  isSaving: boolean
  onFechar: () => void
  onSalvar: (payload: AvaliacaoPayload) => void
}

const chip = (ativo: boolean) =>
  `px-3 h-9 rounded-full border text-xs font-bold transition-all hover:cursor-pointer disabled:cursor-default ${
    ativo ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
  }`

const ROTULO = 'text-zinc-700 font-medium ml-1'
const ERRO = 'text-[11px] text-rose-500 ml-1'

export const AvaliacaoFormDialog: React.FC<AvaliacaoFormDialogProps> = ({
  aberto,
  avaliacao,
  contexto,
  alunos = [],
  turmas = [],
  isSaving,
  onFechar,
  onSalvar,
}) => {
  const { form, enviar, tipo, conceito, idAlunoSelecionado, idTurmaSelecionada } = useAvaliacaoForm(
    avaliacao,
    contexto,
    aberto,
    onSalvar
  )
  const { register, setValue, formState: { errors } } = form
  const criando = avaliacao === null

  return (
    <CustomModalGlobal
      open={aberto}
      close={(open: boolean) => !open && onFechar()}
      onClose={onFechar}
      onConfirm={enviar}
      isLoading={isSaving}
      firsChunkTitle={criando ? 'Nova' : 'Editar'}
      secondChunkTitle="avaliação"
      colorSecondChunkTitle="text-indigo-600"
      titleDescription="Registre a nota, o conceito ou ambos."
      textConfirmButton={criando ? 'Registrar' : 'Salvar'}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          enviar()
        }}
        className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-5"
      >
        {criando && alunos.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="aluno-avaliacao" className={ROTULO}>Aluno *</Label>
            <select
              id="aluno-avaliacao"
              value={idAlunoSelecionado ?? ''}
              disabled={isSaving}
              onChange={(e) => setValue('id_aluno', e.target.value ? Number(e.target.value) : null, { shouldValidate: true })}
              className={`flex h-11 w-full rounded-xl border bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${errors.id_aluno ? 'border-rose-500' : 'border-zinc-200'}`}
            >
              <option value="">Selecione o aluno</option>
              {alunos.map((aluno) => (
                <option key={aluno.id} value={aluno.id ?? ''}>{aluno.label}</option>
              ))}
            </select>
            {errors.id_aluno && <p className={ERRO}>{errors.id_aluno.message}</p>}
          </div>
        )}

        {criando && turmas.length > 1 && (
          <div className="space-y-2">
            <Label className={ROTULO}>Turma</Label>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Turma da avaliação">
              {turmas.map((turma) => (
                <button
                  key={turma.id ?? 'sem-turma'}
                  type="button"
                  role="radio"
                  aria-checked={idTurmaSelecionada === turma.id}
                  disabled={isSaving}
                  onClick={() => setValue('id_turma', turma.id)}
                  className={chip(idTurmaSelecionada === turma.id)}
                >
                  {turma.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="data-avaliacao" className={ROTULO}>Data *</Label>
            <Input
              id="data-avaliacao"
              type="date"
              max={format(new Date(), 'yyyy-MM-dd')}
              disabled={isSaving}
              className={`h-11 rounded-xl ${errors.data ? 'border-rose-500' : 'border-zinc-200'}`}
              {...register('data')}
            />
            {errors.data && <p className={ERRO}>{errors.data.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="nota-avaliacao" className={ROTULO}>Nota (0 a 10)</Label>
            <Input
              id="nota-avaliacao"
              inputMode="decimal"
              placeholder="Ex: 8,5"
              disabled={isSaving}
              className={`h-11 rounded-xl ${errors.nota ? 'border-rose-500' : 'border-zinc-200'}`}
              {...register('nota')}
            />
            {errors.nota && <p className={ERRO}>{errors.nota.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label className={ROTULO}>Tipo *</Label>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tipo da avaliação">
            {(Object.entries(AVALIACAO_TIPOS) as [TipoAvaliacao, string][]).map(([valor, label]) => (
              <button
                key={valor}
                type="button"
                role="radio"
                aria-checked={tipo === valor}
                disabled={isSaving}
                onClick={() => setValue('tipo', valor)}
                className={chip(tipo === valor)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className={ROTULO}>Conceito</Label>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Conceito">
            <button
              type="button"
              role="radio"
              aria-checked={conceito === null}
              disabled={isSaving}
              onClick={() => setValue('conceito', null, { shouldValidate: form.formState.isSubmitted })}
              className={chip(conceito === null)}
            >
              Nenhum
            </button>
            {(Object.entries(CONCEITOS) as [ConceitoAvaliacao, { label: string }][]).map(([valor, { label }]) => (
              <button
                key={valor}
                type="button"
                role="radio"
                aria-checked={conceito === valor}
                disabled={isSaving}
                onClick={() => setValue('conceito', valor, { shouldValidate: form.formState.isSubmitted })}
                className={chip(conceito === valor)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="comentario-avaliacao" className={ROTULO}>Comentário</Label>
          <Textarea
            id="comentario-avaliacao"
            rows={4}
            maxLength={2000}
            placeholder="Ex: Boa leitura rítmica; reforçar a dinâmica nos trechos lentos."
            disabled={isSaving}
            className={`rounded-xl focus-visible:ring-indigo-600 resize-none ${errors.comentario ? 'border-rose-500' : 'border-zinc-200'}`}
            {...register('comentario')}
          />
          {errors.comentario && <p className={ERRO}>{errors.comentario.message}</p>}
        </div>

        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </CustomModalGlobal>
  )
}
