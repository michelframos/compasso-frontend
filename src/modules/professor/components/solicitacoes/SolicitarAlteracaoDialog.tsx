import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Info, Loader2 } from 'lucide-react'
import { CustomModalGlobal } from '@/shared/components/CustomModalGlobal'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { SOLICITACAO_TIPO } from '../../constants'
import { dataLocal, hora, tituloAula } from '../../lib/formatters'
import type { AulaDoProfessor, SolicitacaoAula } from '../../types'
import { ResumoSolicitacao } from './ResumoSolicitacao'
import { useSolicitarAlteracao, type TipoAlteracao } from './useSolicitarAlteracao'

interface SolicitarAlteracaoDialogProps {
  aula: AulaDoProfessor | null
  onFechar: () => void
  onConcluido?: (solicitacao: SolicitacaoAula) => void
}

const ROTULO = 'text-zinc-700 font-medium ml-1'
const ERRO = 'text-[11px] text-rose-500 ml-1'
const campo = (comErro: boolean) => `h-11 rounded-xl ${comErro ? 'border-rose-500' : 'border-zinc-200'}`

const opcaoClasse = (ativa: boolean) =>
  `w-full p-3 rounded-xl border text-left transition-all hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
    ativa ? 'border-indigo-600 bg-indigo-50' : 'border-zinc-200 bg-white hover:border-zinc-300'
  }`

