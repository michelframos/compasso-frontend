import React from 'react'
import type { FechamentoRemuneracao, SituacaoExtrato } from '@/modules/professor'

const ESTILO = 'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap'

const STATUS_CONTA: Record<string, string> = {
  pago: 'pago',
  pago_parcialmente: 'pago em parte',
  pendente: 'a pagar',
  vencido: 'pagamento vencido',
  cancelado: 'despesa cancelada',
}

interface SituacaoBadgeProps {
  situacao: SituacaoExtrato
  fechamento: FechamentoRemuneracao | null
}

export const SituacaoBadge: React.FC<SituacaoBadgeProps> = ({ situacao, fechamento }) => {
  if (situacao === 'em_andamento') return <span className={`${ESTILO} bg-sky-50 text-sky-700`}>Em andamento</span>
  if (situacao === 'aberto') return <span className={`${ESTILO} bg-amber-50 text-amber-700`}>A fechar</span>

  const conta = fechamento?.conta
  const pago = conta?.status === 'pago'
  return (
    <span className={`${ESTILO} ${pago ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'}`}>
      Fechado{conta ? ` · ${STATUS_CONTA[conta.status] ?? conta.status}` : ''}
    </span>
  )
}
