import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Building2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

type AuthAlertVariant = 'error' | 'success' | 'info'

interface AuthAlertProps {
  variant?: AuthAlertVariant
  children: ReactNode
  className?: string
}

const styles: Record<AuthAlertVariant, { box: string; icon: typeof AlertCircle }> = {
  error: {
    box: 'bg-destructive/10 text-destructive',
    icon: AlertCircle,
  },
  success: {
    box: 'border border-emerald-100 bg-emerald-50 text-emerald-800',
    icon: CheckCircle2,
  },
  info: {
    box: 'border border-[color-mix(in_srgb,var(--auth-magenta)_18%,transparent)] bg-[color-mix(in_srgb,var(--auth-magenta)_8%,white)] text-[var(--auth-navy)]',
    icon: Building2,
  },
}

export function AuthAlert({ variant = 'error', children, className }: AuthAlertProps) {
  const { box, icon: Icon } = styles[variant]

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl p-4 text-sm animate-in fade-in slide-in-from-top-1',
        box,
        className,
      )}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
