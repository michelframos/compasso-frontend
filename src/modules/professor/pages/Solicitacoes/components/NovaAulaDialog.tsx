import React from 'react'
import { format } from 'date-fns'
import { CustomModalGlobal } from '@/shared/components/CustomModalGlobal'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { AULA_TIPO } from '../../../constants'
import { apelidoTurma } from '../../../lib/formatters'
import type { AulaTipo, ModoPermissaoAula, SolicitacaoAula } from '../../../types'
import { useNovaAulaForm } from '../hooks/useNovaAulaForm'

interface NovaAulaDialogProps {
  aberto: boolean
  modo: ModoPermissaoAula | null
  onFechar: () => void
  onConcluido: (solicitacao: SolicitacaoAula) => void
}

const ROTULO = 'text-zinc-700 font-medium ml-1'
const ERRO = 'text-[11px] text-rose-500 ml-1'
const campo = (comErro: boolean) => `h-11 rounded-xl ${comErro ? 'border-rose-500' : 'border-zinc-200'}`

export const NovaAulaDialog: React.FC<NovaAulaDialogProps> = ({ aberto, modo, onFechar, onConcluido }) => {
  const { form, turmas, alunos, cursosDoAluno, isSaving, enviar } = useNovaAulaForm(aberto, (solicitacao) => {
    onConcluido(solicitacao)
    onFechar()
  })
  const { register, setValue, watch, formState: { errors } } = form
  const alvo = watch('alvo')
  const selecionar = (campoNome: 'id_turma' | 'id_aluno' | 'id_curso' | 'tipo_aula', valor: string) =>
    setValue(campoNome, valor as never, { shouldValidate: true })

  return (
    <CustomModalGlobal
      open={aberto}
      close={(open: boolean) => !open && !isSaving && onFechar()}
      onClose={onFechar}
      onConfirm={enviar}
      isLoading={isSaving}
      firsChunkTitle="Nova"
      secondChunkTitle="aula"
      colorSecondChunkTitle="text-indigo-600"
      titleDescription={
        modo === 'livre' ? 'A aula entra na agenda assim que você confirmar.' : 'O pedido vai para a aprovação da secretaria.'
      }
      textConfirmButton={modo === 'livre' ? 'Agendar' : 'Enviar pedido'}
      loadingText="Enviando..."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          enviar()
        }}
        className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-5"
      >
        <div className="flex gap-2" role="radiogroup" aria-label="Para quem é a aula">
          {(['turma', 'aluno'] as const).map((opcao) => (
            <button
              key={opcao}
              type="button"
              role="radio"
              aria-checked={alvo === opcao}
              onClick={() => setValue('alvo', opcao)}
              className={`px-4 h-9 rounded-full border text-xs font-bold transition-all hover:cursor-pointer ${
                alvo === opcao ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
              }`}
            >
              {opcao === 'turma' ? 'Para uma turma' : 'Aula individual'}
            </button>
          ))}
        </div>

        {alvo === 'turma' ? (
          <div className="space-y-2">
            <Label className={ROTULO}>Turma *</Label>
            <Select value={watch('id_turma')} onValueChange={(v) => selecionar('id_turma', v)} disabled={isSaving}>
              <SelectTrigger className={campo(!!errors.id_turma)}>
                <SelectValue placeholder="Escolha a turma" />
              </SelectTrigger>
              <SelectContent>
                {turmas.map((turma) => (
                  <SelectItem key={turma.id} value={String(turma.id)}>
                    {apelidoTurma(turma)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.id_turma && <p className={ERRO}>{errors.id_turma.message}</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={ROTULO}>Aluno *</Label>
              <Select
                value={watch('id_aluno')}
                onValueChange={(v) => {
                  selecionar('id_aluno', v)
                  setValue('id_curso', '')
                }}
                disabled={isSaving}
              >
                <SelectTrigger className={campo(!!errors.id_aluno)}>
                  <SelectValue placeholder="Escolha o aluno" />
                </SelectTrigger>
                <SelectContent>
                  {alunos.map((aluno) => (
                    <SelectItem key={aluno.id} value={String(aluno.id)}>
                      {aluno.nome ?? `Aluno #${aluno.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.id_aluno && <p className={ERRO}>{errors.id_aluno.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className={ROTULO}>Curso *</Label>
              <Select value={watch('id_curso')} onValueChange={(v) => selecionar('id_curso', v)} disabled={isSaving || cursosDoAluno.length === 0}>
                <SelectTrigger className={campo(!!errors.id_curso)}>
                  <SelectValue placeholder="Escolha o curso" />
                </SelectTrigger>
                <SelectContent>
                  {cursosDoAluno.map((curso) => (
                    <SelectItem key={curso.id} value={String(curso.id)}>
                      {curso.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.id_curso && <p className={ERRO}>{errors.id_curso.message}</p>}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label className={ROTULO}>Tipo *</Label>
          <Select value={watch('tipo_aula')} onValueChange={(v) => selecionar('tipo_aula', v)} disabled={isSaving}>
            <SelectTrigger className={campo(false)}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(AULA_TIPO) as AulaTipo[]).map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {AULA_TIPO[tipo]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="data-nova-aula" className={ROTULO}>Data *</Label>
          <Input id="data-nova-aula" type="date" min={format(new Date(), 'yyyy-MM-dd')} disabled={isSaving} className={campo(!!errors.data)} {...register('data')} />
          {errors.data && <p className={ERRO}>{errors.data.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="inicio-nova-aula" className={ROTULO}>Início *</Label>
            <Input id="inicio-nova-aula" type="time" disabled={isSaving} className={campo(!!errors.hora_inicio)} {...register('hora_inicio')} />
            {errors.hora_inicio && <p className={ERRO}>{errors.hora_inicio.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="termino-nova-aula" className={ROTULO}>Término *</Label>
            <Input id="termino-nova-aula" type="time" disabled={isSaving} className={campo(!!errors.hora_termino)} {...register('hora_termino')} />
            {errors.hora_termino && <p className={ERRO}>{errors.hora_termino.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="motivo-nova-aula" className={ROTULO}>Observação</Label>
          <Textarea
            id="motivo-nova-aula"
            rows={3}
            maxLength={1000}
            placeholder="Ex: Reforço antes da apresentação."
            disabled={isSaving}
            className="rounded-xl border-zinc-200 focus-visible:ring-indigo-600 resize-none"
            {...register('motivo')}
          />
        </div>

        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </CustomModalGlobal>
  )
}
