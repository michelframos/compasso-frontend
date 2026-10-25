import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { listMateriaisDaTurma } from '../../../api/turmas'
import { createMaterial, deleteMaterial, updateMaterial } from '../../../api/materiais'
import type { MaterialDaTurma, MaterialPayload } from '../../../types'
import { getErrorMessage } from '@/shared/lib/utils'

export const useMateriaisDaTurma = (turmaId: number) => {
  const [materiais, setMateriais] = useState<MaterialDaTurma[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formAberto, setFormAberto] = useState(false)
  const [emEdicao, setEmEdicao] = useState<MaterialDaTurma | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [paraExcluir, setParaExcluir] = useState<MaterialDaTurma | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false

    listMateriaisDaTurma(turmaId)
      .then((data) => {
        if (!cancelled) setMateriais(data)
      })
      .catch((err) => {
        if (!cancelled) toast.error(getErrorMessage(err, 'Não foi possível carregar os materiais.'))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [turmaId])

  const novo = () => {
    setEmEdicao(null)
    setFormAberto(true)
  }

  const editar = (material: MaterialDaTurma) => {
    setEmEdicao(material)
    setFormAberto(true)
  }

  const fecharForm = () => {
    if (!isSaving) setFormAberto(false)
  }

  const salvar = async (payload: MaterialPayload) => {
    setIsSaving(true)

    try {
      if (emEdicao) {
        const atualizado = await updateMaterial(emEdicao.id, payload)
        setMateriais((lista) => lista.map((m) => (m.id === atualizado.id ? atualizado : m)))
        toast.success('Material atualizado.')
      } else {
        const criado = await createMaterial(turmaId, payload)
        setMateriais((lista) => [criado, ...lista])
        toast.success('Material publicado.')
      }
      setFormAberto(false)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível salvar o material.'))
    } finally {
      setIsSaving(false)
    }
  }

  const confirmarExclusao = async () => {
    if (!paraExcluir) return

    setIsDeleting(true)

    try {
      await deleteMaterial(paraExcluir.id)
      setMateriais((lista) => lista.filter((m) => m.id !== paraExcluir.id))
      toast.success('Material excluído.')
      setParaExcluir(null)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível excluir o material.'))
    } finally {
      setIsDeleting(false)
    }
  }

  return {
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
    pedirExclusao: setParaExcluir,
    cancelarExclusao: () => {
      if (!isDeleting) setParaExcluir(null)
    },
    confirmarExclusao,
  }
}
