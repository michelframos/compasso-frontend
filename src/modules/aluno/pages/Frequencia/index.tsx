import React, { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ClipboardCheck, Loader2 } from 'lucide-react'
import { NoData } from '@/shared/components/NoData'
import { JustificativaDialog } from '../../components/JustificativaDialog'
import { ReposicaoDialog } from '../../components/ReposicaoDialog'
import { useMinhasJustificativas } from '../../hooks/useMinhasJustificativas'
import { useMinhasReposicoes } from '../../hooks/useMinhasReposicoes'
import type { AulaFrequencia, JustificativaDoAluno, ReposicaoDoAluno, ResumoFrequencia, TurmaFrequencia } from '../../types'
import { useFrequencia } from './hooks/useFrequencia'

const STATUS: Record<AulaFrequencia['status'], { label: string; classe: string }> = {
  presente: { label: 'Presente', classe: 'bg-emerald-50 text-emerald-700' },
  ausente: { label: 'Falta', classe: 'bg-rose-50 text-rose-700' },
  justificado: { label: 'Justificada', classe: 'bg-amber-50 text-amber-700' },
}

function percentual(resumo: ResumoFrequencia) {
  if (resumo.percentual === null) return '—'
  return `${resumo.percentual.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
}

function Resumo({ resumo }: { resumo: ResumoFrequencia }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">Presença</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-zinc-900">{percentual(resumo)}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100">
        <div
          className="h-full rounded-full bg-indigo-500"
          style={{ width: `${Math.min(resumo.percentual ?? 0, 100)}%` }}
        />
      </div>
      <p className="mt-3 text-sm text-zinc-600">
        {resumo.presentes} {resumo.presentes === 1 ? 'presença' : 'presenças'} · {resumo.ausentes}{' '}
        {resumo.ausentes === 1 ? 'falta' : 'faltas'} · {resumo.justificados}{' '}
        {resumo.justificados === 1 ? 'justificada' : 'justificadas'}
      </p>
    </section>
  )
}

function Aula({
  aula,
  pedido,
  reposicao,
  onJustificar,
  onRepor,
}: {
  aula: AulaFrequencia
  pedido?: JustificativaDoAluno
  reposicao?: ReposicaoDoAluno
  onJustificar: (aula: AulaFrequencia) => void
  onRepor: (aula: AulaFrequencia) => void
}) {
  const status = STATUS[aula.status] ?? { label: aula.status, classe: 'bg-zinc-100 text-zinc-600' }
  const data = format(new Date(`${aula.data}T00:00:00`), "EEE, d 'de' MMM", { locale: ptBR })
  const enviada = pedido && pedido.status !== 'recusada'
  const reposicaoAberta = reposicao && reposicao.status !== 'recusada'

  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-semibold capitalize text-zinc-800">{data}</p>
        <p className="text-xs text-zinc-500">
          {aula.hora_inicio}–{aula.hora_termino}
        </p>
        {aula.status === 'ausente' && (
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
            {enviada ? (
              <p className="text-xs font-semibold text-zinc-500">
                {pedido.status === 'aceita' ? 'Justificativa aceita' : 'Justificativa enviada'}
              </p>
            ) : (
              <button type="button" onClick={() => onJustificar(aula)} className="text-xs font-bold text-indigo-600">
                Justificar
              </button>
            )}
            {reposicaoAberta ? (
              <p className="text-xs font-semibold text-zinc-500">
                {reposicao.status === 'aprovada' ? 'Reposição aprovada' : 'Reposição enviada'}
              </p>
            ) : (
              <button type="button" onClick={() => onRepor(aula)} className="text-xs font-bold text-indigo-600">
                Pedir reposição
              </button>
            )}
          </div>
        )}
      </div>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${status.classe}`}>{status.label}</span>
    </li>
  )
}

