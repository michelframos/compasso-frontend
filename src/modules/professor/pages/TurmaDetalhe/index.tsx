import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, CalendarClock, ClipboardCheck, ClipboardList, FolderOpen, Loader2, Megaphone, Users } from 'lucide-react'
import { TurmaAgendamentos, TurmaAlunos } from '@/modules/academico'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { useHasModulo } from '@/shared/hooks/useHasModulo'
import { avisosProfessorApi } from '../../api/avisos'
import { NovoAvisoDialog } from '../../components/avisos/NovoAvisoDialog'
import { fontesDoProfessor } from '../../components/avisos/fontes'
import { TURMA_STATUS } from '../../constants'
import { nomeTurma } from '../../lib/formatters'
import { AvaliacoesTab } from './components/AvaliacoesTab'
import { HorariosTab } from './components/HorariosTab'
import { MateriaisTab } from './components/MateriaisTab'
import { useTurmaDetalhe } from './hooks/useTurmaDetalhe'

const ABAS = [
  { valor: 'alunos', label: 'Alunos', icon: Users },
  { valor: 'horarios', label: 'Horários', icon: CalendarClock },
  { valor: 'aulas', label: 'Aulas', icon: ClipboardList },
  { valor: 'avaliacoes', label: 'Avaliações', icon: ClipboardCheck, modulo: 'avaliacoes' },
  { valor: 'materiais', label: 'Materiais', icon: FolderOpen },
]

const COLUNAS: Record<number, string> = { 4: 'grid-cols-4', 5: 'grid-cols-5' }

export const TurmaDetalhePage: React.FC = () => {
  const { turma, turmaAlunos, isLoading, naoEncontrada } = useTurmaDetalhe()
  const navigate = useNavigate()
  const usaAvaliacoes = useHasModulo('avaliacoes')
  const abas = ABAS.filter((aba) => !aba.modulo || usaAvaliacoes)
  const [avisando, setAvisando] = useState(false)

  const voltar = (
    <Link
      to="/professor/turmas"
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-indigo-600"
    >
      <ArrowLeft className="w-4 h-4" />
      Minhas turmas
    </Link>
  )

  if (isLoading && !turma) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Carregando turma...</span>
      </div>
    )
  }

  if (naoEncontrada || !turma) {
    return (
      <div className="space-y-4">
        {voltar}
        <p className="text-sm text-zinc-500">Turma não encontrada ou sem acesso.</p>
      </div>
    )
  }

  const status = TURMA_STATUS[turma.status] ?? TURMA_STATUS.planejamento

  return (
    <div className="space-y-5 pb-6">
      <div className="space-y-3">
        {voltar}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 truncate">{nomeTurma(turma)}</h1>
            {turma.descricao && <p className="text-zinc-500 mt-1 text-[14px]">{turma.descricao}</p>}
          </div>
          <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${status.className}`}>
            {status.label}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/professor/turmas/${turma.id}/diario`}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600 hover:bg-indigo-100"
          >
            <BookOpen className="w-4 h-4" />
            Diário de classe
          </Link>
          <button
            type="button"
            onClick={() => setAvisando(true)}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-white border border-zinc-200 text-xs font-bold text-zinc-600 hover:border-indigo-200 hover:text-indigo-600 hover:cursor-pointer"
          >
            <Megaphone className="w-4 h-4" />
            Enviar aviso
          </button>
        </div>
      </div>

      <NovoAvisoDialog
        aberto={avisando}
        api={avisosProfessorApi}
        fontes={fontesDoProfessor}
        turmaInicial={turma.id}
        onFechar={() => setAvisando(false)}
      />

      <Tabs defaultValue="alunos" className="w-full">
        <TabsList className={`w-full sm:w-auto grid ${COLUNAS[abas.length]} sm:inline-flex h-auto p-1 rounded-2xl bg-zinc-100`}>
          {abas.map(({ valor, label, icon: Icon }) => (
            <TabsTrigger
              key={valor}
              value={valor}
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 py-2 sm:py-1.5 rounded-xl text-[11px] sm:text-sm font-bold hover:cursor-pointer"
            >
              <Icon className="w-4 h-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="alunos" className="mt-4">
          <TurmaAlunos
            turma={turmaAlunos}
            isLoading={isLoading}
            somenteLeitura
            onAbrirAluno={(idAluno) => navigate(`/professor/alunos/${idAluno}?turma=${turma.id}`)}
          />
        </TabsContent>
        <TabsContent value="horarios" className="mt-4">
          <HorariosTab turma={turma} />
        </TabsContent>
        <TabsContent value="aulas" className="mt-4">
          <TurmaAgendamentos
            turmaId={turma.id}
            somenteChamada
            onChamada={(aula) => navigate(`/professor/aulas/${aula.id}/chamada`)}
          />
        </TabsContent>
        {usaAvaliacoes && (
          <TabsContent value="avaliacoes" className="mt-4">
            <AvaliacoesTab turmaId={turma.id} matriculas={turma.matriculas ?? []} />
          </TabsContent>
        )}
        <TabsContent value="materiais" className="mt-4">
          <MateriaisTab turmaId={turma.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
