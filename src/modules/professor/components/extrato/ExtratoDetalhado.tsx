import React from 'react'
import { moeda } from '../../lib/formatters'
import type { ExtratoProfessor } from '../../types'
import { AulasRemuneradasLista } from './AulasRemuneradasLista'
import { ComissoesLista } from './ComissoesLista'
import { ExtratoResumo } from './ExtratoResumo'
import { SituacaoExtratoAviso } from './SituacaoExtratoAviso'

export const ExtratoDetalhado: React.FC<{ extrato: ExtratoProfessor }> = ({ extrato }) => (
  <div className="space-y-5">
    <SituacaoExtratoAviso extrato={extrato} />
    <ExtratoResumo resumo={extrato.resumo} />
    <p className="text-[12px] text-zinc-500">
      Cadastro: salário fixo de {moeda(extrato.regras.salario_fixo)}, hora-aula de {moeda(extrato.regras.valor_hora_aula)} e
      comissão de {extrato.regras.comissao.toLocaleString('pt-BR')}%. Turmas com valores próprios usam os valores da turma.
    </p>
    <div className="grid gap-5 2xl:grid-cols-2">
      <AulasRemuneradasLista aulas={extrato.aulas} />
      <ComissoesLista comissoes={extrato.comissoes} />
    </div>
  </div>
)
