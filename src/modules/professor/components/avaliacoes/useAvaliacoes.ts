import { useState } from 'react'
import { toast } from 'sonner'
import { createAvaliacao, deleteAvaliacao, updateAvaliacao } from '../../api/avaliacoes'
import type { AvaliacaoAluno, AvaliacaoPayload } from '../../types'
import { getErrorMessage } from '@/shared/lib/utils'

export type AlterarAvaliacoes = (alterar: (lista: AvaliacaoAluno[]) => AvaliacaoAluno[]) => void

export const useAvaliacoes = (alterarAvaliacoes: AlterarAvaliacoes) => {
  const [formAberto, setFormAberto] = useState(false)
  const [emEdicao, setEmEdicao] = useState<AvaliacaoAluno | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [paraExcluir, setParaExcluir] = useState<AvaliacaoAluno | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const nova = () => {
    setEmEdicao(null)
    setFormAberto(true)
  }

  const editar = (avaliacao: AvaliacaoAluno) => {
    setEmEdicao(avaliacao)
    setFormAberto(true)
  }

  const fecharForm = () => {
    if (!isSaving) setFormAberto(false)
  }

  const salvar = async ({ id_aluno, id_turma, ...dados }: AvaliacaoPayload) => {
    setIsSaving(true)

    try {
      if (emEdicao) {
        const atualizada = await updateAvaliacao(emEdicao.id, dados)
        alterarAvaliacoes((lista) => lista.map((a) => (a.id === atualizada.id ? atualizada : a)))
        toast.success('Avaliação atualizada.')
      } else {
        if (!id_aluno) return
        const criada = await createAvaliacao({ ...dados, id_aluno, id_turma })
        alterarAvaliacoes((lista) =>
          [criada, ...lista].sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id)
        )
        toast.success('Avaliação registrada.')
      }
      setFormAberto(false)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível salvar a avaliação.'))
    } finally {
      setIsSaving(false)
    }
  }

  const confirmarExclusao = async () => {
    if (!paraExcluir) return
    setIsDeleting(true)

    try {
      await deleteAvaliacao(paraExcluir.id)
      alterarAvaliacoes((lista) => lista.filter((a) => a.id !== paraExcluir.id))
      toast.success('Avaliação excluída.')
      setParaExcluir(null)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível excluir a avaliação.'))
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
