import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Loader2, UserRoundPen } from 'lucide-react'
import { NoData } from '@/shared/components/NoData'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { NavegadorMes, duracao, moeda } from '@/modules/professor'
import { SituacaoBadge } from './components/SituacaoBadge'
import { useRemuneracaoProfessores } from './hooks/useRemuneracaoProfessores'

export const RemuneracaoProfessoresPage: React.FC = () => {
  const { mes, competencia, podeAvancar, mudarMes, remuneracao, isLoading } = useRemuneracaoProfessores()
  const linhas = remuneracao?.data ?? []
  const aFechar = linhas.filter((linha) => linha.situacao === 'aberto').length

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Remuneração dos <span className="text-indigo-600">professores</span>
        </h1>
        <p className="text-zinc-500 mt-1 text-[14px]">
          Salário fixo, hora-aula das aulas concluídas e comissão sobre o que foi pago no mês. Feche o mês para lançar o pagamento no financeiro.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <NavegadorMes mes={mes} podeAvancar={podeAvancar} onMudar={mudarMes} />
        {remuneracao && !isLoading && (
          <div className="text-sm text-zinc-500">
            Total do mês: <span className="font-black text-zinc-900">{moeda(remuneracao.total)}</span>
            {aFechar > 0 && <span className="ml-2 text-amber-700 font-semibold">· {aFechar} a fechar</span>}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-zinc-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Calculando remuneração...</span>
        </div>
      ) : linhas.length === 0 ? (
        <NoData
          title="Nenhum professor cadastrado"
          description="Cadastre professores com salário fixo, hora-aula ou comissão para acompanhar a remuneração."
          icon={<UserRoundPen className="w-8 h-8" />}
          showAddButton={false}
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-100">
                <TableHead>Professor</TableHead>
                <TableHead className="text-right">Fixo</TableHead>
                <TableHead className="text-right">Hora-aula</TableHead>
                <TableHead className="text-right">Comissão</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.map(({ professor, resumo, situacao, fechamento }) => (
                <TableRow key={professor.id} className="border-zinc-100">
                  <TableCell className="font-semibold text-zinc-800">{professor.nome ?? `Professor #${professor.id}`}</TableCell>
                  <TableCell className="text-right">{moeda(resumo.salario_fixo)}</TableCell>
                  <TableCell className="text-right">
                    {moeda(resumo.valor_hora_aula)}
                    <span className="block text-[11px] text-zinc-400">{duracao(resumo.total_horas)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    {moeda(resumo.valor_comissao)}
                    <span className="block text-[11px] text-zinc-400">de {moeda(resumo.base_comissao)}</span>
                  </TableCell>
                  <TableCell className="text-right font-black text-zinc-900">{moeda(resumo.valor_total)}</TableCell>
                  <TableCell>
                    <SituacaoBadge situacao={situacao} fechamento={fechamento} />
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/remuneracao/${professor.id}?mes=${competencia}`}
                      className="inline-flex p-2 rounded-full text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50"
                      aria-label={`Ver extrato de ${professor.nome ?? 'professor'}`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
