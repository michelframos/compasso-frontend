import React from 'react'
import { Banknote, Clock, Percent, Wallet } from 'lucide-react'
import { ContadorCard } from '../ContadorCard'
import { duracao, moeda } from '../../lib/formatters'
import type { ResumoRemuneracao } from '../../types'

export const ExtratoResumo: React.FC<{ resumo: ResumoRemuneracao }> = ({ resumo }) => (
  <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
    <ContadorCard icon={Wallet} titulo="Total do mês" valor={moeda(resumo.valor_total)} />
    <ContadorCard icon={Banknote} titulo="Salário fixo" valor={moeda(resumo.salario_fixo)} />
    <ContadorCard
      icon={Clock}
      titulo="Hora-aula"
      valor={moeda(resumo.valor_hora_aula)}
      detalhe={`${duracao(resumo.total_horas)} em ${resumo.total_aulas} ${resumo.total_aulas === 1 ? 'aula' : 'aulas'}`}
    />
    <ContadorCard
      icon={Percent}
      titulo="Comissão"
      valor={moeda(resumo.valor_comissao)}
      detalhe={`Sobre ${moeda(resumo.base_comissao)} pagos`}
    />
  </div>
)
