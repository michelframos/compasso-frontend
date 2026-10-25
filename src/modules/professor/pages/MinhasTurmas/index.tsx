import React from 'react'
import { GraduationCap, Loader2 } from 'lucide-react'
import { PageHeader } from '@/shared/components/PageHeader'
import { NoData } from '@/shared/components/NoData'
import type { SituacaoTurma } from '../../types'
import { TurmaCard } from './components/TurmaCard'
import { useMinhasTurmas } from './hooks/useMinhasTurmas'

const SITUACOES: { valor: SituacaoTurma; label: string }[] = [
  { valor: 'ativas', label: 'Ativas' },
  { valor: 'encerradas', label: 'Encerradas' },
  { valor: 'todas', label: 'Todas' },
]

export const MinhasTurmasPage: React.FC = () => {
  const { turmas, situacao, setSituacao, search, setSearch, isLoading } = useMinhasTurmas()

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        firstChunkText="Minhas"
        secondChunkText="turmas"
        description="Turmas que você leciona, com horários e alunos."
        onClick={() => undefined}
        showAddButton={false}
        search={setSearch}
        searchTerm={search}
        searchPlaceholder="Buscar por curso, nível ou descrição..."
      />

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
          <span className="text-sm">Carregando turmas...</span>
        </div>
      ) : turmas.length === 0 ? (
        <NoData
          title="Nenhuma turma encontrada"
          description={search ? 'Tente outro termo de busca.' : 'Você não possui turmas nesta situação.'}
          icon={<GraduationCap className="w-8 h-8" />}
          showAddButton={false}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {turmas.map((turma) => (
            <TurmaCard key={turma.id} turma={turma} />
          ))}
        </div>
      )}
    </div>
  )
}
