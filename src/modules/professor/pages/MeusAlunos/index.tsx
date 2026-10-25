import React from 'react'
import { Loader2, Users } from 'lucide-react'
import { PageHeader } from '@/shared/components/PageHeader'
import { NoData } from '@/shared/components/NoData'
import { AlunoCard } from './components/AlunoCard'
import { type FiltroTipo, useMeusAlunos } from './hooks/useMeusAlunos'

const FILTROS: { valor: FiltroTipo; label: string }[] = [
  { valor: 'todos', label: 'Todos' },
  { valor: 'turma', label: 'Em turmas' },
  { valor: 'curso', label: 'Aulas individuais' },
]

export const MeusAlunosPage: React.FC = () => {
  const { alunos, tipo, setTipo, search, setSearch, isLoading } = useMeusAlunos()

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        firstChunkText="Meus"
        secondChunkText="alunos"
        description="Alunos das suas turmas e das suas aulas individuais."
        onClick={() => undefined}
        showAddButton={false}
        search={setSearch}
        searchTerm={search}
        searchPlaceholder="Buscar por nome ou e-mail..."
      />

      <div className="inline-flex p-1 rounded-full bg-zinc-100 w-full sm:w-auto">
        {FILTROS.map(({ valor, label }) => (
          <button
            key={valor}
            type="button"
            onClick={() => setTipo(valor)}
            className={`flex-1 sm:flex-none px-4 h-8 rounded-full text-xs font-bold transition-all hover:cursor-pointer ${
              tipo === valor ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-zinc-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Carregando alunos...</span>
        </div>
      ) : alunos.length === 0 ? (
        <NoData
          title="Nenhum aluno encontrado"
          description={search ? 'Tente outro termo de busca.' : 'Você ainda não possui alunos com matrícula vigente.'}
          icon={<Users className="w-8 h-8" />}
          showAddButton={false}
        />
      ) : (
        <div className="space-y-3">
          {alunos.map((aluno) => (
            <AlunoCard key={aluno.id} aluno={aluno} />
          ))}
        </div>
      )}
    </div>
  )
}
