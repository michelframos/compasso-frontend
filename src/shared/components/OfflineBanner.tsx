import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus'

export function OfflineBanner() {
  const { offline } = useOnlineStatus()

  if (!offline) return null

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2">
      <div className="mx-auto flex max-w-lg items-center gap-2 text-amber-950">
        <WifiOff className="h-4 w-4 shrink-0" />
        <p className="text-xs font-semibold">
          Você está offline. Agenda, materiais e financeiro aparecem em modo somente leitura.
        </p>
      </div>
    </div>
  )
}
