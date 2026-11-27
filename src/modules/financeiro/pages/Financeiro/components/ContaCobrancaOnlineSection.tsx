import React, { useCallback, useEffect, useState } from 'react'
import { CreditCard, ExternalLink, Loader2, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import {
  getConfiguracaoCobrancaOnline,
  type MetodoPagamentoAssinatura,
} from '@/modules/core/api/assinatura'
import { getErrorMessage } from '@/shared/lib/utils'
import {
  cancelarCobrancaOnlineConta,
  criarCobrancaOnlineConta,
  getCobrancaOnlineConta,
} from '../../../api/contas'
import type { Conta, ContaCobrancaGateway, MetodoCobrancaOnline } from '../types'

const MEIO_LABEL: Record<MetodoCobrancaOnline, string> = {
  pix: 'PIX',
  credit_card: 'Cartão',
  boleto: 'Boleto',
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente',
  awaiting_payment: 'Aguardando pagamento',
  paid: 'Pago',
  overdue: 'Vencida',
  canceled: 'Cancelada',
  failed: 'Falhou',
}

interface ContaCobrancaOnlineSectionProps {
  conta: Conta
  onPaid?: () => void
}

export const ContaCobrancaOnlineSection: React.FC<ContaCobrancaOnlineSectionProps> = ({
  conta,
  onPaid,
}) => {
  const [cobranca, setCobranca] = useState<ContaCobrancaGateway | null>(null)
  const [meios, setMeios] = useState<MetodoPagamentoAssinatura[]>([])
  const [subcontaAtiva, setSubcontaAtiva] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [escolhendoMeio, setEscolhendoMeio] = useState(false)

  const saldo = conta.saldo_devedor ?? conta.valor
  const elegivel =
    conta.tipo === 'receita' &&
    saldo > 0 &&
    !['pago', 'cancelado'].includes(conta.status)

  const carregar = useCallback(async () => {
    if (!elegivel) {
      setLoading(false)
      return
    }
    try {
      const [config, atual] = await Promise.all([
        getConfiguracaoCobrancaOnline(),
        getCobrancaOnlineConta(conta.id, false),
      ])
      setMeios(config.billing_disponivel ? config.meios : [])
      setSubcontaAtiva(Boolean(config.subconta_ativa))
      setCobranca(atual)
    } catch {
      // billing pode estar off — seção fica oculta se sem meios/subconta
    } finally {
      setLoading(false)
    }
  }, [conta.id, elegivel])

  useEffect(() => {
    setLoading(true)
    void carregar(false)
  }, [carregar])

  if (!elegivel) return null
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Verificando cobrança online…
      </div>
    )
  }

  const disponivel = subcontaAtiva && meios.length > 0

  if (!disponivel && !cobranca) return null

  const gerar = async (method: MetodoCobrancaOnline) => {
    setBusy(true)
    setEscolhendoMeio(false)
    try {
      const criada = await criarCobrancaOnlineConta(conta.id, method)
      setCobranca(criada)
      toast.success('Cobrança online pronta.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível gerar a cobrança online.'))
    } finally {
      setBusy(false)
    }
  }

  const sincronizar = async () => {
    setBusy(true)
    try {
      const atual = await getCobrancaOnlineConta(conta.id, true)
      setCobranca(atual)
      if (atual?.paga) {
        toast.success('Pagamento confirmado.')
        onPaid?.()
      } else {
        toast.success('Status atualizado.')
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível consultar a cobrança.'))
    } finally {
      setBusy(false)
    }
  }

  const cancelar = async () => {
    setBusy(true)
    try {
      const cancelada = await cancelarCobrancaOnlineConta(conta.id)
      setCobranca(cancelada)
      toast.success('Cobrança cancelada.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível cancelar a cobrança.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Cobrança online
          </h4>
          <p className="mt-1 text-xs text-indigo-700/80">
            Gera fatura/PIX via Centralizador com split na subconta da escola.
          </p>
        </div>
        {cobranca && (
          <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-indigo-700 ring-1 ring-indigo-200">
            {STATUS_LABEL[cobranca.status] ?? cobranca.status}
          </span>
        )}
      </div>

      {!disponivel && (
        <p className="text-xs text-amber-800 bg-amber-50 rounded-xl px-3 py-2">
          Subconta inativa ou meios de cobrança não configurados. Ajuste em Configurações → Cobranças online.
        </p>
      )}

      {cobranca && (
        <div className="space-y-2 text-sm text-zinc-700">
          <p>
            {MEIO_LABEL[cobranca.method]} ·{' '}
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cobranca.amount)}
          </p>
          {cobranca.invoice_url && (
            <a
              href={cobranca.invoice_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-700 hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Abrir fatura
            </a>
          )}
          {cobranca.pix_copy_paste && (
            <p className="break-all rounded-xl bg-white p-3 text-[11px] text-zinc-600 ring-1 ring-zinc-100">
              {cobranca.pix_copy_paste}
            </p>
          )}
          {cobranca.last_error && (
            <p className="text-xs text-rose-700">{cobranca.last_error}</p>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {disponivel && (!cobranca || !cobranca.aberta) && (
          <>
            {!escolhendoMeio ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => (meios.length === 1 ? void gerar(meios[0]) : setEscolhendoMeio(true))}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-indigo-600 px-3 text-xs font-bold text-white disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />}
                Gerar cobrança online
              </button>
            ) : (
              meios.map((meio) => (
                <button
                  key={meio}
                  type="button"
                  disabled={busy}
                  onClick={() => void gerar(meio)}
                  className="h-8 rounded-full bg-white px-3 text-xs font-bold text-indigo-700 ring-1 ring-indigo-200 disabled:opacity-60"
                >
                  {MEIO_LABEL[meio]}
                </button>
              ))
            )}
          </>
        )}

        {cobranca?.aberta && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => void sincronizar()}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3 text-xs font-bold text-zinc-700 ring-1 ring-zinc-200 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Atualizar status
            </button>
            {cobranca.invoice_url && (
              <a
                href={cobranca.invoice_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3 text-xs font-bold text-indigo-700 ring-1 ring-indigo-200"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Ver fatura
              </a>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => void cancelar()}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-rose-50 px-3 text-xs font-bold text-rose-700 ring-1 ring-rose-200 disabled:opacity-60"
            >
              <XCircle className="h-3.5 w-3.5" />
              Cancelar cobrança
            </button>
          </>
        )}
      </div>
    </div>
  )
}
