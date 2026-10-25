import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertTriangle, ArrowRight, CalendarClock, Receipt } from 'lucide-react'
import { AULA_TIPO, DESTINO_COBRANCA, SOLICITACAO_STATUS, SOLICITACAO_TIPO } from '../../constants'
import { dataLocal } from '../../lib/formatters'
import type { AulaResumida, SolicitacaoAula } from '../../types'

const dia = (valor: string) => format(dataLocal(valor), 'EEE, dd/MM', { locale: ptBR })

const quando = (data: string | null, inicio: string | null, termino: string | null) =>
  data ? `${dia(data)} · ${inicio ?? ''}–${termino ?? ''}` : '—'

const descreverAula = (aula: AulaResumida) =>
  `${aula.titulo}${aula.aluno ? ` — ${aula.aluno}` : ''} · ${quando(aula.data, aula.hora_inicio, aula.hora_termino)}`

const pedido = (s: SolicitacaoAula): string => {
  const novoHorario = quando(s.data_sugerida, s.hora_inicio_sugerida, s.hora_termino_sugerida)

  switch (s.tipo) {
    case 'cancelamento':
      return 'Cancelar a aula'
    case 'reposicao':
      return `Repor em ${novoHorario}`
    case 'substituicao':
      return s.substituto ? `Passar para ${s.substituto.nome}` : 'Substituto a definir pela secretaria'
    case 'criacao': {
      const alvo = s.nova_aula?.turma?.titulo ?? `Aula individual${s.nova_aula?.aluno ? ` de ${s.nova_aula.aluno.nome}` : ''}`
      const tipo = s.nova_aula?.tipo_aula ? ` (${AULA_TIPO[s.nova_aula.tipo_aula]})` : ''
      return `${alvo}${tipo} em ${novoHorario}`
    }
  }
}

interface ResumoSolicitacaoProps {
  solicitacao: SolicitacaoAula
  mostrarProfessor?: boolean
  children?: React.ReactNode
}

export const ResumoSolicitacao: React.FC<ResumoSolicitacaoProps> = ({ solicitacao, mostrarProfessor = false, children }) => {
  const status = SOLICITACAO_STATUS[solicitacao.status]
  const avisos = solicitacao.analise?.avisos ?? []
  const criadaEm = format(new Date(solicitacao.created_at), "dd/MM 'às' HH:mm")

  return (
    <div className="p-5 rounded-2xl bg-white border border-zinc-100 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
            {SOLICITACAO_TIPO[solicitacao.tipo]}
          </span>
          {mostrarProfessor && solicitacao.professor && (
            <span className="text-sm font-bold text-zinc-900">{solicitacao.professor.nome}</span>
          )}
        </div>
        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status.className}`}>
          {solicitacao.aplicada_automaticamente ? 'Aplicada' : status.label}
        </span>
      </div>

      <div className="space-y-1.5 text-sm">
        {solicitacao.aula && (
          <p className="flex items-start gap-2 text-zinc-600">
            <CalendarClock className="w-4 h-4 mt-0.5 shrink-0 text-zinc-400" />
            <span>{descreverAula(solicitacao.aula)}</span>
          </p>
        )}
        <p className="flex items-start gap-2 font-semibold text-zinc-900">
          <ArrowRight className="w-4 h-4 mt-0.5 shrink-0 text-indigo-500" />
          <span>{pedido(solicitacao)}</span>
        </p>
        {solicitacao.destino_cobranca && (
          <p className="flex items-start gap-2 text-zinc-600">
            <Receipt className="w-4 h-4 mt-0.5 shrink-0 text-zinc-400" />
            <span>Cobrança: {DESTINO_COBRANCA[solicitacao.destino_cobranca].toLowerCase()}</span>
          </p>
        )}
      </div>

      {solicitacao.motivo && <p className="text-sm text-zinc-700 whitespace-pre-line break-words">{solicitacao.motivo}</p>}

      {avisos.length > 0 && (
        <ul className="space-y-1 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
          {avisos.map((aviso) => (
            <li key={aviso} className="flex gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {aviso}
            </li>
          ))}
        </ul>
      )}

      <p className="text-[11px] text-zinc-400">Enviada em {criadaEm}</p>

      {solicitacao.status !== 'pendente' && !solicitacao.aplicada_automaticamente && (
        <p className="text-xs text-zinc-500 p-3 rounded-xl bg-zinc-50 border border-zinc-100">
          {status.label}
          {solicitacao.decisor && ` por ${solicitacao.decisor.nome}`}
          {solicitacao.decidido_em && ` em ${format(new Date(solicitacao.decidido_em), 'dd/MM/yyyy')}`}
          {solicitacao.aula_gerada && ` · nova aula ${quando(solicitacao.aula_gerada.data, solicitacao.aula_gerada.hora_inicio, solicitacao.aula_gerada.hora_termino)}`}
          {solicitacao.motivo_decisao && <span className="block mt-1 text-zinc-700">{solicitacao.motivo_decisao}</span>}
        </p>
      )}

      {children}
    </div>
  )
}
