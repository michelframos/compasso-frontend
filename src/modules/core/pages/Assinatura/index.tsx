import {
  Check,
  Clock,
  CreditCard,
  ExternalLink,
  Loader2,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { useAssinaturaPage } from './hooks/useAssinaturaPage'
import { cn } from '@/shared/lib/utils'

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Processando',
  awaiting_payment: 'Aguardando pagamento',
  active: 'Ativa',
  past_due: 'Em atraso',
  canceled: 'Cancelada',
  failed: 'Falhou',
  none: 'Não criada',
}

export const AssinaturaPage: React.FC = () => {
  const {
    tenant,
    planos,
    solicitacao,
    atual,
    cobranca,
    subconta,
    metodos,
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
    invoiceUrl,
  } = useAssinaturaPage()

  const locked = hasPendingSolicitacao || checkoutEmAndamento || assinaturaAtivaOnline

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Assinatura
        </div>
        <h1 className="text-3xl font-black tracking-tight text-zinc-900">
          Escolha o plano da sua escola
        </h1>
        <p className="text-zinc-500 mt-2 max-w-2xl">
          {tenant?.nome_fantasia
            ? `Assine o plano para ${tenant.nome_fantasia}. `
            : 'Assine o plano da sua escola. '}
          {billingOnline
            ? 'Pagamento online via PIX, cartão ou boleto — ativação automática após a confirmação.'
            : 'A cobrança online está temporariamente indisponível. Você pode solicitar a ativação manual.'}
        </p>
      </div>

      {atual?.assinatura_status && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase text-zinc-400">Status atual</p>
            <p className="text-sm font-semibold text-zinc-900 capitalize mt-1">
              {STATUS_LABEL[atual.assinatura_status] ?? atual.assinatura_status.replace('_', ' ')}
              {atual.plano ? ` — ${atual.plano.nome}` : ''}
            </p>
          </div>
          {assinaturaAtivaOnline && (
            <Button
              variant="outline"
              onClick={() => void cancelar()}
              disabled={isCanceling}
              className="rounded-xl"
            >
              {isCanceling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Cancelar assinatura
            </Button>
          )}
        </div>
      )}

      {hasPendingSolicitacao && solicitacao && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900">
              Solicitação pendente — plano {solicitacao.plano?.nome}
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Nossa equipe está analisando. Você será notificado quando o plano for ativado.
            </p>
          </div>
        </div>
      )}

      {checkoutEmAndamento && cobranca && (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-sky-900">
                {STATUS_LABEL[cobranca.status] ?? cobranca.status}
                {cobranca.plano ? ` — ${cobranca.plano.nome}` : ''}
              </p>
              <p className="text-xs text-sky-700 mt-1">
                {formatPrice(cobranca.amount)}/mês · {cobranca.method.toUpperCase()}
              </p>
            </div>
          </div>
          {invoiceUrl && (
            <Button asChild className="bg-sky-600 hover:bg-sky-700 rounded-xl">
              <a href={invoiceUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir fatura
              </a>
            </Button>
          )}
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-sm font-medium text-emerald-800">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80 rounded-2xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {planos.map((plano) => {
            const selected = selectedPlanoId === plano.id

            return (
              <button
                key={plano.id}
                type="button"
                disabled={locked}
                onClick={() => setSelectedPlanoId(plano.id)}
                className={cn(
                  'relative text-left p-6 rounded-2xl border bg-white transition-all',
                  selected
                    ? 'border-indigo-600 shadow-xl shadow-indigo-100 ring-2 ring-indigo-600/20'
                    : 'border-zinc-200 shadow-sm hover:border-indigo-200',
                  locked && !selected && 'opacity-60',
                  locked && 'cursor-default',
                )}
              >
                {plano.destaque && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full">
                    Popular
                  </span>
                )}

                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-zinc-900">{plano.nome}</h3>
                  {selected && (
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <p className="mt-3">
                  <span className="text-3xl font-black text-zinc-900">
                    {formatPrice(plano.preco)}
                  </span>
                  <span className="text-sm text-zinc-500">/mês</span>
                </p>

                <ul className="mt-5 space-y-2.5">
                  {plano.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-zinc-600">
                      <Check className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>
      )}

      {billingOnline && !assinaturaAtivaOnline && !hasPendingSolicitacao && (
        <div className="space-y-3">
          <p className="text-sm font-bold text-zinc-700">Forma de pagamento</p>
          <div className="flex flex-wrap gap-2">
            {metodos.map((metodo) => (
              <button
                key={metodo.value}
                type="button"
                disabled={checkoutEmAndamento}
                onClick={() => setSelectedMethod(metodo.value)}
                className={cn(
                  'px-4 py-2 rounded-xl border text-sm font-semibold transition-all',
                  selectedMethod === metodo.value
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-zinc-200 text-zinc-600 hover:border-indigo-200',
                )}
              >
                {metodo.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {!assinaturaAtivaOnline && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <p className="text-xs text-zinc-400 max-w-md">
            {billingOnline
              ? 'Ao assinar, você será direcionado à fatura do gateway para concluir o pagamento. A ativação é automática após a confirmação.'
              : 'Ao solicitar, você não será cobrado imediatamente. A ativação é feita manualmente pela equipe do Compasso.'}
          </p>

          <Button
            onClick={() => void submitCheckout()}
            disabled={
              isLoading ||
              isSubmitting ||
              !selectedPlanoId ||
              hasPendingSolicitacao ||
              checkoutEmAndamento
            }
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-indigo-100"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : hasPendingSolicitacao ? (
              'Solicitação já enviada'
            ) : checkoutEmAndamento ? (
              'Aguardando pagamento'
            ) : billingOnline ? (
              'Assinar e pagar'
            ) : (
              'Solicitar este plano'
            )}
          </Button>
        </div>
      )}

      {(podeGerenciarRecebimentos || subconta) && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-5">
          <div className="flex items-start gap-3">
            <Wallet className="w-5 h-5 text-indigo-600 mt-0.5" />
            <div>
              <h2 className="text-lg font-bold text-zinc-900">Recebimentos</h2>
              <p className="text-sm text-zinc-500 mt-1">
                Subconta para cobranças da escola com split no centralizador.
                Disponível também durante o período de teste.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-zinc-700">
              Status:{' '}
              <span className="font-semibold">
                {STATUS_LABEL[subconta?.status ?? 'none'] ?? subconta?.status}
              </span>
            </p>
            {(subconta?.status === 'none' || subconta?.status === 'failed') && (
              <Button
                onClick={() => void provisionarSubconta()}
                disabled={isProvisioning}
                className="rounded-xl"
              >
                {isProvisioning ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {subconta?.status === 'failed' ? 'Retentar subconta' : 'Criar subconta'}
              </Button>
            )}
          </div>

          {subconta?.last_error && (
            <p className="text-xs text-rose-600">{subconta.last_error}</p>
          )}

          {subconta?.ativa && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-100">
              <div className="space-y-2">
                <Label>Tipo da chave PIX</Label>
                <select
                  value={pixKeyType}
                  onChange={(e) => setPixKeyType(e.target.value as typeof pixKeyType)}
                  className="w-full h-10 rounded-xl border border-zinc-200 px-3 text-sm"
                >
                  <option value="CNPJ">CNPJ</option>
                  <option value="CPF">CPF</option>
                  <option value="EMAIL">E-mail</option>
                  <option value="PHONE">Telefone</option>
                  <option value="EVP">Aleatória</option>
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="pix_saque">Chave PIX para saque</Label>
                <div className="flex gap-2">
                  <Input
                    id="pix_saque"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder="Informe a chave PIX"
                    className="rounded-xl"
                  />
                  <Button
                    onClick={() => void salvarPixSaque()}
                    disabled={isSavingPix || !pixKey.trim()}
                    className="rounded-xl shrink-0"
                  >
                    {isSavingPix ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AssinaturaPage
