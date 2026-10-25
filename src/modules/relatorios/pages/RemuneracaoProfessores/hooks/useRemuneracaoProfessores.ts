import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/shared/lib/utils'
import { getRemuneracaoMes, type RemuneracaoMes } from '../../../api/remuneracao'
import { useMesDaUrl } from './useMesDaUrl'

export const useRemuneracaoProfessores = () => {
  const { mes, competencia, podeAvancar, mudarMes } = useMesDaUrl()
  const [remuneracao, setRemuneracao] = useState<RemuneracaoMes | null>(null)
  const [carregada, setCarregada] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    getRemuneracaoMes(competencia)
      .then((dados) => {
        if (!cancelled) setRemuneracao(dados)
      })
      .catch((err) => {
        if (!cancelled) {
          setRemuneracao(null)
          toast.error(getErrorMessage(err, 'Não foi possível carregar a remuneração do mês.'))
        }
      })
      .finally(() => {
        if (!cancelled) setCarregada(competencia)
      })

    return () => {
      cancelled = true
    }
  }, [competencia])

  return { mes, competencia, podeAvancar, mudarMes, remuneracao, isLoading: carregada !== competencia }
}
