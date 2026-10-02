import { useMemo } from 'react'
import { useAuthStore } from '@/shared/store/useAuthStore'
import { useLayoutMode } from '@/shared/contexts/LayoutModeContext'

function daysRemaining(trialEndsAt: string): number {
  const end = new Date(trialEndsAt)
  const now = new Date()
  const diffMs = end.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
}

export function useTrialBanner() {
  const tenant = useAuthStore((s) => s.tenant)
  const mode = useLayoutMode()

  return useMemo(() => {
    if (mode !== 'tenant' || !tenant) {
      return { visible: false as const, daysLeft: 0, urgent: false }
    }

    const isTrialing = tenant.assinatura_status === 'trialing'
    const endsAt = tenant.trial_ends_at

    if (!isTrialing || !endsAt) {
      return { visible: false as const, daysLeft: 0, urgent: false }
    }

    const endDate = new Date(endsAt)
    if (Number.isNaN(endDate.getTime()) || endDate.getTime() <= Date.now()) {
      return { visible: false as const, daysLeft: 0, urgent: false }
    }

    const daysLeft = daysRemaining(endsAt)

    return {
      visible: true as const,
      daysLeft,
      urgent: daysLeft <= 3,
      trialEndsAt: endsAt,
    }
  }, [tenant, mode])
}
