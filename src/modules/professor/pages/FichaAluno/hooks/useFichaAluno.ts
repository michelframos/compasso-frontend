import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { getFichaAluno } from '../../../api/alunos'
import type { AvaliacaoAluno, FichaAluno, ObservacaoAluno, SugestaoProgressao } from '../../../types'
import { getErrorMessage } from '@/shared/lib/utils'

const MATRICULAS_ENCERRADAS = ['cancelada', 'transferida']

export const useFichaAluno = () => {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [ficha, setFicha] = useState<FichaAluno | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    getFichaAluno(id)
      .then((dados) => {
        if (!cancelled) setFicha(dados)
      })
      .catch((err) => {
        if (!cancelled) toast.error(getErrorMessage(err, 'Não foi possível carregar a ficha do aluno.'))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  const alterarObservacoes = useCallback(
    (alterar: (lista: ObservacaoAluno[]) => ObservacaoAluno[]) =>
      setFicha((atual) => (atual ? { ...atual, observacoes: alterar(atual.observacoes) } : atual)),
    []
  )

  const alterarAvaliacoes = useCallback(
    (alterar: (lista: AvaliacaoAluno[]) => AvaliacaoAluno[]) =>
      setFicha((atual) => (atual ? { ...atual, avaliacoes: alterar(atual.avaliacoes) } : atual)),
    []
  )

  const alterarProgressoes = useCallback(
    (alterar: (lista: SugestaoProgressao[]) => SugestaoProgressao[]) =>
      setFicha((atual) => (atual ? { ...atual, progressoes: alterar(atual.progressoes) } : atual)),
    []
  )

  const matriculasVigentes = useMemo(
    () => (ficha?.matriculas ?? []).filter((m) => !MATRICULAS_ENCERRADAS.includes(m.status ?? '')),
    [ficha]
  )

  const turmasVigentes = useMemo(
    () => matriculasVigentes.filter((m) => m.turma).map((m) => m.turma!),
    [matriculasVigentes]
  )

  const turmaOrigem = Number(searchParams.get('turma')) || null
  const turmaPadrao =
    turmasVigentes.find((t) => t.id === turmaOrigem)?.id ?? (turmasVigentes.length === 1 ? turmasVigentes[0].id : null)

  const voltar = () => {
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1)
    else navigate('/professor/alunos')
  }

  return {
    ficha,
    isLoading,
    matriculasVigentes,
    turmasVigentes,
    turmaPadrao,
    alterarObservacoes,
    alterarAvaliacoes,
    alterarProgressoes,
    voltar,
  }
}
