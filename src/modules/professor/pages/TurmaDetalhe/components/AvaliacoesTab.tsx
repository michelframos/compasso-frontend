import React, { useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { AvaliacoesLista } from '../../../components/avaliacoes/AvaliacoesLista'
import type { OpcaoAvaliacao } from '../../../components/avaliacoes/AvaliacaoFormDialog'
import type { AlunoDaTurma } from '../../../types'
import { useAvaliacoesDaTurma } from '../hooks/useAvaliacoesDaTurma'

const MATRICULAS_ENCERRADAS = ['cancelada', 'transferida']

interface AvaliacoesTabProps {
  turmaId: number
  matriculas: AlunoDaTurma[]
}

export const AvaliacoesTab: React.FC<AvaliacoesTabProps> = ({ turmaId, matriculas }) => {
  const { avaliacoes, isLoading, alterarAvaliacoes } = useAvaliacoesDaTurma(turmaId)

  const alunos = useMemo<OpcaoAvaliacao[]>(
    () =>
      matriculas
        .filter((m) => !MATRICULAS_ENCERRADAS.includes(m.status))
        .map((m) => ({ id: m.id_aluno, label: m.aluno?.usuario.nome ?? `Aluno #${m.id_aluno}` }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [matriculas]
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-zinc-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Carregando avaliações...</span>
      </div>
    )
  }

  return (
    <AvaliacoesLista
      avaliacoes={avaliacoes}
      alterarAvaliacoes={alterarAvaliacoes}
      contexto={{ idAluno: alunos.length === 1 ? alunos[0].id : null, idTurma: turmaId }}
      exibir="aluno"
      alunos={alunos}
      podeRegistrar={alunos.length > 0}
    />
  )
}
