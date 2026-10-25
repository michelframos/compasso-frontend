import React from 'react'
import { format } from 'date-fns'
import { CheckCircle2, Clock, Lock } from 'lucide-react'
import { dataLocal } from '../../lib/formatters'
import type { ExtratoProfessor } from '../../types'

const dia = (valor: string) => format(dataLocal(valor), 'dd/MM/yyyy')

const pagamento = (fechamento: NonNullable<ExtratoProfessor['fechamento']>) => {
  const conta = fechamento.conta
  if (!conta) return null
  if (conta.status === 'pago') return conta.data_pagamento ? `Pagamento realizado em ${dia(conta.data_pagamento)}.` : 'Pagamento realizado.'
  if (conta.status === 'cancelado') return 'O lançamento do pagamento foi cancelado no financeiro.'
  if (conta.status === 'pago_parcialmente') return 'Pagamento realizado em parte.'
  return conta.data_vencimento ? `Pagamento previsto para ${dia(conta.data_vencimento)}.` : 'Pagamento pendente.'
}

export const SituacaoExtratoAviso: React.FC<{ extrato: ExtratoProfessor }> = ({ extrato }) => {
  if (extrato.situacao === 'fechado' && extrato.fechamento) {
    const fechadoEm = format(new Date(extrato.fechamento.fechado_em), 'dd/MM/yyyy')
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-800">
        <Lock className="w-4 h-4 mt-0.5 shrink-0" />
        <p>
          <span className="font-bold">Mês fechado em {fechadoEm}.</span> Os valores abaixo não mudam mais. {pagamento(extrato.fechamento)}
        </p>
      </div>
    )
  }

  if (extrato.situacao === 'aberto') {
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-800">
        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
        <p>
          <span className="font-bold">Mês encerrado, aguardando fechamento.</span> Os valores ainda podem mudar se aulas ou
          pagamentos forem ajustados.
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 rounded-2xl bg-sky-50 border border-sky-100 px-4 py-3 text-sm text-sky-800">
      <Clock className="w-4 h-4 mt-0.5 shrink-0" />
      <p>
        <span className="font-bold">Mês em andamento.</span> Os valores são parciais e crescem conforme as aulas são concluídas e
        os pagamentos são registrados.
      </p>
    </div>
  )
}
