import { useState } from 'react'
import { toast } from 'sonner'
import { cancelarSugestaoProgressao, createSugestaoProgressao, listNiveis } from '../../../api/avaliacoes'
import type { NivelOpcao, SugestaoProgressao } from '../../../types'
import { getErrorMessage } from '@/shared/lib/utils'

export interface SugestaoPayload {
  id_matricula: number
  id_nivel_sugerido: number
  justificativa: string
}

export const useProgressoes = (alterarProgressoes: (alterar: (lista: SugestaoProgressao[]) => SugestaoProgressao[]) => void) => {
  const [formAberto, setFormAberto] = useState(false)
  const [niveis, setNiveis] = useState<NivelOpcao[] | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [paraCancelar, setParaCancelar] = useState<SugestaoProgressao | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  const abrirForm = () => {
    setFormAberto(true)
    if (niveis !== null) return

    listNiveis()
      .then(setNiveis)
      .catch((err) => {
        toast.error(getErrorMessage(err, 'Não foi possível carregar os níveis.'))
        setFormAberto(false)
      })
  }

  const fecharForm = () => {
    if (!isSaving) setFormAberto(false)
  }

  const sugerir = async (payload: SugestaoPayload) => {
    setIsSaving(true)

    try {
      const criada = await createSugestaoProgressao(payload)
      alterarProgressoes((lista) => [criada, ...lista])
      toast.success('Sugestão enviada para a secretaria.')
      setFormAberto(false)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível enviar a sugestão.'))
    } finally {
      setIsSaving(false)
    }
  }

  const confirmarCancelamento = async () => {
    if (!paraCancelar) return
    setIsCancelling(true)

    try {
      await cancelarSugestaoProgressao(paraCancelar.id)
      alterarProgressoes((lista) => lista.filter((s) => s.id !== paraCancelar.id))
      toast.success('Sugestão cancelada.')
      setParaCancelar(null)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível cancelar a sugestão.'))
    } finally {
      setIsCancelling(false)
    }
  }

  return {
    formAberto,
    niveis,
    isSaving,
    abrirForm,
    fecharForm,
    sugerir,
    paraCancelar,
    isCancelling,
    pedirCancelamento: setParaCancelar,
    desistirCancelamento: () => {
      if (!isCancelling) setParaCancelar(null)
    },
    confirmarCancelamento,
  }
}
