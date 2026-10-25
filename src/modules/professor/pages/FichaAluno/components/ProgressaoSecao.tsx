import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowRight, TrendingUp, X } from 'lucide-react'
import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog'
import { PROGRESSAO_STATUS } from '../../../constants'
import type { FichaAluno, SugestaoProgressao } from '../../../types'
import { useProgressoes } from '../hooks/useProgressoes'
import { SugestaoProgressaoDialog } from './SugestaoProgressaoDialog'

interface ProgressaoSecaoProps {
  progressoes: SugestaoProgressao[]
  matriculasVigentes: FichaAluno['matriculas']
  alterarProgressoes: (alterar: (lista: SugestaoProgressao[]) => SugestaoProgressao[]) => void
}

const dataCurta = (valor: string) => format(new Date(valor), "d 'de' MMM yyyy", { locale: ptBR })

const ItemProgressao: React.FC<{ sugestao: SugestaoProgressao; onCancelar: (s: SugestaoProgressao) => void }> = ({
  sugestao,
  onCancelar,
}) => {
  const status = PROGRESSAO_STATUS[sugestao.status]

  return (
    <div className="p-4 rounded-2xl bg-white border border-zinc-100 shadow-sm space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-zinc-900">
            {sugestao.nivel_atual?.nome ?? 'Nível atual'}
            <ArrowRight className="w-4 h-4 text-indigo-500" />
            {sugestao.nivel_sugerido?.nome}
          </p>
          <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${status.className}`}>
            {status.label}
          </span>
        </div>
        {sugestao.pode_cancelar && (
          <button
            type="button"
            onClick={() => onCancelar(sugestao)}
            className="inline-flex items-center gap-1 h-8 px-3 rounded-full text-xs font-bold text-zinc-500 hover:bg-rose-50 hover:text-rose-600 hover:cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            Cancelar
          </button>
        )}
      </div>

      <p className="text-sm text-zinc-700 whitespace-pre-line break-words">{sugestao.justificativa}</p>

      {sugestao.status !== 'pendente' && (
        <p className="text-xs text-zinc-500 p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
          {sugestao.status === 'aprovada' ? 'Aprovada' : 'Rejeitada'}
          {sugestao.decisor?.nome && ` por ${sugestao.decisor.nome}`}
          {sugestao.decidido_em && ` em ${dataCurta(sugestao.decidido_em)}`}
          {sugestao.turma_destino && ` · nova turma: ${sugestao.turma_destino.descricao ?? `#${sugestao.turma_destino.id}`}`}
          {sugestao.motivo_decisao && <span className="block mt-1 text-zinc-700">{sugestao.motivo_decisao}</span>}
        </p>
      )}

      <p className="text-[11px] text-zinc-400">
        Sugerida por {sugestao.pode_cancelar ? 'você' : sugestao.professor?.nome ?? 'professor'} em {dataCurta(sugestao.created_at)}
      </p>
    </div>
  )
}

export const ProgressaoSecao: React.FC<ProgressaoSecaoProps> = ({ progressoes, matriculasVigentes, alterarProgressoes }) => {
  const {
    formAberto,
    niveis,
    isSaving,
    abrirForm,
    fecharForm,
    sugerir,
    paraCancelar,
    isCancelling,
    pedirCancelamento,
    desistirCancelamento,
    confirmarCancelamento,
  } = useProgressoes(alterarProgressoes)

  const comPendente = new Set(progressoes.filter((s) => s.status === 'pendente').map((s) => s.matricula?.id))
  const elegiveis = matriculasVigentes.filter((m) => !comPendente.has(m.id))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          {elegiveis.length === 0 && matriculasVigentes.length > 0
            ? 'Já existe uma sugestão pendente para cada matrícula.'
            : 'Sugira à secretaria a mudança de nível do aluno.'}
        </p>
        {elegiveis.length > 0 && (
          <button
            type="button"
            onClick={abrirForm}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-white border border-indigo-200 text-indigo-600 text-xs font-bold hover:bg-indigo-50 transition-colors hover:cursor-pointer shrink-0"
          >
            <TrendingUp className="w-4 h-4" />
            Sugerir progressão
          </button>
        )}
      </div>

      {progressoes.length > 0 && (
        <div className="space-y-2">
          {progressoes.map((sugestao) => (
            <ItemProgressao key={sugestao.id} sugestao={sugestao} onCancelar={pedirCancelamento} />
          ))}
        </div>
      )}

      <SugestaoProgressaoDialog
        aberto={formAberto}
        matriculas={elegiveis}
        niveis={niveis}
        isSaving={isSaving}
        onFechar={fecharForm}
        onSalvar={sugerir}
      />

      <ConfirmDeleteDialog
        open={paraCancelar !== null}
        onOpenChange={(open) => !open && desistirCancelamento()}
        title={<>Cancelar <span className="text-rose-500">sugestão</span></>}
        description="A sugestão de progressão será retirada da fila da secretaria."
        confirmLabel="Cancelar sugestão"
        isLoading={isCancelling}
        onConfirm={confirmarCancelamento}
      />
    </div>
  )
}
