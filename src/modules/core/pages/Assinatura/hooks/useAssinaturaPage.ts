import { useCallback, useEffect, useRef, useState } from 'react'
import {
  cancelarAssinaturaOnline,
  checkoutAssinatura,
  getAssinaturaAtual,
  getCheckoutAssinatura,
  getSolicitacaoAtual,
  listPlanosAssinatura,
  provisionarSubcontaAssinatura,
  solicitarAssinatura,
  atualizarSaqueSubconta,
  type AssinaturaAtual,
  type AssinaturaCobranca,
  type MetodoPagamentoAssinatura,
  type PlanoAssinatura,
  type SolicitacaoAssinatura,
  type SubcontaAssinatura,
} from '@/modules/core/api/assinatura'
import { useAuthStore } from '@/shared/store/useAuthStore'
import type { AxiosError } from 'axios'

function extractError(err: unknown, fallback: string) {
  const axiosError = err as AxiosError<{
    message?: string
    errors?: Record<string, string[]>
  }>
  const validation = axiosError.response?.data?.errors
  const firstError = validation ? Object.values(validation).flat()[0] : null
  return firstError || axiosError.response?.data?.message || fallback
}

const METODOS: { value: MetodoPagamentoAssinatura; label: string }[] = [
  { value: 'pix', label: 'PIX' },
  { value: 'credit_card', label: 'Cartão' },
  { value: 'boleto', label: 'Boleto' },
]

