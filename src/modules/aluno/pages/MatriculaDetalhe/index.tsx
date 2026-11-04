import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { rotuloData, rotuloHorario, rotuloPeriodo, rotuloStatus, tituloMatricula } from '../MinhasMatriculas/lib/rotulos'
import { useMatriculaDetalhe } from './hooks/useMatriculaDetalhe'

export const MatriculaDetalhePage: React.FC = () => {
  const { matricula, historico, isLoading, aguardandoDependente } = useMatriculaDetalhe()

  if (aguardandoDependente) {
    return <p className="text-sm text-zinc-600">Selecione um aluno para ver a matrícula dele.</p>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-zinc-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Carregando...</span>
      </div>
    )
  }

  if (!matricula) {
    return (
      <div className="space-y-4">
        <Voltar />
        <p className="text-sm text-zinc-600">Matrícula não encontrada.</p>
      </div>
    )
  }

  const linhas = [
    ['Curso', matricula.curso?.nome],
    ['Nível', matricula.nivel?.nome],
    ['Turma', matricula.turma?.nome ?? 'Aula individual'],
    ['Professor', matricula.professor?.nome],
    ['Horário', rotuloHorario(matricula.horarios)],
    ['Período', rotuloPeriodo(matricula.periodo)],
  ]

  return (
    <div className="space-y-4">
      <Voltar />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">{rotuloStatus(matricula.status)}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900">{tituloMatricula(matricula)}</h1>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4">
        <dl className="space-y-3">
          {linhas.map(([rotulo, valor]) => (
            <div key={rotulo}>
              <dt className="text-[11px] font-bold uppercase tracking-wide text-zinc-400">{rotulo}</dt>
              <dd className="text-sm text-zinc-800">{valor || '—'}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4">
        <h2 className="text-[11px] font-bold uppercase tracking-wide text-indigo-600">Histórico</h2>
        {historico.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">Nenhuma movimentação registrada.</p>
        ) : (
          <ol className="mt-3 space-y-4">
            {historico.map((item) => (
              <li key={item.id}>
                <p className="text-sm font-semibold text-zinc-900">{item.motivo || 'Transferência'}</p>
                <p className="mt-0.5 text-sm text-zinc-600">
                  {item.turma_origem ? `${item.turma_origem.nome} → ` : ''}
                  {item.turma_destino?.nome}
                </p>
                <p className="mt-0.5 text-xs text-zinc-400">{rotuloData(item.data_transferencia)}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}

function Voltar() {
  return (
    <Link to="/aluno/matriculas" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">
      <ChevronLeft className="h-4 w-4" />
      Matrículas
    </Link>
  )
}
