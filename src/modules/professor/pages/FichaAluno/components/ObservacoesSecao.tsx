import React, { useState } from 'react'
import { NotebookPen, Plus } from 'lucide-react'
import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog'
import { OBSERVACAO_TIPOS } from '../../../constants'
import type { FichaAluno, ObservacaoAluno, TipoObservacao } from '../../../types'
import { useObservacoes } from '../hooks/useObservacoes'
import { ObservacaoFormDialog } from './ObservacaoFormDialog'
import { ObservacaoItem } from './ObservacaoItem'

interface ObservacoesSecaoProps {
  idAluno: number
  observacoes: ObservacaoAluno[]
  turmas: NonNullable<FichaAluno['matriculas'][number]['turma']>[]
  turmaPadrao: number | null
  alterarObservacoes: (alterar: (lista: ObservacaoAluno[]) => ObservacaoAluno[]) => void
}

export const ObservacoesSecao: React.FC<ObservacoesSecaoProps> = ({
  idAluno,
  observacoes,
  turmas,
  turmaPadrao,
  alterarObservacoes,
}) => {
  const [filtro, setFiltro] = useState<TipoObservacao | null>(null)
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
  } = useObservacoes(idAluno, alterarObservacoes)

  const visiveis = filtro ? observacoes.filter((o) => o.tipo === filtro) : observacoes

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          {observacoes.length === 0
            ? 'Nenhuma observação ainda.'
            : `${observacoes.length} ${observacoes.length === 1 ? 'observação' : 'observações'}`}
        </p>
        <button
          type="button"
          onClick={nova}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors hover:cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nova observação
        </button>
      </div>

      {observacoes.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          {([null, ...Object.keys(OBSERVACAO_TIPOS)] as (TipoObservacao | null)[]).map((tipo) => (
            <button
              key={tipo ?? 'todas'}
              type="button"
              onClick={() => setFiltro(tipo)}
              className={`shrink-0 px-3 h-8 rounded-full text-xs font-bold border transition-colors hover:cursor-pointer ${
                filtro === tipo ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'
              }`}
            >
              {tipo ? OBSERVACAO_TIPOS[tipo].label : 'Todas'}
            </button>
          ))}
        </div>
      )}

      {observacoes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="p-4 bg-zinc-100 rounded-full text-zinc-400 mb-4">
            <NotebookPen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">Sem observações</h3>
          <p className="text-zinc-500 max-w-xs mx-auto mt-1 text-sm">
            Registre a evolução, o comportamento ou pontos de atenção deste aluno.
          </p>
        </div>
      ) : visiveis.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-6">Nenhuma observação deste tipo.</p>
      ) : (
        <div className="space-y-2">
          {visiveis.map((observacao) => (
            <ObservacaoItem key={observacao.id} observacao={observacao} onEditar={editar} onExcluir={pedirExclusao} />
          ))}
        </div>
      )}

      <ObservacaoFormDialog
        aberto={formAberto}
        observacao={emEdicao}
        turmas={turmas}
        turmaPadrao={turmaPadrao}
        isSaving={isSaving}
        onFechar={fecharForm}
        onSalvar={salvar}
      />

      <ConfirmDeleteDialog
        open={paraExcluir !== null}
        onOpenChange={(open) => !open && cancelarExclusao()}
        description="A observação será removida da ficha do aluno. Esta ação não pode ser desfeita."
        isLoading={isDeleting}
        onConfirm={confirmarExclusao}
      />
    </div>
  )
}
