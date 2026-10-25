import { useEffect, useState } from 'react'
import { addMonths, endOfMonth, format, startOfMonth } from 'date-fns'
import { toast } from 'sonner'
import { getFrequencia } from '../../../api/relatorios'
import { listMinhasTurmas } from '../../../api/turmas'
import type { RelatorioFrequencia, TurmaDoProfessor } from '../../../types'
import { getErrorMessage } from '@/shared/lib/utils'

export const LIMITE_FALTAS_PADRAO = 3

export const useFrequencia = () => {
  const [mes, setMes] = useState(() => startOfMonth(new Date()))
  const [idTurma, setIdTurma] = useState<number | null>(null)
  const [limiteFaltas, setLimiteFaltas] = useState(LIMITE_FALTAS_PADRAO)
  const [relatorio, setRelatorio] = useState<RelatorioFrequencia | null>(null)
  const [turmas, setTurmas] = useState<TurmaDoProfessor[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    listMinhasTurmas({ situacao: 'todas' })
      .then(setTurmas)
      .catch(() => setTurmas([]))
  }, [])

  useEffect(() => {
    let cancelled = false

    getFrequencia({
      data_inicio: format(mes, 'yyyy-MM-dd'),
      data_fim: format(endOfMonth(mes), 'yyyy-MM-dd'),
      id_turma: idTurma ?? undefined,
      limite_faltas: limiteFaltas,
    })
      .then((dados) => {
        if (!cancelled) setRelatorio(dados)
      })
      .catch((err) => {
        if (!cancelled) toast.error(getErrorMessage(err, 'Não foi possível carregar a frequência.'))
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [mes, idTurma, limiteFaltas])

  const mudarMes = (delta: number) => {
    setIsLoading(true)
    setMes((atual) => addMonths(atual, delta))
  }

  const filtrarTurma = (valor: number | null) => {
    setIsLoading(true)
    setIdTurma(valor)
  }

  const alterarLimite = (valor: number) => {
    setIsLoading(true)
    setLimiteFaltas(valor)
  }

  const alunosEmRisco = relatorio?.data.filter((aluno) => aluno.em_risco) ?? []

  return {
    mes,
    idTurma,
    limiteFaltas,
    relatorio,
    turmas,
    alunosEmRisco,
    isLoading,
    mudarMes,
    filtrarTurma,
    alterarLimite,
  }
}
