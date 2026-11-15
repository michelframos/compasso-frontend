import React, { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ClipboardCheck, Users } from 'lucide-react'
import { NoData } from '@/shared/components/NoData'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { JustificativaDialog } from '../../components/JustificativaDialog'
import { ReposicaoDialog } from '../../components/ReposicaoDialog'
import { useMinhasJustificativas } from '../../hooks/useMinhasJustificativas'
import { useMinhasReposicoes } from '../../hooks/useMinhasReposicoes'
import type { AulaFrequencia, JustificativaDoAluno, ReposicaoDoAluno, TurmaFrequencia } from '../../types'
import { AulaFrequenciaItem } from './components/AulaFrequenciaItem'
import { percentualCurto, ResumoFrequenciaCard } from './components/ResumoFrequenciaCard'
import { useFrequencia } from './hooks/useFrequencia'

type FiltroAulas = 'todas' | 'faltas'

function FrequenciaSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-44 w-full rounded-2xl" />
      <Skeleton className="h-10 w-full rounded-full" />
      <Skeleton className="h-56 w-full rounded-2xl" />
    </div>
  )
}

function EmptyAulas() {
  return (
    <p className="mt-3 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-3 py-4 text-center text-sm text-zinc-400">
      Nenhuma chamada registrada.
    </p>
  )
}

function TurmaCard({
  turma,
  porAula,
  porReposicao,
  filtroAulas,
  onJustificar,
  onRepor,
}: {
  turma: TurmaFrequencia
  porAula: Record<number, JustificativaDoAluno>
  porReposicao: Record<number, ReposicaoDoAluno>
  filtroAulas: FiltroAulas
  onJustificar: (aula: AulaFrequencia) => void
  onRepor: (aula: AulaFrequencia) => void
}) {
  const encerrada = turma.status_matricula === 'cancelada' || turma.status_matricula === 'transferida'
  const aulas =
    filtroAulas === 'faltas' ? turma.aulas.filter((aula) => aula.status === 'ausente') : turma.aulas
  const largura = Math.min(Math.max(turma.percentual ?? 0, 0), 100)
  const barra =
    turma.percentual === null
      ? 'bg-indigo-500'
      : turma.percentual >= 80
        ? 'bg-emerald-500'
        : turma.percentual >= 60
          ? 'bg-amber-500'
          : 'bg-rose-500'

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-zinc-900">{turma.nome}</h2>
          {turma.curso && turma.curso !== turma.nome && (
            <p className="mt-0.5 text-sm text-zinc-500">{turma.curso}</p>
          )}
          {encerrada && (
            <span className="mt-1.5 inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
              Encerrada
            </span>
          )}
        </div>
        <p className="text-lg font-black tabular-nums text-indigo-600">{percentualCurto(turma)}</p>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100">
        <div className={`h-full rounded-full ${barra}`} style={{ width: `${largura}%` }} />
      </div>

      <p className="mt-2 text-xs text-zinc-500">
        {turma.presentes} presenças · {turma.ausentes} faltas · {turma.justificados} justificadas
      </p>

      {turma.aulas.length === 0 ? (
        <EmptyAulas />
      ) : aulas.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-3 py-4 text-center text-sm text-zinc-400">
          Nenhuma falta nesta turma.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {aulas.map((aula) => (
            <AulaFrequenciaItem
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
  const { frequencia, frequenciaErro, isLoading, aguardandoDependente } = useFrequencia()
  const { porAula, recarregar } = useMinhasJustificativas()
  const { porAula: porReposicao, regras, recarregar: recarregarReposicoes } = useMinhasReposicoes()
  const [idMatricula, setIdMatricula] = useState<number | null>(null)
  const [filtroAulas, setFiltroAulas] = useState<FiltroAulas>('todas')
  const [falta, setFalta] = useState<AulaFrequencia | null>(null)
  const [reposicao, setReposicao] = useState<AulaFrequencia | null>(null)

  if (aguardandoDependente) {
    return (
      <section className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-200 bg-white px-5 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Users className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-lg font-bold text-zinc-900">Selecione um aluno</h1>
        <p className="mt-2 max-w-sm text-sm text-zinc-600">
          Use o seletor no topo da tela para escolher o dependente e ver a frequência dele.
        </p>
      </section>
    )
  }

  const turmas = frequencia?.turmas ?? []
  const selecionada = idMatricula === null ? null : turmas.find((turma) => turma.id_matricula === idMatricula) ?? null
  const visiveis = selecionada ? [selecionada] : turmas
  const resumo = selecionada ?? frequencia?.resumo
  const totalFaltas = visiveis.reduce((acc, turma) => acc + turma.ausentes, 0)

  return (
    <div className="space-y-4 pb-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Frequência</h1>
          <p className="mt-1 text-sm text-zinc-500">Presenças, faltas e justificadas de cada turma.</p>
        </div>

        {!isLoading && turmas.length > 0 && (
          <div className="inline-flex rounded-full bg-zinc-100 p-1 self-start">
            {([
              ['todas', 'Todas'],
              ['faltas', `Faltas${totalFaltas > 0 ? ` (${totalFaltas})` : ''}`],
            ] as [FiltroAulas, string][]).map(([valor, label]) => (
              <button
                key={valor}
                type="button"
                onClick={() => setFiltroAulas(valor)}
                className={`h-8 rounded-full px-3 text-xs font-bold ${
                  filtroAulas === valor ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <FrequenciaSkeleton />
      ) : frequenciaErro && !frequencia ? (
        <section className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/40 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-rose-800">Não foi possível carregar a frequência.</p>
          <p className="mt-1 text-sm text-rose-700/80">Tente novamente em instantes.</p>
        </section>
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
                  idMatricula === null ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100' : 'bg-white text-zinc-600 ring-1 ring-zinc-200'
                }`}
              >
                Todas
              </button>
              {turmas.map((turma) => (
                <button
                  key={turma.id_matricula ?? turma.nome}
                  type="button"
                  onClick={() => setIdMatricula(turma.id_matricula)}
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                    idMatricula === turma.id_matricula
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                      : 'bg-white text-zinc-600 ring-1 ring-zinc-200'
                  }`}
                >
                  <span className="max-w-[10rem] truncate">{turma.nome}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                      idMatricula === turma.id_matricula ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'
                    }`}
                  >
                    {percentualCurto(turma)}
                  </span>
                </button>
              ))}
            </div>
          )}

          <ResumoFrequenciaCard resumo={resumo} />

          {visiveis.map((turma) => (
            <TurmaCard
              key={turma.id_matricula ?? turma.nome}
              turma={turma}
              porAula={porAula}
              porReposicao={porReposicao}
              filtroAulas={filtroAulas}
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
