import React, { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertTriangle, ArrowLeft, CalendarClock, CheckCheck, CheckCircle2, Clock, Loader2, Users } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { AULA_STATUS } from '../../constants'
import { hora, tituloAula } from '../../lib/formatters'
import { SolicitarAlteracaoDialog } from '../../components/solicitacoes/SolicitarAlteracaoDialog'
import { AlunoChamadaItem } from './components/AlunoChamadaItem'
import { useChamada } from './hooks/useChamada'

export const ChamadaPage: React.FC = () => {
  const {
    aula,
    alunos,
    isLoading,
    isSaving,
    bloqueio,
    marcacoes,
    observacoes,
    conteudo,
    setConteudo,
    contagem,
    totalMarcados,
    marcar,
    marcarTodosPresentes,
    alterarObservacao,
    concluir,
    voltar,
    abrirFicha,
    recarregar,
  } = useChamada()
  const [alterando, setAlterando] = useState(false)

  const botaoVoltar = (
    <button
      type="button"
      onClick={voltar}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-indigo-600 hover:cursor-pointer"
    >
      <ArrowLeft className="w-4 h-4" />
      Voltar
    </button>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Carregando aula...</span>
      </div>
    )
  }

  if (!aula) {
    return (
      <div className="space-y-4">
        {botaoVoltar}
        <p className="text-sm text-zinc-500">Aula não encontrada ou sem acesso.</p>
      </div>
    )
  }

  const somenteLeitura = !!bloqueio
  const status = AULA_STATUS[aula.status ?? 'agendada']
  const faltamMarcar = alunos.length - totalMarcados

  return (
    <div className="space-y-5 pb-28 max-w-3xl">
      <div className="space-y-3">
        {botaoVoltar}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Chamada <span className="text-indigo-600">{tituloAula(aula)}</span>
            </h1>
            <p className="text-zinc-500 mt-1 text-[14px] flex items-center gap-1.5 first-letter:uppercase">
              <Clock className="w-4 h-4" />
              {format(new Date(`${aula.data}T00:00:00`), "EEEE, d 'de' MMMM", { locale: ptBR })} · {hora(aula.hora_inicio)} - {hora(aula.hora_termino)}
            </p>
          </div>
          <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${status.className}`}>
            {status.label}
          </span>
        </div>
        {aula.status === 'agendada' && aula.data.substring(0, 10) >= format(new Date(), 'yyyy-MM-dd') && (
          <button
            type="button"
            onClick={() => setAlterando(true)}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-white border border-zinc-200 text-xs font-bold text-zinc-600 hover:border-indigo-200 hover:text-indigo-600 hover:cursor-pointer"
          >
            <CalendarClock className="w-4 h-4" />
            Cancelar, repor ou pedir substituto
          </button>
        )}
      </div>

      <SolicitarAlteracaoDialog aula={alterando ? aula : null} onFechar={() => setAlterando(false)} onConcluido={recarregar} />

      {bloqueio && (
        <div className="flex items-start gap-2 p-3 rounded-2xl bg-amber-50 border border-amber-100 text-amber-800 text-sm">
          {aula.status === 'concluida' ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />}
          {bloqueio}
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="flex items-center gap-1 text-zinc-500">
              <Users className="w-4 h-4" /> {alunos.length}
            </span>
            <span className="text-emerald-600">P {contagem.presente}</span>
            <span className="text-rose-600">F {contagem.ausente}</span>
            <span className="text-amber-600">J {contagem.justificado}</span>
          </div>
          {!somenteLeitura && alunos.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={marcarTodosPresentes}
              className="h-9 rounded-full text-xs font-bold gap-1.5 hover:cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              Todos presentes
            </Button>
          )}
        </div>

        {alunos.length === 0 ? (
          <p className="text-sm text-zinc-400 bg-white rounded-2xl border border-dashed border-zinc-200 p-4 text-center">
            Nenhum aluno ativo nesta aula.
          </p>
        ) : (
          <div className="space-y-2">
            {alunos.map((aluno) => (
              <AlunoChamadaItem
                key={aluno.id}
                nome={aluno.nome}
                status={marcacoes[aluno.id]}
                observacao={observacoes[aluno.id] ?? ''}
                somenteLeitura={somenteLeitura}
                onMarcar={(novo) => marcar(aluno.id, novo)}
                onObservacao={(texto) => alterarObservacao(aluno.id, texto)}
                onAbrirFicha={() => abrirFicha(aluno.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <label htmlFor="conteudo-aula" className="text-[13px] font-black text-zinc-500 uppercase tracking-wider">
          Conteúdo ministrado
        </label>
        {somenteLeitura ? (
          <p className="text-sm text-zinc-700 bg-white rounded-2xl border border-zinc-100 p-4 whitespace-pre-line">
            {conteudo || <span className="text-zinc-400 italic">Conteúdo não informado.</span>}
          </p>
        ) : (
          <Textarea
            id="conteudo-aula"
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            placeholder="O que foi trabalhado nesta aula?"
            maxLength={5000}
            rows={4}
            className="rounded-2xl bg-white text-sm"
          />
        )}
      </section>

      {!somenteLeitura && (
        <div className="fixed bottom-0 inset-x-0 md:left-auto md:right-6 md:bottom-6 md:inset-x-auto z-20 p-3 md:p-0 bg-white/95 md:bg-transparent border-t border-zinc-100 md:border-none backdrop-blur">
          <Button
            type="button"
            onClick={concluir}
            disabled={isSaving || faltamMarcar > 0}
            className="w-full md:w-auto h-12 px-6 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 shadow-lg shadow-indigo-200 hover:cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {faltamMarcar > 0 ? `Marque mais ${faltamMarcar} ${faltamMarcar === 1 ? 'aluno' : 'alunos'}` : 'Concluir aula'}
          </Button>
        </div>
      )}
    </div>
  )
}
