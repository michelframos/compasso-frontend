import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'

interface ContadorCardProps {
  icon: LucideIcon
  titulo: string
  valor: number | string
  detalhe?: string
  destaque?: boolean
}

export const ContadorCard: React.FC<ContadorCardProps> = ({ icon: Icon, titulo, valor, detalhe, destaque = false }) => (
  <Card className={`border-none shadow-sm ${destaque ? 'bg-amber-50' : 'bg-white'}`}>
    <CardContent className="p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className={`text-[11px] font-bold uppercase tracking-wider ${destaque ? 'text-amber-700' : 'text-zinc-400'}`}>
          {titulo}
        </span>
        <div className={`p-1.5 rounded-lg ${destaque ? 'bg-amber-100 text-amber-700' : 'bg-indigo-50 text-indigo-600'}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <span className={`text-3xl font-black leading-none ${destaque ? 'text-amber-700' : 'text-zinc-900'}`}>{valor}</span>
      {detalhe && <span className="text-[11px] text-zinc-500 font-medium">{detalhe}</span>}
    </CardContent>
  </Card>
)
