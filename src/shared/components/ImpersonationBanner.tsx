import { LogOut, ShieldAlert } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useImpersonation } from '@/modules/platform/hooks/useImpersonation'

export function ImpersonationBanner() {
  const { impersonation, user, tenant, isStopping, exitImpersonation, isImpersonating } = useImpersonation()

  if (!isImpersonating || !impersonation || !user) {
    return null
  }

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0 print:hidden">
      <div className="flex items-start sm:items-center gap-2.5 text-sm">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" />
        <p>
          <span className="font-bold">Modo suporte:</span>{' '}
          acessando como {user.name || user.nome} ({user.email})
          {tenant?.nome_fantasia ? ` — ${tenant.nome_fantasia}` : ''}
        </p>
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={exitImpersonation}
        disabled={isStopping}
        className="rounded-full bg-white/90 hover:bg-white text-amber-950 font-semibold shrink-0 self-end sm:self-auto"
      >
        <LogOut className="w-3.5 h-3.5 mr-1.5" />
        {isStopping ? 'Saindo...' : 'Voltar ao painel admin'}
      </Button>
    </div>
  )
}
