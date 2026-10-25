import React from 'react'
import { apelidoTurma, moeda } from '../../lib/formatters'
import type { ComissaoTurma } from '../../types'

const percentual = (valor: number | null) => (valor === null ? 'percentuais variados' : `${valor.toLocaleString('pt-BR')}%`)

export const ComissoesLista: React.FC<{ comissoes: ComissaoTurma[] }> = ({ comissoes }) => (
  <section className="space-y-3">
    <h2 className="text-[13px] font-black text-zinc-500 uppercase tracking-wider">Comissão por turma</h2>
    {comissoes.length === 0 ? (
      <p className="text-sm text-zinc-500 bg-white rounded-2xl px-4 py-5 shadow-sm">
        Nenhum pagamento de mensalidade ou aula registrado neste mês para os seus alunos.
      </p>
    ) : (
      <div className="bg-white rounded-2xl shadow-sm divide-y divide-zinc-100">
        {comissoes.map((comissao) => (
          <div key={comissao.chave} className="flex items-center gap-4 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-zinc-800 truncate">
                {comissao.turma ? apelidoTurma(comissao.turma) : 'Aulas individuais'}
              </p>
              <p className="text-[12px] text-zinc-500">
                {comissao.pagamentos} {comissao.pagamentos === 1 ? 'pagamento' : 'pagamentos'} de {comissao.alunos}{' '}
                {comissao.alunos === 1 ? 'aluno' : 'alunos'}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-black text-zinc-900">{moeda(comissao.valor)}</p>
              <p className="text-[11px] text-zinc-500 whitespace-nowrap">
                {percentual(comissao.percentual)} de {moeda(comissao.base)}
              </p>
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
)
