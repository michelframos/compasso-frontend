import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

interface NavegadorMesProps {
  mes: Date
  podeAvancar?: boolean
  onMudar: (delta: number) => void
}

export const NavegadorMes: React.FC<NavegadorMesProps> = ({ mes, podeAvancar = true, onMudar }) => (
  <div className="flex items-center justify-between gap-3 p-1.5 rounded-full bg-white border border-zinc-100 shadow-sm w-full sm:w-72">
    <Button type="button" variant="ghost" size="icon" onClick={() => onMudar(-1)} className="rounded-full hover:cursor-pointer" aria-label="Mês anterior">
      <ChevronLeft className="w-4 h-4" />
    </Button>
    <span className="text-sm font-bold text-zinc-800 capitalize">{format(mes, 'MMMM yyyy', { locale: ptBR })}</span>
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => onMudar(1)}
      disabled={!podeAvancar}
      className="rounded-full hover:cursor-pointer"
      aria-label="Próximo mês"
    >
      <ChevronRight className="w-4 h-4" />
    </Button>
  </div>
)
