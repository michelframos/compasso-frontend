import React from 'react'
import { ClipboardCheck, Plus } from 'lucide-react'
import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog'
import type { AvaliacaoAluno } from '../../types'
import { AvaliacaoFormDialog, type OpcaoAvaliacao } from './AvaliacaoFormDialog'
import { AvaliacaoItem } from './AvaliacaoItem'
import type { AvaliacaoFormContexto } from './useAvaliacaoForm'
import { type AlterarAvaliacoes, useAvaliacoes } from './useAvaliacoes'

interface AvaliacoesListaProps {
  avaliacoes: AvaliacaoAluno[]
  alterarAvaliacoes: AlterarAvaliacoes
  contexto: AvaliacaoFormContexto
  exibir: 'aluno' | 'turma'
  alunos?: OpcaoAvaliacao[]
  turmas?: OpcaoAvaliacao[]
  /** Quando falso, o botão de nova avaliação some (ex.: turma sem alunos). */
  podeRegistrar?: boolean
}

export const AvaliacoesLista: React.FC<AvaliacoesListaProps> = ({
  avaliacoes,
  alterarAvaliacoes,
  contexto,
  exibir,
  alunos,
  turmas,
  podeRegistrar = true,
}) => {
  const {
    formAberto,
    emEdicao,
    isSaving,
    nova,
    editar,
    fecharForm,
    salvar,
    paraExcluir,
    isDeleting,
    pedirExclusao,
    cancelarExclusao,
    confirmarExclusao,
  } = useAvaliacoes(alterarAvaliacoes)

  const comNota = avaliacoes.filter((a) => a.nota !== null)
  const media = comNota.length > 0 ? comNota.reduce((soma, a) => soma + (a.nota ?? 0), 0) / comNota.length : null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          {avaliacoes.length === 0
            ? 'Nenhuma avaliação ainda.'
            : `${avaliacoes.length} ${avaliacoes.length === 1 ? 'avaliação' : 'avaliações'}`}
          {media !== null && (
            <>
              {' · '}média <span className="font-bold text-zinc-800">{media.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</span>
            </>
          )}
        </p>
        {podeRegistrar && (
          <button
            type="button"
            onClick={nova}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors hover:cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nova avaliação
          </button>
        )}
      </div>

      {avaliacoes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="p-4 bg-zinc-100 rounded-full text-zinc-400 mb-4">
            <ClipboardCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">Sem avaliações</h3>
          <p className="text-zinc-500 max-w-xs mx-auto mt-1 text-sm">
            Registre notas e conceitos de provas práticas, teóricas e apresentações.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {avaliacoes.map((avaliacao) => (
            <AvaliacaoItem key={avaliacao.id} avaliacao={avaliacao} exibir={exibir} onEditar={editar} onExcluir={pedirExclusao} />
          ))}
        </div>
      )}

      <AvaliacaoFormDialog
        aberto={formAberto}
        avaliacao={emEdicao}
        contexto={contexto}
        alunos={alunos}
        turmas={turmas}
        isSaving={isSaving}
        onFechar={fecharForm}
        onSalvar={salvar}
      />

      <ConfirmDeleteDialog
        open={paraExcluir !== null}
        onOpenChange={(open) => !open && cancelarExclusao()}
        description="A avaliação será removida. Esta ação não pode ser desfeita."
        isLoading={isDeleting}
        onConfirm={confirmarExclusao}
      />
    </div>
  )
}
