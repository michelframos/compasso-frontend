import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { createEnsaio, deleteEnsaio, getMinhaApresentacao, updateEnsaio } from '../../../api/apresentacoes'
import type { ApresentacaoDoProfessor, EnsaioAgendado, EnsaioPayload } from '../../../types'
import { getErrorMessage } from '@/shared/lib/utils'

const ordenar = (ensaios: EnsaioAgendado[]) =>
  [...ensaios].sort((a, b) => a.data.localeCompare(b.data) || a.hora_inicio.localeCompare(b.hora_inicio))

export const useApresentacaoDetalhe = () => {
  const { id } = useParams<{ id: string }>()
  const [apresentacao, setApresentacao] = useState<ApresentacaoDoProfessor | null>(null)
  const [ensaios, setEnsaios] = useState<EnsaioAgendado[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [naoEncontrada, setNaoEncontrada] = useState(false)
  const [formAberto, setFormAberto] = useState(false)
  const [emEdicao, setEmEdicao] = useState<EnsaioAgendado | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [paraExcluir, setParaExcluir] = useState<EnsaioAgendado | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    getMinhaApresentacao(id)
      .then((data) => {
        if (cancelled) return
        setApresentacao(data)
        setEnsaios(ordenar(data.ensaios ?? []))
      })
      .catch((err) => {
        if (cancelled) return
        setNaoEncontrada(true)
        toast.error(getErrorMessage(err, 'Não foi possível carregar a apresentação.'))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  const hoje = format(new Date(), 'yyyy-MM-dd')
  const espetaculo = apresentacao?.espetaculo
  const espetaculoAberto =
    !!espetaculo && !['concluido', 'cancelado'].includes(espetaculo.status) && espetaculo.data_evento >= hoje
  const podeAgendar = !!apresentacao?.pode_agendar_ensaio && espetaculoAberto

  const novo = () => {
    setEmEdicao(null)
    setFormAberto(true)
  }

  const editar = (ensaio: EnsaioAgendado) => {
    setEmEdicao(ensaio)
    setFormAberto(true)
  }

  const fecharForm = () => {
    if (!isSaving) setFormAberto(false)
  }

  const salvar = async (payload: EnsaioPayload) => {
    if (!apresentacao) return
    setIsSaving(true)

    try {
      if (emEdicao) {
        const atualizado = await updateEnsaio(emEdicao.id, payload)
        setEnsaios((lista) => ordenar(lista.map((e) => (e.id === atualizado.id ? atualizado : e))))
        toast.success('Ensaio atualizado.')
      } else {
        const criado = await createEnsaio(apresentacao.id, payload)
        setEnsaios((lista) => ordenar([...lista, criado]))
        toast.success('Ensaio agendado.')
      }
      setFormAberto(false)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível salvar o ensaio.'))
    } finally {
      setIsSaving(false)
    }
  }

  const confirmarExclusao = async () => {
    if (!paraExcluir) return
    setIsDeleting(true)

    try {
      await deleteEnsaio(paraExcluir.id)
      setEnsaios((lista) => lista.filter((e) => e.id !== paraExcluir.id))
      toast.success('Ensaio excluído.')
      setParaExcluir(null)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível excluir o ensaio.'))
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    apresentacao,
    ensaios,
    hoje,
    isLoading,
    naoEncontrada,
    podeAgendar,
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
