import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { addMonths, endOfMonth, format, startOfMonth } from 'date-fns'
import { toast } from 'sonner'
import { getDiario } from '../../../api/turmas'
import type { DiarioTurma } from '../../../types'
import { getErrorMessage } from '@/shared/lib/utils'

export const useDiario = () => {
  const { id } = useParams<{ id: string }>()
  const [mes, setMes] = useState(() => startOfMonth(new Date()))
  const [diario, setDiario] = useState<DiarioTurma | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    getDiario(id, {
      data_inicio: format(mes, 'yyyy-MM-dd'),
      data_fim: format(endOfMonth(mes), 'yyyy-MM-dd'),
    })
      .then((dados) => {
        if (!cancelled) setDiario(dados)
      })
      .catch((err) => {
        if (!cancelled) toast.error(getErrorMessage(err, 'Não foi possível carregar o diário.'))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id, mes])

  const frequencias = useMemo(() => {
    const resultado: Record<number, number | null> = {}
    diario?.alunos.forEach((aluno) => {
      const lancadas = diario.aulas.map((a) => a.presencas[aluno.id_aluno]).filter(Boolean)
      resultado[aluno.id_aluno] = lancadas.length
        ? Math.round((lancadas.filter((s) => s === 'presente').length / lancadas.length) * 100)
        : null
    })
    return resultado
  }, [diario])

  const mudarMes = (delta: number) => {
    setIsLoading(true)
    setMes((atual) => addMonths(atual, delta))
  }

  return { turmaId: id, diario, mes, isLoading, frequencias, mudarMes }
}
