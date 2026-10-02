import { Check, Clock, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useAssinaturaPage } from './hooks/useAssinaturaPage'
import { cn } from '@/shared/lib/utils'

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export const AssinaturaPage: React.FC = () => {
  const {
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
    hasPending,
  } = useAssinaturaPage()

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
            ? `Solicite a ativação do plano para ${tenant.nome_fantasia}. `
            : 'Solicite a ativação do plano. '}
          A cobrança é confirmada pela nossa equipe — sem cartão automático.
        </p>
      </div>

      {hasPending && solicitacao && (
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
            const locked = hasPending

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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <p className="text-xs text-zinc-400 max-w-md">
          Ao solicitar, você não será cobrado imediatamente. A ativação é feita
          manualmente pela equipe do Compasso.
        </p>

        <Button
          onClick={submit}
          disabled={isLoading || isSubmitting || !selectedPlanoId || hasPending}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-indigo-100"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : hasPending ? (
            'Solicitação já enviada'
          ) : (
            'Solicitar este plano'
          )}
        </Button>
      </div>
    </div>
  )
}

export default AssinaturaPage
