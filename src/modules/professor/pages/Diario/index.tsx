import React from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { ConteudosLista } from './components/ConteudosLista'
import { DiarioGrade } from './components/DiarioGrade'
import { useDiario } from './hooks/useDiario'

export const DiarioPage: React.FC = () => {
  const { turmaId, diario, mes, isLoading, frequencias, mudarMes } = useDiario()

  const titulo = diario ? [diario.curso, diario.nivel].filter((v) => v && v !== 'N/A').join(' · ') : ''

  return (
    <div className="space-y-5 pb-6">
      <div className="space-y-3">
        <Link
          to={`/professor/turmas/${turmaId}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-indigo-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a turma
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Diário de classe <span className="text-indigo-600">{titulo}</span>
          </h1>
          {diario?.descricao && <p className="text-zinc-500 mt-1 text-[14px]">{diario.descricao}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 p-1.5 rounded-full bg-white border border-zinc-100 shadow-sm w-full sm:w-80">
        <Button type="button" variant="ghost" size="icon" onClick={() => mudarMes(-1)} className="rounded-full hover:cursor-pointer" aria-label="Mês anterior">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-bold text-zinc-800 capitalize">{format(mes, 'MMMM yyyy', { locale: ptBR })}</span>
        <Button type="button" variant="ghost" size="icon" onClick={() => mudarMes(1)} className="rounded-full hover:cursor-pointer" aria-label="Próximo mês">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-zinc-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Carregando diário...</span>
        </div>
      ) : !diario ? (
        <p className="text-sm text-zinc-500">Diário indisponível.</p>
      ) : diario.aulas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-zinc-100 rounded-full text-zinc-400 mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">Nenhuma aula concluída</h3>
          <p className="text-zinc-500 max-w-xs mx-auto mt-1 text-sm">
            As aulas aparecem aqui depois que a chamada é concluída.
          </p>
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-[13px] font-black text-zinc-500 uppercase tracking-wider">
              Frequência · {diario.aulas.length} {diario.aulas.length === 1 ? 'aula' : 'aulas'}
            </h2>
            <DiarioGrade diario={diario} frequencias={frequencias} />
          </section>
          <section className="space-y-3">
            <h2 className="text-[13px] font-black text-zinc-500 uppercase tracking-wider">Conteúdos ministrados</h2>
            <ConteudosLista aulas={diario.aulas} />
          </section>
        </>
      )}
    </div>
  )
}
