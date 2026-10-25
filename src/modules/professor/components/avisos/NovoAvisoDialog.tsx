import React from 'react'
import { AlertTriangle, Loader2, Users } from 'lucide-react'
import { CustomModalGlobal } from '@/shared/components/CustomModalGlobal'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import type { AvisosApi } from '../../api/avisos'
import { CANAL_AVISO, PUBLICO_AVISO } from '../../constants'
import type { AvisoTurma, CanalAviso, PublicoAviso } from '../../types'
import { AlunosChecklist } from './AlunosChecklist'
import type { FontesAviso } from './fontes'
import { useNovoAvisoForm } from './useNovoAvisoForm'

interface NovoAvisoDialogProps {
  aberto: boolean
  api: AvisosApi
  fontes: FontesAviso
  turmaInicial?: number
  onFechar: () => void
  onConcluido?: (aviso: AvisoTurma) => void
}

const ROTULO = 'text-zinc-700 font-medium ml-1'
const ERRO = 'text-[11px] text-rose-500 ml-1'
const campo = (comErro: boolean) => `h-11 rounded-xl ${comErro ? 'border-rose-500' : 'border-zinc-200'}`
const pilula = (ativa: boolean) =>
  `px-4 h-9 rounded-full border text-xs font-bold transition-all hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
    ativa ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
  }`

