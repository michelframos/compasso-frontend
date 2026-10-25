import React from 'react'
import { CalendarClock, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { EnsaioItem } from '../../../components/ensaios/EnsaioItem'
import type { EnsaioAgendado } from '../../../types'

interface AgendaEnsaiosProps {
  ensaios: EnsaioAgendado[]
  isLoading: boolean
}

export const AgendaEnsaios: React.FC<AgendaEnsaiosProps> = ({ ensaios, isLoading }) => (
  <Card className="border-none shadow-sm bg-white">
    <CardContent className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
          <CalendarClock className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-zinc-900">Agenda de ensaios</h2>
          <p className="text-xs text-zinc-500">Os que você conduz e os das suas apresentações.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-zinc-400 gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Carregando agenda...</span>
        </div>
      ) : ensaios.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-6">Nenhum ensaio agendado a partir de hoje.</p>
      ) : (
        <div className="space-y-2">
          {ensaios.map((ensaio) => (
            <EnsaioItem key={ensaio.id} ensaio={ensaio} exibirApresentacao />
          ))}
        </div>
      )}
    </CardContent>
  </Card>
)
