import React from 'react'
import { CustomModalGlobal } from '@/shared/components/CustomModalGlobal'
import { Label } from '@/shared/components/ui/label'
import { Switch } from '@/shared/components/ui/switch'
import { Textarea } from '@/shared/components/ui/textarea'
import { OBSERVACAO_TIPOS } from '../../../constants'
import { apelidoTurma } from '../../../lib/formatters'
import type { FichaAluno, ObservacaoAluno, ObservacaoPayload, TipoObservacao } from '../../../types'
import { useObservacaoForm } from '../hooks/useObservacaoForm'

type TurmaOpcao = NonNullable<FichaAluno['matriculas'][number]['turma']>

interface ObservacaoFormDialogProps {
  aberto: boolean
  observacao: ObservacaoAluno | null
  turmas: TurmaOpcao[]
  turmaPadrao: number | null
  isSaving: boolean
  onFechar: () => void
  onSalvar: (payload: ObservacaoPayload) => void
}

const chip = (ativo: boolean) =>
  `px-3 h-9 rounded-full border text-xs font-bold transition-all hover:cursor-pointer disabled:cursor-default ${
    ativo ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
  }`

export const ObservacaoFormDialog: React.FC<ObservacaoFormDialogProps> = ({
  aberto,
  observacao,
  turmas,
  turmaPadrao,
  isSaving,
  onFechar,
  onSalvar,
}) => {
  const { form, enviar, tipo, visivelResponsavel, idTurma } = useObservacaoForm(observacao, turmaPadrao, aberto, onSalvar)
  const { register, setValue, formState: { errors } } = form

  return (
    <CustomModalGlobal
      open={aberto}
      close={(open: boolean) => !open && onFechar()}
      onClose={onFechar}
      onConfirm={enviar}
      isLoading={isSaving}
      firsChunkTitle={observacao ? 'Editar' : 'Nova'}
      secondChunkTitle="observação"
      colorSecondChunkTitle="text-indigo-600"
      titleDescription="Registre a evolução, o comportamento ou alertas sobre o aluno."
      textConfirmButton={observacao ? 'Salvar' : 'Registrar'}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          enviar()
        }}
        className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-5"
      >
        <div className="space-y-2">
          <Label className="text-zinc-700 font-medium ml-1">Tipo *</Label>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tipo da observação">
            {(Object.entries(OBSERVACAO_TIPOS) as [TipoObservacao, { label: string }][]).map(([valor, { label }]) => (
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

        {observacao ? (
          observacao.turma && (
            <p className="text-xs text-zinc-500 ml-1">
              Turma: <span className="font-semibold text-zinc-700">{apelidoTurma(observacao.turma)}</span>
            </p>
          )
        ) : (
          turmas.length > 0 && (
            <div className="space-y-2">
              <Label className="text-zinc-700 font-medium ml-1">Turma</Label>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Turma da observação">
                <button
                  type="button"
                  role="radio"
                  aria-checked={idTurma === null}
                  disabled={isSaving}
                  onClick={() => setValue('id_turma', null)}
                  className={chip(idTurma === null)}
                >
                  Nenhuma
                </button>
                {turmas.map((turma) => (
                  <button
                    key={turma.id}
                    type="button"
                    role="radio"
                    aria-checked={idTurma === turma.id}
                    disabled={isSaving}
                    onClick={() => setValue('id_turma', turma.id)}
                    className={chip(idTurma === turma.id)}
                  >
                    {apelidoTurma(turma)}
                  </button>
                ))}
              </div>
            </div>
          )
        )}

        <div className="space-y-2">
          <Label htmlFor="texto-observacao" className="text-zinc-700 font-medium ml-1">Observação *</Label>
          <Textarea
            id="texto-observacao"
            rows={5}
            maxLength={5000}
            placeholder="Ex: Evoluiu bem na leitura de partitura, mas precisa reforçar o ritmo."
            disabled={isSaving}
            className={`rounded-xl focus-visible:ring-indigo-600 resize-none ${errors.texto ? 'border-rose-500' : 'border-zinc-200'}`}
            {...register('texto')}
          />
          {errors.texto && <p className="text-[11px] text-rose-500 ml-1">{errors.texto.message}</p>}
        </div>

        <label className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:cursor-pointer">
          <div>
            <p className="text-sm font-bold text-zinc-900">Visível para o responsável</p>
            <p className="text-xs text-zinc-500">
              {visivelResponsavel
                ? 'O responsável poderá ver esta observação.'
                : 'Apenas a equipe pedagógica vê esta observação.'}
            </p>
          </div>
          <Switch
            checked={visivelResponsavel}
            disabled={isSaving}
            onCheckedChange={(valor) => setValue('visivel_responsavel', valor)}
            className="data-[state=checked]:bg-indigo-600"
          />
        </label>

        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </CustomModalGlobal>
  )
}