export const NovoAvisoDialog: React.FC<NovoAvisoDialogProps> = ({ aberto, api, fontes, turmaInicial, onFechar, onConcluido }) => {
  const { form, opcoes, turmas, alunosAvulsos, alunosDaTurma, previa, carregandoPrevia, limiteAtingido, isSaving, enviar } =
    useNovoAvisoForm({
      aberto,
      api,
      fontes,
      turmaInicial,
      onConcluido: (aviso) => {
        onConcluido?.(aviso)
        onFechar()
      },
    })
  const { register, setValue, watch, formState: { errors } } = form
  const alvo = watch('alvo')
  const publico = watch('publico')
  const canais = watch('canais')
  const idsAlunos = watch('ids_alunos')
  const turmaInteira = watch('turma_inteira')
  const mensagem = watch('mensagem')
  const atualizar = { shouldValidate: form.formState.isSubmitted }

  const trocarAlvo = (novo: 'turma' | 'alunos') => {
    setValue('alvo', novo)
    setValue('ids_alunos', [], atualizar)
  }
  const alternarCanal = (canal: CanalAviso) =>
    setValue('canais', canais.includes(canal) ? canais.filter((c) => c !== canal) : [...canais, canal], atualizar)

  return (
    <CustomModalGlobal
      open={aberto}
      close={(open: boolean) => !open && !isSaving && onFechar()}
      onClose={onFechar}
      onConfirm={enviar}
      isLoading={isSaving}
      firsChunkTitle="Novo"
      secondChunkTitle="aviso"
      colorSecondChunkTitle="text-indigo-600"
      titleDescription="Mensagem por e-mail ou WhatsApp para alunos e responsáveis."
      textConfirmButton="Enviar aviso"
      loadingText="Enviando..."
      showConfirmButton={!limiteAtingido}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          enviar()
        }}
        className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-5"
      >
        {opcoes?.limite && (
          <p className={`text-xs rounded-xl px-3 py-2 ${limiteAtingido ? 'bg-rose-50 text-rose-700' : 'bg-zinc-50 text-zinc-500'}`}>
            {limiteAtingido
              ? `Você já enviou os ${opcoes.limite.por_dia} avisos permitidos hoje. Tente novamente amanhã.`
              : `Você ainda pode enviar ${opcoes.limite.restantes} de ${opcoes.limite.por_dia} avisos hoje.`}
          </p>
        )}

        <div className="space-y-2">
          <Label className={ROTULO}>Para quem</Label>
          {fontes.alunos && (
            <div className="flex gap-2" role="radiogroup" aria-label="Para quem é o aviso">
              {(['turma', 'alunos'] as const).map((opcao) => (
                <button key={opcao} type="button" role="radio" aria-checked={alvo === opcao} onClick={() => trocarAlvo(opcao)} className={pilula(alvo === opcao)}>
                  {opcao === 'turma' ? 'Uma turma' : 'Alunos escolhidos'}
                </button>
              ))}
            </div>
          )}

          {alvo === 'turma' ? (
            <div className="space-y-3">
              <Select
                value={watch('id_turma')}
                onValueChange={(v) => {
                  setValue('id_turma', v, atualizar)
                  setValue('ids_alunos', [])
                }}
                disabled={isSaving}
              >
                <SelectTrigger className={campo(!!errors.id_turma)} aria-label="Turma">
                  <SelectValue placeholder="Escolha a turma" />
                </SelectTrigger>
                <SelectContent>
                  {turmas.map((turma) => (
                    <SelectItem key={turma.id} value={String(turma.id)}>
                      {turma.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.id_turma && <p className={ERRO}>{errors.id_turma.message}</p>}

              {watch('id_turma') && (
                <>
                  <label className="flex items-center gap-2 ml-1 text-sm text-zinc-700 hover:cursor-pointer">
                    <Checkbox
                      checked={turmaInteira}
                      onCheckedChange={(v) => setValue('turma_inteira', v === true, atualizar)}
                      disabled={isSaving}
                    />
                    Turma inteira{alunosDaTurma ? ` (${alunosDaTurma.length} alunos)` : ''}
                  </label>
                  {!turmaInteira &&
                    (alunosDaTurma ? (
                      <AlunosChecklist alunos={alunosDaTurma} selecionados={idsAlunos} onChange={(ids) => setValue('ids_alunos', ids, atualizar)} disabled={isSaving} />
                    ) : (
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-400 ml-1" />
                    ))}
                </>
              )}
            </div>
          ) : (
            <AlunosChecklist alunos={alunosAvulsos} selecionados={idsAlunos} onChange={(ids) => setValue('ids_alunos', ids, atualizar)} disabled={isSaving} />
          )}
          {errors.ids_alunos && <p className={ERRO}>{errors.ids_alunos.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className={ROTULO}>Quem recebe</Label>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Quem recebe">
            {(Object.keys(PUBLICO_AVISO) as PublicoAviso[]).map((opcao) => (
              <button key={opcao} type="button" role="radio" aria-checked={publico === opcao} onClick={() => setValue('publico', opcao)} className={pilula(publico === opcao)}>
                {PUBLICO_AVISO[opcao].label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-zinc-500 ml-1">{PUBLICO_AVISO[publico].descricao}</p>
        </div>

        <div className="space-y-2">
          <Label className={ROTULO}>Canais</Label>
          <div className="flex flex-wrap gap-4 ml-1">
            {(Object.keys(CANAL_AVISO) as CanalAviso[]).map((canal) => {
              const disponivel = opcoes?.canais[canal] ?? canal === 'email'
              return (
                <label key={canal} className={`flex items-center gap-2 text-sm ${disponivel ? 'text-zinc-700 hover:cursor-pointer' : 'text-zinc-400'}`}>
                  <Checkbox checked={canais.includes(canal)} onCheckedChange={() => alternarCanal(canal)} disabled={isSaving || !disponivel} />
                  {CANAL_AVISO[canal]}
                </label>
              )
            })}
          </div>
          {opcoes && !opcoes.canais.whatsapp && (
            <p className="text-[11px] text-zinc-500 ml-1">O WhatsApp da escola não está conectado (Configurações → WhatsApp).</p>
          )}
          {errors.canais && <p className={ERRO}>{errors.canais.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="titulo-aviso" className={ROTULO}>Título *</Label>
          <Input id="titulo-aviso" maxLength={120} placeholder="Ex: Ensaio extra no sábado" disabled={isSaving} className={campo(!!errors.titulo)} {...register('titulo')} />
          {errors.titulo && <p className={ERRO}>{errors.titulo.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="mensagem-aviso" className={ROTULO}>Mensagem *</Label>
          <Textarea
            id="mensagem-aviso"
            rows={5}
            maxLength={2000}
            disabled={isSaving}
            className={`rounded-xl focus-visible:ring-indigo-600 resize-none ${errors.mensagem ? 'border-rose-500' : 'border-zinc-200'}`}
            {...register('mensagem')}
          />
          <div className="flex justify-between">
            {errors.mensagem ? <p className={ERRO}>{errors.mensagem.message}</p> : <span />}
            <span className="text-[11px] text-zinc-400 mr-1">{mensagem.length}/2000</span>
          </div>
        </div>

        <PreviaEnvio previa={previa} carregando={carregandoPrevia} />

        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </CustomModalGlobal>
  )
}

const PreviaEnvio: React.FC<{ previa: ReturnType<typeof useNovoAvisoForm>['previa']; carregando: boolean }> = ({ previa, carregando }) => {
  if (carregando) {
    return (
      <div className="flex items-center gap-2 text-xs text-zinc-400 rounded-2xl bg-zinc-50 px-4 py-3">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Calculando destinatários...
      </div>
    )
  }
  if (!previa) return null

  const porCanal = (Object.keys(previa.por_canal) as CanalAviso[]).map((canal) => `${CANAL_AVISO[canal]}: ${previa.por_canal[canal]}`)

  return (
    <div className="rounded-2xl bg-indigo-50/60 border border-indigo-100 px-4 py-3 space-y-2">
      <p className="flex items-center gap-2 text-sm font-bold text-zinc-800">
        <Users className="w-4 h-4 text-indigo-600" />
        {previa.mensagens} mensagem(ns) para {previa.alunos} aluno(s)
      </p>
      {porCanal.length > 0 && <p className="text-xs text-zinc-500">{porCanal.join(' · ')}</p>}
      {previa.sem_contato.length > 0 && (
        <p className="flex items-start gap-2 text-xs text-amber-700">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            Sem contato e não serão avisados: {previa.sem_contato.map((p) => `${p.nome} (${CANAL_AVISO[p.canal]})`).join(', ')}.
          </span>
        </p>
      )}
    </div>
  )
}
