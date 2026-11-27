import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import { getErrorMessage } from '@/shared/lib/utils'
import {
  getConfiguracaoCobrancaOnline,
  provisionarSubcontaAssinatura,
  updateConfiguracaoCobrancaOnline,
  type MetodoPagamentoAssinatura,
} from '@/modules/core/api/assinatura'

const LABELS: Record<MetodoPagamentoAssinatura, string> = {
  pix: 'PIX',
  credit_card: 'Cartão de crédito',
  boleto: 'Boleto',
}

const STATUS_LABEL: Record<string, string> = {
  none: 'Não criada',
  pending: 'Em processamento',
  active: 'Ativa',
  failed: 'Falhou',
}

export function ConfiguracaoCobrancaOnlineForm() {
  const [meios, setMeios] = useState<MetodoPagamentoAssinatura[]>([])
  const [disponiveis, setDisponiveis] = useState<MetodoPagamentoAssinatura[]>([
    'pix',
    'credit_card',
    'boleto',
  ])
  const [billingDisponivel, setBillingDisponivel] = useState(false)
  const [subcontaAtiva, setSubcontaAtiva] = useState(false)
  const [subcontaStatus, setSubcontaStatus] = useState('none')
  const [subcontaLastError, setSubcontaLastError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAtivando, setIsAtivando] = useState(false)

  const carregar = async () => {
    const config = await getConfiguracaoCobrancaOnline()
    setMeios(config.meios)
    setDisponiveis(config.meios_disponiveis)
    setBillingDisponivel(config.billing_disponivel)
    setSubcontaAtiva(config.subconta_ativa)
    setSubcontaStatus(config.subconta_status)
    setSubcontaLastError(config.subconta_last_error ?? null)
  }

  useEffect(() => {
    const load = async () => {
      try {
        await carregar()
      } catch (err: unknown) {
        toast.error(getErrorMessage(err, 'Erro ao carregar meios de cobrança'))
      } finally {
        setIsLoading(false)
      }
    }
    void load()
  }, [])

  const toggle = (meio: MetodoPagamentoAssinatura) => {
    setMeios((prev) =>
      prev.includes(meio) ? prev.filter((m) => m !== meio) : [...prev, meio],
    )
  }

  const onAtivar = async () => {
    setIsAtivando(true)
    try {
      const subconta = await provisionarSubcontaAssinatura()
      setSubcontaStatus(subconta.status)
      setSubcontaAtiva(Boolean(subconta.ativa))
      if (subconta.status === 'active' || subconta.ativa) {
        toast.success('Pagamentos online ativados.')
      } else {
        toast.success('Solicitação enviada. Aguarde a ativação da subconta.')
      }
      await carregar()
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Não foi possível ativar os pagamentos online.'))
    } finally {
      setIsAtivando(false)
    }
  }

  const onSave = async () => {
    if (meios.length === 0) {
      toast.error('Selecione pelo menos um meio de cobrança.')
      return
    }
    setIsSaving(true)
    try {
      const updated = await updateConfiguracaoCobrancaOnline({ meios })
      setMeios(updated.meios)
      toast.success('Meios de cobrança salvos.')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Erro ao salvar meios de cobrança'))
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    )
  }

  const statusLabel = STATUS_LABEL[subcontaStatus] ?? subcontaStatus
  const mostraBotaoAtivar =
    !subcontaAtiva && (subcontaStatus === 'none' || subcontaStatus === 'failed')
  const botaoDesabilitado = !billingDisponivel || isAtivando

  return (
    <div className="p-6 space-y-6 max-w-xl">
      <div>
        <h2 className="text-lg font-bold text-zinc-900">Cobranças online</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Ative os recebimentos da escola e escolha quais formas de pagamento ficarão disponíveis
          nas cobranças via centralizador.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-zinc-900">Pagamentos online</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Status:{' '}
              <span className="font-semibold text-zinc-700">{statusLabel}</span>
            </p>
          </div>
          {subcontaAtiva && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Ativo
            </span>
          )}
        </div>

        {!billingDisponivel && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            A cobrança online da plataforma está temporariamente indisponível. Peça ao suporte do
            Compasso para configurar URL, API Key e ativar o billing em Platform → Configurações →
            Pagamentos.
          </p>
        )}

        {billingDisponivel && !subcontaAtiva && subcontaStatus === 'pending' && (
          <p className="text-sm text-sky-800 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2">
            Ativação em andamento. Isso pode levar alguns minutos.
          </p>
        )}

        {billingDisponivel && !subcontaAtiva && subcontaStatus === 'failed' && (
          <div className="text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 space-y-1">
            <p>
              A ativação falhou. Confira os dados da empresa (CNPJ, endereço e e-mail do admin) e o
              telefone/WhatsApp do administrador, depois tente de novo.
            </p>
            {subcontaLastError && (
              <p className="text-xs font-medium break-words">Detalhe: {subcontaLastError}</p>
            )}
          </div>
        )}

        {mostraBotaoAtivar && (
          <Button
            type="button"
            onClick={() => void onAtivar()}
            disabled={botaoDesabilitado}
            title={
              !billingDisponivel
                ? 'Disponível quando o billing da plataforma estiver ativo'
                : undefined
            }
            className="rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {isAtivando && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {subcontaStatus === 'failed' ? 'Tentar novamente' : 'Ativar pagamentos online'}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <Label>Meios habilitados</Label>
        <p className="text-xs text-zinc-500">
          Podem ser salvos mesmo antes da ativação; só passam a aparecer para o aluno com a
          subconta ativa.
        </p>
        {disponiveis.map((meio) => (
          <label
            key={meio}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 cursor-pointer hover:border-indigo-200"
          >
            <input
              type="checkbox"
              checked={meios.includes(meio)}
              onChange={() => toggle(meio)}
              className="h-4 w-4 rounded border-zinc-300 text-indigo-600"
            />
            <span className="text-sm font-medium text-zinc-800">{LABELS[meio] ?? meio}</span>
          </label>
        ))}
      </div>

      <Button
        onClick={() => void onSave()}
        disabled={isSaving}
        className="rounded-full bg-indigo-600 hover:bg-indigo-700"
      >
        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Salvar meios
      </Button>
    </div>
  )
}
