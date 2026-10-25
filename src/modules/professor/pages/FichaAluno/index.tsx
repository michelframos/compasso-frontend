import React, { useMemo } from 'react'
import { ArrowLeft, ClipboardCheck, LayoutList, Loader2, NotebookPen } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { useHasModulo } from '@/shared/hooks/useHasModulo'
import { AvaliacoesLista } from '../../components/avaliacoes/AvaliacoesLista'
import type { OpcaoAvaliacao } from '../../components/avaliacoes/AvaliacaoFormDialog'
import { apelidoTurma } from '../../lib/formatters'
import { CabecalhoAluno } from './components/CabecalhoAluno'
import { FrequenciaResumo } from './components/FrequenciaResumo'
import { MatriculasLista } from './components/MatriculasLista'
import { ObservacoesSecao } from './components/ObservacoesSecao'
import { ProgressaoSecao } from './components/ProgressaoSecao'
import { useFichaAluno } from './hooks/useFichaAluno'

const TITULO_SECAO = 'text-[13px] font-black text-zinc-500 uppercase tracking-wider'
const ABA = 'flex items-center gap-1.5 py-2 sm:py-1.5 rounded-xl text-xs sm:text-sm font-bold hover:cursor-pointer'

const Contador: React.FC<{ total: number }> = ({ total }) =>
  total > 0 ? (
    <span className="px-1.5 min-w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-[10px] leading-5">{total}</span>
  ) : null

export const FichaAlunoPage: React.FC = () => {
  const {
    ficha,
    isLoading,
    matriculasVigentes,
    turmasVigentes,
    turmaPadrao,
    alterarObservacoes,
    alterarAvaliacoes,
    alterarProgressoes,
    voltar,
  } = useFichaAluno()
  const usaAvaliacoes = useHasModulo('avaliacoes')
  const usaProgressao = useHasModulo('progressao')
  const mostraAbaAvaliacoes = usaAvaliacoes || usaProgressao

  const turmasAvaliacao = useMemo<OpcaoAvaliacao[]>(() => {
    const opcoes: OpcaoAvaliacao[] = turmasVigentes.map((t) => ({ id: t.id, label: apelidoTurma(t) }))
    if (matriculasVigentes.some((m) => m.tipo === 'curso')) opcoes.push({ id: null, label: 'Aulas individuais' })
    return opcoes
  }, [turmasVigentes, matriculasVigentes])

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
        <span className="text-sm">Carregando ficha...</span>
      </div>
    )
  }

  if (!ficha) {
    return (
      <div className="space-y-4">
        {botaoVoltar}
        <p className="text-sm text-zinc-500">Aluno não encontrado ou sem acesso.</p>
      </div>
    )
  }

  const pendentes = ficha.progressoes.filter((s) => s.status === 'pendente').length

  return (
    <div className="space-y-5 pb-6">
      {botaoVoltar}
      <CabecalhoAluno aluno={ficha.aluno} />

      <Tabs defaultValue="geral" className="w-full">
        <TabsList
          className={`w-full sm:w-auto grid ${mostraAbaAvaliacoes ? 'grid-cols-3' : 'grid-cols-2'} sm:inline-flex h-auto p-1 rounded-2xl bg-zinc-100`}
        >
          <TabsTrigger value="geral" className={ABA}>
            <LayoutList className="w-4 h-4" />
            <span className="hidden sm:inline">Visão geral</span>
            <span className="sm:hidden">Geral</span>
          </TabsTrigger>
          <TabsTrigger value="observacoes" className={ABA}>
            <NotebookPen className="w-4 h-4" />
            <span className="hidden sm:inline">Observações</span>
            <span className="sm:hidden">Notas</span>
            <Contador total={ficha.observacoes.length} />
          </TabsTrigger>
          {mostraAbaAvaliacoes && (
            <TabsTrigger value="avaliacoes" className={ABA}>
              <ClipboardCheck className="w-4 h-4" />
              {usaAvaliacoes ? 'Avaliações' : 'Progressão'}
              {usaAvaliacoes && <Contador total={ficha.avaliacoes.length} />}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="geral" className="mt-4 space-y-5">
          <section className="space-y-2">
            <h2 className={TITULO_SECAO}>Frequência nas suas aulas</h2>
            <FrequenciaResumo frequencia={ficha.frequencia} matriculas={ficha.matriculas} />
          </section>
          <section className="space-y-2">
            <h2 className={TITULO_SECAO}>Matrículas nas suas turmas</h2>
            <MatriculasLista matriculas={ficha.matriculas} />
          </section>
        </TabsContent>

        <TabsContent value="observacoes" className="mt-4">
          <ObservacoesSecao
            idAluno={ficha.aluno.id}
            observacoes={ficha.observacoes}
            turmas={turmasVigentes}
            turmaPadrao={turmaPadrao}
            alterarObservacoes={alterarObservacoes}
          />
        </TabsContent>

        {mostraAbaAvaliacoes && (
        <TabsContent value="avaliacoes" className="mt-4 space-y-6">
          {usaAvaliacoes && (
          <section className="space-y-2">
            <h2 className={TITULO_SECAO}>Avaliações</h2>
            <AvaliacoesLista
              avaliacoes={ficha.avaliacoes}
              alterarAvaliacoes={alterarAvaliacoes}
              contexto={{ idAluno: ficha.aluno.id, idTurma: turmaPadrao ?? turmasAvaliacao[0]?.id ?? null }}
              exibir="turma"
              turmas={turmasAvaliacao}
              podeRegistrar={matriculasVigentes.length > 0}
            />
          </section>
          )}
          {usaProgressao && (
          <section className="space-y-2">
            <h2 className={`${TITULO_SECAO} flex items-center gap-2`}>
              Progressão de nível
              {pendentes > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] normal-case tracking-normal">
                  {pendentes} pendente{pendentes > 1 ? 's' : ''}
                </span>
              )}
            </h2>
            <ProgressaoSecao
              progressoes={ficha.progressoes}
              matriculasVigentes={matriculasVigentes}
              alterarProgressoes={alterarProgressoes}
            />
          </section>
          )}
        </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
