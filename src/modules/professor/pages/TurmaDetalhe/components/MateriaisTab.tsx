import React from 'react'
import { FolderOpen, Loader2, Plus } from 'lucide-react'
import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog'
import { useMateriaisDaTurma } from '../hooks/useMateriaisDaTurma'
import { MaterialFormDialog } from './MaterialFormDialog'
import { MaterialItem } from './MaterialItem'

export const MateriaisTab: React.FC<{ turmaId: number }> = ({ turmaId }) => {
  const {
    materiais,
    isLoading,
    formAberto,
    emEdicao,
    isSaving,
    novo,
    editar,
    fecharForm,
    salvar,
    paraExcluir,
    isDeleting,
    pedirExclusao,
    cancelarExclusao,
    confirmarExclusao,
  } = useMateriaisDaTurma(turmaId)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm text-zinc-500 font-medium">Carregando materiais...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          {materiais.length === 0 ? 'Nenhum material ainda.' : `${materiais.length} ${materiais.length === 1 ? 'material' : 'materiais'}`}
        </p>
        <button
          type="button"
          onClick={novo}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors hover:cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Novo material
        </button>
      </div>

      {materiais.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-zinc-100 rounded-full text-zinc-400 mb-4">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">Nenhum material</h3>
          <p className="text-zinc-500 max-w-xs mx-auto mt-1 text-sm">
            Publique apostilas, partituras, áudios ou links para os alunos desta turma.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {materiais.map((material) => (
            <MaterialItem key={material.id} material={material} onEditar={editar} onExcluir={pedirExclusao} />
          ))}
        </div>
      )}

      <MaterialFormDialog
        aberto={formAberto}
        material={emEdicao}
        isSaving={isSaving}
        onFechar={fecharForm}
        onSalvar={salvar}
      />

      <ConfirmDeleteDialog
        open={paraExcluir !== null}
        onOpenChange={(open) => !open && cancelarExclusao()}
        description={
          <>
            O material <strong className="text-zinc-700">{paraExcluir?.titulo}</strong> será removido da turma
            {paraExcluir?.tipo === 'arquivo' ? ' e o arquivo será apagado' : ''}. Esta ação não pode ser desfeita.
          </>
        }
        isLoading={isDeleting}
        onConfirm={confirmarExclusao}
      />
    </div>
  )
}
