import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertTriangle, ChevronLeft, ChevronRight, ClipboardCheck, Loader2, Percent, Users } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { NoData } from '@/shared/components/NoData'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { ContadorCard } from '../../components/ContadorCard'
import { apelidoTurma } from '../../lib/formatters'
import { AlertaAlunosEmRisco } from './components/AlertaAlunosEmRisco'
import { AlunoFrequenciaItem } from './components/AlunoFrequenciaItem'
import { useFrequencia } from './hooks/useFrequencia'

const LIMITES = [2, 3, 4, 5]

export const FrequenciaPage: React.FC = () => {
  const { mes, idTurma, limiteFaltas, relatorio, turmas, alunosEmRisco, isLoading, mudarMes, filtrarTurma, alterarLimite } =
    useFrequencia()

  const resumo = relatorio?.summary
  const presencaMedia = resumo && resumo.total_alunos > 0 ? `${Math.round(100 - resumo.media_absenteismo)}%` : '—'

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          <span className="text-indigo-600">Frequência</span> dos alunos
        </h1>
        <p className="text-zinc-500 mt-1 text-[14px]">Presença nas suas aulas e alerta de faltas seguidas.</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center justify-between gap-3 p-1.5 rounded-full bg-white border border-zinc-100 shadow-sm w-full sm:w-72">
          <Button type="button" variant="ghost" size="icon" onClick={() => mudarMes(-1)} className="rounded-full hover:cursor-pointer" aria-label="Mês anterior">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-bold text-zinc-800 capitalize">{format(mes, 'MMMM yyyy', { locale: ptBR })}</span>
          <Button type="button" variant="ghost" size="icon" onClick={() => mudarMes(1)} className="rounded-full hover:cursor-pointer" aria-label="Próximo mês">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <Select value={idTurma ? String(idTurma) : 'todas'} onValueChange={(valor) => filtrarTurma(valor === 'todas' ? null : Number(valor))}>
          <SelectTrigger className="h-11 w-full sm:w-60 rounded-full bg-white border-zinc-100 shadow-sm text-sm font-semibold">
            <SelectValue placeholder="Todas as turmas" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="todas">Todas as aulas</SelectItem>
            {turmas.map((turma) => (
              <SelectItem key={turma.id} value={String(turma.id)}>
                {apelidoTurma(turma)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(limiteFaltas)} onValueChange={(valor) => alterarLimite(Number(valor))}>
          <SelectTrigger className="h-11 w-full sm:w-64 rounded-full bg-white border-zinc-100 shadow-sm text-sm font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {LIMITES.map((limite) => (
              <SelectItem key={limite} value={String(limite)}>
                Alertar com {limite} faltas seguidas
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-zinc-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Carregando frequência...</span>
        </div>
      ) : !relatorio || relatorio.data.length === 0 ? (
        <NoData
          title="Nenhuma chamada no período"
          description="A frequência aparece aqui depois que você faz a chamada das aulas."
          icon={<ClipboardCheck className="w-8 h-8" />}
          showAddButton={false}
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <ContadorCard icon={Users} titulo="Alunos" valor={relatorio.summary.total_alunos} />
            <ContadorCard icon={Percent} titulo="Presença média" valor={presencaMedia} />
            <ContadorCard
              icon={AlertTriangle}
              titulo="Em risco"
              valor={relatorio.summary.alunos_em_risco}
              destaque={relatorio.summary.alunos_em_risco > 0}
            />
          </div>

          {alunosEmRisco.length > 0 && (
            <AlertaAlunosEmRisco alunos={alunosEmRisco} limiteFaltas={limiteFaltas} idTurma={idTurma} />
          )}

          <section className="space-y-3">
            <h2 className="text-[13px] font-black text-zinc-500 uppercase tracking-wider">Por aluno</h2>
            <div className="space-y-2">
              {relatorio.data.map((aluno) => (
                <AlunoFrequenciaItem key={aluno.id} aluno={aluno} idTurma={idTurma} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
