import React from 'react'
import { Building2, Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'

interface TenantSelectorProps {
  tenantSlug?: string
  tenants: Array<{ id: number; slug: string; nome_fantasia: string }>
  isSwitching: boolean
  onSwitch: (slug: string) => void
  compact?: boolean
}

export const TenantSelector: React.FC<TenantSelectorProps> = ({
  tenantSlug,
  tenants,
  isSwitching,
  onSwitch,
  compact = false,
}) => {
  if (tenants.length <= 1) {
    return null
  }

  return (
    <div className={`flex items-center gap-2 ${compact ? '' : 'min-w-[180px]'}`}>
      {isSwitching ? (
        <Loader2 className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
      ) : (
        <Building2 className="w-4 h-4 text-indigo-600 shrink-0 hidden sm:block" />
      )}
      <Select value={tenantSlug} onValueChange={onSwitch} disabled={isSwitching}>
        <SelectTrigger
          className={`h-9 border-zinc-200 bg-zinc-50 rounded-full text-xs font-medium ${compact ? 'w-[140px]' : 'w-[200px]'}`}
        >
          <SelectValue placeholder="Instituição" />
        </SelectTrigger>
        <SelectContent>
          {tenants.map((instituicao) => (
            <SelectItem key={instituicao.id} value={instituicao.slug}>
              {instituicao.nome_fantasia}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
