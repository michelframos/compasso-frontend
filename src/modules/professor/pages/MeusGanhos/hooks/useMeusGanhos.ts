import { useEffect, useState } from 'react'
import { addMonths, format, isSameMonth, startOfMonth } from 'date-fns'
import { toast } from 'sonner'
import { getMeuExtrato } from '../../../api/ganhos'
import type { ExtratoProfessor } from '../../../types'
import { getErrorMessage } from '@/shared/lib/utils'

export const useMeusGanhos = () => {
  const [mes, setMes] = useState(() => startOfMonth(new Date()))
  const [extrato, setExtrato] = useState<ExtratoProfessor | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    getMeuExtrato(format(mes, 'yyyy-MM'))
      .then((dados) => {
        if (!cancelled) setExtrato(dados)
      })
      .catch((err) => {
        if (!cancelled) {
          setExtrato(null)
          toast.error(getErrorMessage(err, 'Não foi possível carregar seus ganhos.'))
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [mes])

  const mudarMes = (delta: number) => {
    setIsLoading(true)
    setMes((atual) => addMonths(atual, delta))
  }

  return { mes, extrato, isLoading, podeAvancar: !isSameMonth(mes, new Date()), mudarMes }
}
