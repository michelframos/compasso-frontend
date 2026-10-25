import React from 'react'
import { Loader2, Mic2 } from 'lucide-react'
import { NoData } from '@/shared/components/NoData'
import type { SituacaoApresentacao } from '../../types'
import { AgendaEnsaios } from './components/AgendaEnsaios'
import { ApresentacaoCard } from './components/ApresentacaoCard'
import { useMinhasApresentacoes } from './hooks/useMinhasApresentacoes'

const SITUACOES: { valor: SituacaoApresentacao; label: string }[] = [
  { valor: 'proximas', label: 'Próximas' },
  { valor: 'passadas', label: 'Passadas' },
  { valor: 'todas', label: 'Todas' },
]

const VAZIO: Record<SituacaoApresentacao, string> = {
  proximas: 'Nenhum espetáculo futuro envolve suas turmas ou seus alunos.',
  passadas: 'Nenhuma apresentação passada com suas turmas ou seus alunos.',
  todas: 'Suas turmas e seus alunos ainda não participam de espetáculos.',
}

export const MinhasApresentacoesPage: React.FC = () => {
  const { apresentacoes, situacao, setSituacao, isLoading, ensaios, isLoadingEnsaios } = useMinhasApresentacoes()

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Minhas <span className="text-indigo-600">apresentações</span>
        </h1>
        <p className="text-zinc-500 mt-1 text-[14px]">Apresentações das suas turmas ou com seus alunos, e a agenda de ensaios.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="inline-flex p-1 rounded-full bg-zinc-100 w-full sm:w-auto">
            {SITUACOES.map(({ valor, label }) => (
              <button
                key={valor}
                type="button"
                onClick={() => setSituacao(valor)}
                className={`flex-1 sm:flex-none px-4 h-8 rounded-full text-xs font-bold transition-all hover:cursor-pointer ${
                  situacao === valor ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-zinc-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Carregando apresentações...</span>
            </div>
          ) : apresentacoes.length === 0 ? (
            <NoData
              title="Nenhuma apresentação"
              description={VAZIO[situacao]}
              icon={<Mic2 className="w-8 h-8" />}
              showAddButton={false}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {apresentacoes.map((apresentacao) => (
                <ApresentacaoCard key={apresentacao.id} apresentacao={apresentacao} />
              ))}
            </div>
          )}
        </div>

        <AgendaEnsaios ensaios={ensaios} isLoading={isLoadingEnsaios} />
      </div>
    </div>
  )
}