function TurmaCard({
  turma,
  porAula,
  porReposicao,
  onJustificar,
  onRepor,
}: {
  turma: TurmaFrequencia
  porAula: Record<number, JustificativaDoAluno>
  porReposicao: Record<number, ReposicaoDoAluno>
  onJustificar: (aula: AulaFrequencia) => void
  onRepor: (aula: AulaFrequencia) => void
}) {
  const encerrada = turma.status_matricula === 'cancelada' || turma.status_matricula === 'transferida'

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-zinc-900">{turma.nome}</h2>
          {turma.curso && turma.curso !== turma.nome && <p className="mt-0.5 text-sm text-zinc-500">{turma.curso}</p>}
          {encerrada && <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Encerrada</p>}
        </div>
        <p className="text-lg font-bold text-indigo-600">{percentual(turma)}</p>
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        {turma.presentes} presenças · {turma.ausentes} faltas · {turma.justificados} justificadas
      </p>
      {turma.aulas.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">Nenhuma chamada registrada.</p>
      ) : (
        <ul className="mt-2 divide-y divide-zinc-100">
          {turma.aulas.map((aula) => (
            <Aula
              key={aula.id}
              aula={aula}
              pedido={porAula[aula.id_aula]}
              reposicao={porReposicao[aula.id_aula]}
              onJustificar={onJustificar}
              onRepor={onRepor}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

export const FrequenciaPage: React.FC = () => {
  const { frequencia, isLoading, aguardandoDependente } = useFrequencia()
  const { porAula, recarregar } = useMinhasJustificativas()
  const { porAula: porReposicao, regras, recarregar: recarregarReposicoes } = useMinhasReposicoes()
  const [idMatricula, setIdMatricula] = useState<number | null>(null)
  const [falta, setFalta] = useState<AulaFrequencia | null>(null)
  const [reposicao, setReposicao] = useState<AulaFrequencia | null>(null)

  if (aguardandoDependente) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h1 className="text-lg font-bold">Frequência</h1>
        <p className="mt-2 text-sm text-zinc-600">Selecione um aluno para ver a frequência dele.</p>
      </section>
    )
  }

  const turmas = frequencia?.turmas ?? []
  const selecionada = idMatricula === null ? null : turmas.find((turma) => turma.id_matricula === idMatricula) ?? null
  const visiveis = selecionada ? [selecionada] : turmas
  const resumo = selecionada ?? frequencia?.resumo

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Frequência</h1>
        <p className="mt-1 text-sm text-zinc-500">Presenças, faltas e justificadas de cada turma.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-zinc-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Carregando...</span>
        </div>
      ) : turmas.length === 0 || !resumo ? (
        <NoData
          title="Nenhuma matrícula"
          description="A frequência aparece aqui quando houver uma turma."
          icon={<ClipboardCheck className="h-8 w-8" />}
          showAddButton={false}
        />
      ) : (
        <>
          {turmas.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setIdMatricula(null)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                  idMatricula === null ? 'bg-indigo-600 text-white' : 'bg-white text-zinc-600 ring-1 ring-zinc-200'
                }`}
              >
                Todas
              </button>
              {turmas.map((turma) => (
                <button
                  key={turma.id_matricula ?? turma.nome}
                  type="button"
                  onClick={() => setIdMatricula(turma.id_matricula)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                    idMatricula === turma.id_matricula
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-zinc-600 ring-1 ring-zinc-200'
                  }`}
                >
                  {turma.nome}
                </button>
              ))}
            </div>
          )}
          <Resumo resumo={resumo} />
          {visiveis.map((turma) => (
            <TurmaCard
              key={turma.id_matricula ?? turma.nome}
              turma={turma}
              porAula={porAula}
              porReposicao={porReposicao}
              onJustificar={setFalta}
              onRepor={setReposicao}
            />
          ))}
        </>
      )}

      <JustificativaDialog
        aberto={falta !== null}
        tipo="justificativa"
        idAula={falta?.id_aula ?? null}
        titulo={falta ? format(new Date(`${falta.data}T00:00:00`), "d 'de' MMMM", { locale: ptBR }) : ''}
        onFechar={() => setFalta(null)}
        onEnviada={recarregar}
      />
      <ReposicaoDialog
        aberto={reposicao !== null}
        idAula={reposicao?.id_aula ?? null}
        titulo={reposicao ? format(new Date(`${reposicao.data}T00:00:00`), "d 'de' MMMM", { locale: ptBR }) : ''}
        regras={regras}
        onFechar={() => setReposicao(null)}
        onEnviada={recarregarReposicoes}
      />
    </div>
  )
}
