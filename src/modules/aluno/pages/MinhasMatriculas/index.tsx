import React from 'react'
import { GraduationCap, Loader2 } from 'lucide-react'
import { NoData } from '@/shared/components/NoData'
import { MatriculaCard } from './components/MatriculaCard'
import { useMinhasMatriculas } from './hooks/useMinhasMatriculas'

export const MinhasMatriculasPage: React.FC = () => {
  const { matriculas, encerradas, setEncerradas, isLoading, aguardandoDependente } = useMinhasMatriculas()

  if (aguardandoDependente) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h1 className="text-lg font-bold">Matrículas</h1>
        <p className="mt-2 text-sm text-zinc-600">Selecione um aluno para ver as matrículas dele.</p>
      </section>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Matrículas</h1>
        <p className="mt-1 text-sm text-zinc-500">Turmas, horários e o professor de cada curso.</p>
      </div>

      <div className="inline-flex w-full rounded-full bg-zinc-100 p-1">
        {[
          { valor: false, label: 'Ativas' },
          { valor: true, label: 'Encerradas' },
        ].map((opcao) => (
          <button
            key={opcao.label}
            type="button"
            onClick={() => setEncerradas(opcao.valor)}
            className={`h-8 flex-1 rounded-full text-xs font-bold ${
              encerradas === opcao.valor ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500'
            }`}
          >
            {opcao.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-zinc-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Carregando...</span>
        </div>
      ) : matriculas.length === 0 ? (
        <NoData
          title={encerradas ? 'Nenhuma matrícula encerrada' : 'Nenhuma matrícula ativa'}
          description={encerradas ? 'O histórico de turmas encerradas aparece aqui.' : 'Quando houver uma matrícula, ela aparece aqui.'}
          icon={<GraduationCap className="h-8 w-8" />}
          showAddButton={false}
        />
      ) : (
        <div className="space-y-3">
          {matriculas.map((matricula) => (
            <MatriculaCard key={matricula.id} matricula={matricula} />
          ))}
        </div>
      )}
    </div>
  )
}
