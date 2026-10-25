import { useState } from 'react'
import { toast } from 'sonner'
import { createObservacao, deleteObservacao, updateObservacao } from '../../../api/alunos'
import type { ObservacaoAluno, ObservacaoPayload } from '../../../types'
import { getErrorMessage } from '@/shared/lib/utils'

export const useObservacoes = (
  idAluno: number | undefined,
  alterarObservacoes: (alterar: (lista: ObservacaoAluno[]) => ObservacaoAluno[]) => void
) => {
  const [formAberto, setFormAberto] = useState(false)
  const [emEdicao, setEmEdicao] = useState<ObservacaoAluno | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [paraExcluir, setParaExcluir] = useState<ObservacaoAluno | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const nova = () => {
    setEmEdicao(null)
    setFormAberto(true)
  }

  const editar = (observacao: ObservacaoAluno) => {
    setEmEdicao(observacao)
    setFormAberto(true)
  }

  const fecharForm = () => {
    if (!isSaving) setFormAberto(false)
  }

  const salvar = async (payload: ObservacaoPayload) => {
    if (!idAluno) return
    setIsSaving(true)

    try {
      if (emEdicao) {
        const atualizada = await updateObservacao(emEdicao.id, {
          tipo: payload.tipo,
          texto: payload.texto,
          visivel_responsavel: payload.visivel_responsavel,
        })
        alterarObservacoes((lista) => lista.map((o) => (o.id === atualizada.id ? atualizada : o)))
        toast.success('Observação atualizada.')
      } else {
        const criada = await createObservacao(idAluno, payload)
        alterarObservacoes((lista) => [criada, ...lista])
        toast.success('Observação registrada.')
      }
      setFormAberto(false)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível salvar a observação.'))
    } finally {
      setIsSaving(false)
    }
  }

  const confirmarExclusao = async () => {
    if (!paraExcluir) return
    setIsDeleting(true)

    try {
      await deleteObservacao(paraExcluir.id)
      alterarObservacoes((lista) => lista.filter((o) => o.id !== paraExcluir.id))
      toast.success('Observação excluída.')
      setParaExcluir(null)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível excluir a observação.'))
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    formAberto,
    emEdicao,
    isSaving,
    nova,
    editar,
    fecharForm,
    salvar,
    paraExcluir,
    isDeleting,
    pedirExclusao: setParaExcluir,
    cancelarExclusao: () => {
      if (!isDeleting) setParaExcluir(null)
    },
    confirmarExclusao,
  }
}