export function useAssinaturaPage() {
  const tenant = useAuthStore((s) => s.tenant)
  const [planos, setPlanos] = useState<PlanoAssinatura[]>([])
  const [solicitacao, setSolicitacao] = useState<SolicitacaoAssinatura | null>(null)
  const [atual, setAtual] = useState<AssinaturaAtual | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)
  const [isProvisioning, setIsProvisioning] = useState(false)
  const [isSavingPix, setIsSavingPix] = useState(false)
  const [selectedPlanoId, setSelectedPlanoId] = useState<number | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<MetodoPagamentoAssinatura>('pix')
  const [pixKey, setPixKey] = useState('')
  const [pixKeyType, setPixKeyType] = useState<'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP'>('CNPJ')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const pollRef = useRef<number | null>(null)

  const stopPolling = useCallback(() => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [planosData, solicitacaoData, atualData] = await Promise.all([
        listPlanosAssinatura(),
        getSolicitacaoAtual(),
        getAssinaturaAtual().catch(() => null),
      ])
      setPlanos(planosData)
      setSolicitacao(solicitacaoData)
      setAtual(atualData)

      if (atualData?.cobranca?.id_plano_assinatura) {
        setSelectedPlanoId(atualData.cobranca.id_plano_assinatura)
        if (atualData.cobranca.method) {
          setSelectedMethod(atualData.cobranca.method)
        }
      } else if (solicitacaoData?.plano?.id) {
        setSelectedPlanoId(solicitacaoData.plano.id)
      } else {
        const destaque = planosData.find((p) => p.destaque)
        setSelectedPlanoId(destaque?.id ?? planosData[0]?.id ?? null)
      }
    } catch (err) {
      setError(extractError(err, 'Erro ao carregar planos.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    return () => stopPolling()
  }, [load, stopPolling])

  const startPolling = useCallback(
    (cobrancaId: number) => {
      stopPolling()
      pollRef.current = window.setInterval(async () => {
        try {
          const cobranca = await getCheckoutAssinatura(cobrancaId, true)
          setAtual((prev) =>
            prev
              ? {
                  ...prev,
                  cobranca,
                  invoice_url: cobranca.invoice_url ?? prev.invoice_url,
                }
              : prev,
          )

          if (['active', 'canceled', 'failed'].includes(cobranca.status)) {
            stopPolling()
            const refreshed = await getAssinaturaAtual()
            setAtual(refreshed)
            if (cobranca.status === 'active') {
              setSuccessMessage('Pagamento confirmado! Seu plano foi ativado.')
            }
          }
        } catch {
          // Mantém polling; job do backend continua sincronizando.
        }
      }, 5000)
    },
    [stopPolling],
  )

  useEffect(() => {
    const cobranca = atual?.cobranca
    if (
      cobranca &&
      ['pending', 'awaiting_payment'].includes(cobranca.status) &&
      atual?.billing_disponivel
    ) {
      startPolling(cobranca.id)
    } else {
      stopPolling()
    }
  }, [atual?.cobranca?.id, atual?.cobranca?.status, atual?.billing_disponivel, startPolling, stopPolling])

  const submitCheckout = useCallback(async () => {
    if (!selectedPlanoId) return

    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      if (atual?.billing_disponivel) {
        const created = await checkoutAssinatura({
          id_plano_assinatura: selectedPlanoId,
          method: selectedMethod,
        })
        const refreshed = await getAssinaturaAtual()
        setAtual({
          ...refreshed,
          cobranca: created,
          invoice_url: created.invoice_url ?? refreshed.invoice_url,
        })
        setSuccessMessage(
          created.invoice_url
            ? 'Assinatura criada. Abra a fatura para concluir o pagamento.'
            : 'Assinatura criada. Aguarde a fatura ser gerada...',
        )
        startPolling(created.id)
      } else {
        const created = await solicitarAssinatura({
          id_plano_assinatura: selectedPlanoId,
        })
        setSolicitacao(created)
        setSuccessMessage(
          'Solicitação enviada! Nossa equipe vai ativar o plano em breve.',
        )
      }
    } catch (err) {
      setError(extractError(err, 'Não foi possível concluir a assinatura.'))
    } finally {
      setIsSubmitting(false)
    }
  }, [atual?.billing_disponivel, selectedMethod, selectedPlanoId, startPolling])

  const cancelar = useCallback(async () => {
    setIsCanceling(true)
    setError(null)
    try {
      await cancelarAssinaturaOnline()
      stopPolling()
      await load()
      setSuccessMessage('Assinatura cancelada.')
    } catch (err) {
      setError(extractError(err, 'Não foi possível cancelar a assinatura.'))
    } finally {
      setIsCanceling(false)
    }
  }, [load, stopPolling])

  const provisionarSubconta = useCallback(async () => {
    setIsProvisioning(true)
    setError(null)
    try {
      const subconta = await provisionarSubcontaAssinatura()
      setAtual((prev) => (prev ? { ...prev, subconta } : prev))
      setSuccessMessage(
        subconta.status === 'active'
          ? 'Subconta ativa.'
          : 'Subconta solicitada. Aguarde a ativação.',
      )
    } catch (err) {
      setError(extractError(err, 'Não foi possível criar a subconta.'))
    } finally {
      setIsProvisioning(false)
    }
  }, [])

  const salvarPixSaque = useCallback(async () => {
    setIsSavingPix(true)
    setError(null)
    try {
      await atualizarSaqueSubconta({
        pix_key: pixKey,
        pix_key_type: pixKeyType,
      })
      setSuccessMessage('Chave PIX de saque cadastrada.')
      setPixKey('')
    } catch (err) {
      setError(extractError(err, 'Não foi possível salvar a chave PIX.'))
    } finally {
      setIsSavingPix(false)
    }
  }, [pixKey, pixKeyType])

  const cobranca: AssinaturaCobranca | null = atual?.cobranca ?? null
  const subconta: SubcontaAssinatura | null = atual?.subconta ?? null
  const billingOnline = Boolean(atual?.billing_disponivel)
  const hasPendingSolicitacao = Boolean(solicitacao)
  const checkoutEmAndamento = Boolean(
    cobranca && ['pending', 'awaiting_payment'].includes(cobranca.status),
  )
  const assinaturaAtivaOnline = Boolean(
    cobranca && ['active', 'past_due'].includes(cobranca.status),
  )
  const podeGerenciarRecebimentos = Boolean(
    atual &&
      ['trialing', 'active', 'past_due'].includes(atual.assinatura_status),
  )

  return {
    tenant,
    planos,
    solicitacao,
    atual,
    cobranca,
    subconta,
    metodos: METODOS,
    isLoading,
    isSubmitting,
    isCanceling,
    isProvisioning,
    isSavingPix,
    selectedPlanoId,
    setSelectedPlanoId,
    selectedMethod,
    setSelectedMethod,
    pixKey,
    setPixKey,
    pixKeyType,
    setPixKeyType,
    error,
    successMessage,
    submitCheckout,
    cancelar,
    provisionarSubconta,
    salvarPixSaque,
    billingOnline,
    hasPendingSolicitacao,
    checkoutEmAndamento,
    assinaturaAtivaOnline,
    podeGerenciarRecebimentos,
    invoiceUrl: atual?.invoice_url || cobranca?.invoice_url || null,
  }
}
