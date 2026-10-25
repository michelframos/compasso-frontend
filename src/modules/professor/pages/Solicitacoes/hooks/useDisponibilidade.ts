import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getMinhaDisponibilidade, salvarMinhaDisponibilidade } from '../../../api/solicitacoes'
import type { Disponibilidade } from '../../../types'
import { getErrorMessage } from '@/shared/lib/utils'

export interface JanelaEditavel extends Disponibilidade {
  chave: string
}

let sequencia = 0
const comChave = (janela: Disponibilidade): JanelaEditavel => ({ ...janela, chave: `j${++sequencia}` })

/** Mensagem do primeiro problema encontrado, ou null. */
const validar = (janelas: JanelaEditavel[]): string | null => {
  if (janelas.some((j) => !j.hora_inicio || !j.hora_termino)) return 'Preencha o início e o término de todos os horários.'
  if (janelas.some((j) => j.hora_termino <= j.hora_inicio)) return 'O término de cada horário deve ser depois do início.'

  const porDia = new Map<string, JanelaEditavel[]>()
  janelas.forEach((j) => porDia.set(j.dia_semana, [...(porDia.get(j.dia_semana) ?? []), j]))

  for (const lista of porDia.values()) {
    const ordenada = [...lista].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
    if (ordenada.some((j, i) => i > 0 && j.hora_inicio < ordenada[i - 1].hora_termino)) return 'Há horários sobrepostos no mesmo dia.'
  }

  return null
}

export const useDisponibilidade = () => {
  const [janelas, setJanelas] = useState<JanelaEditavel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [alterado, setAlterado] = useState(false)

  useEffect(() => {
    let cancelled = false

    getMinhaDisponibilidade()
      .then((lista) => {
        if (!cancelled) setJanelas(lista.map(comChave))
      })
      .catch((err) => {
        if (!cancelled) toast.error(getErrorMessage(err, 'Não foi possível carregar sua disponibilidade.'))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const editar = (mudar: (atual: JanelaEditavel[]) => JanelaEditavel[]) => {
    setJanelas(mudar)
    setAlterado(true)
  }

  const adicionar = (dia: string) =>
    editar((atual) => [...atual, comChave({ dia_semana: dia, hora_inicio: '08:00', hora_termino: '12:00' })])

  const alterar = (chave: string, campo: 'hora_inicio' | 'hora_termino', valor: string) =>
    editar((atual) => atual.map((j) => (j.chave === chave ? { ...j, [campo]: valor } : j)))

  const remover = (chave: string) => editar((atual) => atual.filter((j) => j.chave !== chave))

  const salvar = async () => {
    const problema = validar(janelas)
    if (problema) {
      toast.error(problema)
      return
    }

    setIsSaving(true)
    try {
      const salvas = await salvarMinhaDisponibilidade(
        janelas.map(({ dia_semana, hora_inicio, hora_termino }) => ({ dia_semana, hora_inicio, hora_termino }))
      )
      setJanelas(salvas.map(comChave))
      setAlterado(false)
      toast.success('Disponibilidade salva.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível salvar sua disponibilidade.'))
    } finally {
      setIsSaving(false)
    }
  }

  return { janelas, isLoading, isSaving, alterado, adicionar, alterar, remover, salvar }
}
