import { useCallback, useEffect, useState } from 'react'
import {
  getSolicitacaoAtual,
  listPlanosAssinatura,
  solicitarAssinatura,
  type PlanoAssinatura,
  type SolicitacaoAssinatura,
} from '@/modules/core/api/assinatura'
import { useAuthStore } from '@/shared/store/useAuthStore'
import type { AxiosError } from 'axios'

export function useAssinaturaPage() {
  const tenant = useAuthStore((s) => s.tenant)
  const [planos, setPlanos] = useState<PlanoAssinatura[]>([])
  const [solicitacao, setSolicitacao] = useState<SolicitacaoAssinatura | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPlanoId, setSelectedPlanoId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [planosData, solicitacaoData] = await Promise.all([
        listPlanosAssinatura(),
        getSolicitacaoAtual(),
      ])
      setPlanos(planosData)
      setSolicitacao(solicitacaoData)
      if (solicitacaoData?.plano?.id) {
        setSelectedPlanoId(solicitacaoData.plano.id)
      } else {
        const destaque = planosData.find((p) => p.destaque)
        setSelectedPlanoId(destaque?.id ?? planosData[0]?.id ?? null)
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>
      setError(axiosError.response?.data?.message || 'Erro ao carregar planos.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const submit = useCallback(async () => {
    if (!selectedPlanoId || solicitacao) return

    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const created = await solicitarAssinatura({
        id_plano_assinatura: selectedPlanoId,
      })
      setSolicitacao(created)
      setSuccessMessage(
        'Solicitação enviada! Nossa equipe vai ativar o plano em breve.',
      )
    } catch (err) {
      const axiosError = err as AxiosError<{
        message?: string
        errors?: Record<string, string[]>
      }>
      const validation = axiosError.response?.data?.errors
      const firstError = validation
        ? Object.values(validation).flat()[0]
        : null
      setError(
        firstError ||
          axiosError.response?.data?.message ||
          'Não foi possível enviar a solicitação.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedPlanoId, solicitacao])

  return {
    tenant,
    planos,
    solicitacao,
    isLoading,
    isSubmitting,
    selectedPlanoId,
    setSelectedPlanoId,
    error,
    successMessage,
    submit,
    hasPending: Boolean(solicitacao),
  }
}
