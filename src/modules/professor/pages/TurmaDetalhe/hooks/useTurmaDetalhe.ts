import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import type { TurmaComAlunos } from '@/modules/academico'
import { getMinhaTurma } from '../../../api/turmas'
import type { TurmaDoProfessor } from '../../../types'
import { getErrorMessage } from '@/shared/lib/utils'

export const useTurmaDetalhe = () => {
  const { id } = useParams<{ id: string }>()
  const [turma, setTurma] = useState<TurmaDoProfessor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [naoEncontrada, setNaoEncontrada] = useState(false)

  const carregar = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    try {
      setTurma(await getMinhaTurma(id))
      setNaoEncontrada(false)
    } catch (err) {
      setNaoEncontrada(true)
      toast.error(getErrorMessage(err, 'Não foi possível carregar a turma.'))
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    carregar()
  }, [carregar])

  const turmaAlunos = useMemo<TurmaComAlunos | null>(
    () =>
      turma && {
        id: turma.id,
        maximo_alunos: turma.maximo_alunos,
        matriculas: turma.matriculas?.map((m) => ({
          id: m.id,
          id_aluno: m.id_aluno,
          id_turma: m.id_turma,
          status: m.status,
          aluno: m.aluno ?? undefined,
        })),
      },
    [turma]
  )

  return { turma, turmaAlunos, isLoading, naoEncontrada, recarregar: carregar }
}
