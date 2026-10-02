import { Link } from 'react-router-dom'
import { Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useTrialBanner } from './hooks/useTrialBanner'
import { cn } from '@/shared/lib/utils'

export function TrialBanner() {
  const { visible, daysLeft, urgent } = useTrialBanner()

  if (!visible) {
    return null
  }

  const daysLabel =
    daysLeft === 0
      ? 'seu trial encerra hoje'
      : daysLeft === 1
        ? 'resta 1 dia de trial'
        : `restam ${daysLeft} dias de trial`

  return (
    <div
      className={cn(
        'px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0 print:hidden',
        urgent
          ? 'bg-amber-500 text-amber-950'
          : 'bg-indigo-600 text-white',
      )}
    >
      <div className="flex items-start sm:items-center gap-2.5 text-sm">
        <Clock className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" />
        <p>
          <span className="font-bold">Período de avaliação:</span>{' '}
          {daysLabel}. Escolha um plano para continuar sem interrupções.
        </p>
      </div>

      <Button
        asChild
        size="sm"
        variant="secondary"
        className={cn(
          'rounded-full font-semibold shrink-0 self-end sm:self-auto',
          urgent
            ? 'bg-white/90 hover:bg-white text-amber-950'
            : 'bg-white hover:bg-indigo-50 text-indigo-700',
        )}
      >
        <Link to="/assinatura">
          Ver planos
          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Link>
      </Button>
    </div>
  )
}