export const SolicitarAlteracaoDialog: React.FC<SolicitarAlteracaoDialogProps> = ({ aula, onFechar, onConcluido }) => {
  const { form, tipo, opcoes, carregando, permitidos, modo, professoresLivres, isSaving, enviar } = useSolicitarAlteracao(
    aula,
    (solicitacao) => {
      onConcluido?.(solicitacao)
      onFechar()
    }
  )
  const { register, setValue, watch, formState: { errors } } = form
  const destino = watch('destino_cobranca')
  const substituto = watch('id_professor_substituto')
  const avisarAlunos = watch('avisar_alunos')

  const pendente = opcoes?.solicitacao_pendente ?? null
  const modoAtual = modo(tipo)
  const podeEnviar = !carregando && !!opcoes && !pendente && permitidos.length > 0
  const descricao = aula
    ? `${tituloAula(aula)} · ${format(dataLocal(aula.data), "EEE, dd/MM", { locale: ptBR })} · ${hora(aula.hora_inicio)}–${hora(aula.hora_termino)}`
    : ''

  const escolherTipo = (novo: TipoAlteracao) => {
    setValue('tipo', novo)
    form.clearErrors()
  }

  return (
    <CustomModalGlobal
      open={aula !== null}
      close={(open: boolean) => !open && !isSaving && onFechar()}
      onClose={onFechar}
      onConfirm={enviar}
      isLoading={isSaving}
      firsChunkTitle="Alterar"
      secondChunkTitle="aula"
      colorSecondChunkTitle="text-indigo-600"
      titleDescription={descricao}
      showConfirmButton={podeEnviar}
      textConfirmButton={modoAtual === 'livre' ? 'Aplicar' : 'Enviar solicitação'}
      loadingText="Enviando..."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          enviar()
        }}
        className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-5"
      >
        {carregando || !opcoes ? (
          <div className="flex items-center justify-center py-10 gap-2 text-zinc-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Carregando...</span>
          </div>
        ) : pendente ? (
          <div className="space-y-3">
            <p className="text-sm text-zinc-600">Já existe uma solicitação pendente para esta aula. Aguarde a decisão da secretaria ou cancele-a em Solicitações.</p>
            <ResumoSolicitacao solicitacao={pendente} />
          </div>
        ) : permitidos.length === 0 ? (
          <p className="text-sm text-zinc-600">A escola não permite que professores alterem ou cancelem aulas. Fale com a secretaria.</p>
        ) : (
          <>
            <div className="space-y-2">
              <Label className={ROTULO}>O que você precisa?</Label>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tipo de alteração">
                {permitidos.map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={tipo === t}
                    disabled={isSaving}
                    onClick={() => escolherTipo(t)}
                    className={`px-4 h-9 rounded-full border text-xs font-bold transition-all hover:cursor-pointer ${
                      tipo === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    {SOLICITACAO_TIPO[t]}
                  </button>
                ))}
              </div>
              <p className="flex items-start gap-1.5 text-[11px] text-zinc-500 ml-1">
                <Info className="w-3.5 h-3.5 shrink-0 mt-px" />
                {modoAtual === 'livre'
                  ? 'A escola permite: a alteração é aplicada na agenda assim que você confirmar.'
                  : 'A escola exige aprovação: a secretaria analisa antes de mudar a agenda.'}
              </p>
            </div>

            {tipo === 'reposicao' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="data-reposicao" className={ROTULO}>Nova data *</Label>
                  <Input
                    id="data-reposicao"
                    type="date"
                    min={format(new Date(), 'yyyy-MM-dd')}
                    disabled={isSaving}
                    className={campo(!!errors.data_sugerida)}
                    {...register('data_sugerida')}
                  />
                  {errors.data_sugerida && <p className={ERRO}>{errors.data_sugerida.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="inicio-reposicao" className={ROTULO}>Início *</Label>
                    <Input id="inicio-reposicao" type="time" disabled={isSaving} className={campo(!!errors.hora_inicio_sugerida)} {...register('hora_inicio_sugerida')} />
                    {errors.hora_inicio_sugerida && <p className={ERRO}>{errors.hora_inicio_sugerida.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="termino-reposicao" className={ROTULO}>Término *</Label>
                    <Input id="termino-reposicao" type="time" disabled={isSaving} className={campo(!!errors.hora_termino_sugerida)} {...register('hora_termino_sugerida')} />
                    {errors.hora_termino_sugerida && <p className={ERRO}>{errors.hora_termino_sugerida.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {tipo === 'substituicao' && (
              <div className="space-y-2">
                <Label className={ROTULO}>Professor substituto {modoAtual === 'livre' ? '*' : '(opcional)'}</Label>
                {professoresLivres === null ? (
                  <p className="text-xs text-zinc-400 ml-1">Carregando professores...</p>
                ) : (
                  <Select value={substituto} onValueChange={(valor) => setValue('id_professor_substituto', valor, { shouldValidate: true })} disabled={isSaving}>
                    <SelectTrigger className={campo(!!errors.id_professor_substituto)}>
                      <SelectValue placeholder={modoAtual === 'livre' ? 'Escolha o substituto' : 'Deixe a secretaria escolher'} />
                    </SelectTrigger>
                    <SelectContent>
                      {professoresLivres.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)} disabled={p.conflito}>
                          {p.nome ?? `Professor #${p.id}`}
                          {p.conflito ? ' · já tem aula' : p.fora_disponibilidade ? ' · fora da disponibilidade' : ' · livre'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.id_professor_substituto && <p className={ERRO}>{errors.id_professor_substituto.message}</p>}
              </div>
            )}

            {opcoes.tem_cobranca && tipo !== 'substituicao' && (
              <div className="space-y-2">
                <Label className={ROTULO}>Esta aula tem cobrança. O que fazer com ela? *</Label>
                <button
                  type="button"
                  disabled={isSaving || (tipo === 'cancelamento' && !opcoes.proxima_aula_cobranca)}
                  onClick={() => setValue('destino_cobranca', 'proxima_aula', { shouldValidate: true })}
                  className={opcaoClasse(destino === 'proxima_aula')}
                >
                  <p className="text-sm font-bold text-zinc-900">Vai para a próxima aula</p>
                  <p className="text-[11px] text-zinc-500">
                    {tipo === 'reposicao'
                      ? 'A cobrança passa para a aula de reposição.'
                      : opcoes.proxima_aula_cobranca ?? 'Não há próxima aula deste aluno sem cobrança.'}
                  </p>
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setValue('destino_cobranca', 'cancelar', { shouldValidate: true })}
                  className={opcaoClasse(destino === 'cancelar')}
                >
                  <p className="text-sm font-bold text-zinc-900">Cancelar a cobrança</p>
                  <p className="text-[11px] text-zinc-500">O aluno não paga por esta aula.</p>
                </button>
                {errors.destino_cobranca && <p className={ERRO}>{errors.destino_cobranca.message}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="motivo-alteracao" className={ROTULO}>Motivo *</Label>
              <Textarea
                id="motivo-alteracao"
                rows={3}
                maxLength={1000}
                placeholder="Ex: Consulta médica; feriado municipal."
                disabled={isSaving}
                className={`rounded-xl focus-visible:ring-indigo-600 resize-none ${errors.motivo ? 'border-rose-500' : 'border-zinc-200'}`}
                {...register('motivo')}
              />
              {errors.motivo && <p className={ERRO}>{errors.motivo.message}</p>}
            </div>

            <label className="flex items-start gap-2.5 ml-1 hover:cursor-pointer">
              <Checkbox
                checked={avisarAlunos}
                onCheckedChange={(v) => setValue('avisar_alunos', v === true)}
                disabled={isSaving}
                className="mt-0.5"
              />
              <span>
                <span className="block text-sm font-medium text-zinc-700">Avisar os alunos</span>
                <span className="block text-[11px] text-zinc-500">
                  {modoAtual === 'livre'
                    ? 'Alunos e responsáveis recebem e-mail/WhatsApp com a mudança.'
                    : 'Alunos e responsáveis recebem e-mail/WhatsApp quando a secretaria aprovar.'}
                </span>
              </span>
            </label>
          </>
        )}

        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </CustomModalGlobal>
  )
}
