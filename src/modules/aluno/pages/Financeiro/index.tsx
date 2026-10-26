import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2, QrCode, Receipt, Wallet } from 'lucide-react'
import { NoData } from '@/shared/components/NoData'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import type { ContaDoAluno } from '../../types'
import { useFinanceiro, type SituacaoConta } from './hooks/useFinanceiro'

const ABAS: { valor: SituacaoConta; label: string }[] = [
  { valor: 'em_aberto', label: 'Em aberto' },
  { valor: 'pagas', label: 'Pagas' },
  { valor: 'atrasadas', label: 'Atrasadas' },
]

const SITUACAO: Record<ContaDoAluno['situacao'], string> = {
  atrasada: 'Atrasada',
  vence_hoje: 'Vence hoje',
  a_vencer: 'A vencer',
  paga: 'Paga',
}

function dinheiro(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function dataCurta(iso: string) {
  return format(new Date(`${iso.slice(0, 10)}T00:00:00`), "d 'de' MMM", { locale: ptBR })
}

export const FinanceiroPage: React.FC = () => {
  const {
    situacao,
    setSituacao,
    consolidado,
    setConsolidado,
    podeConsolidar,
    contas,
    isLoading,
    aguardandoDependente,
    pix,
    fecharPix,
    abrindoPix,
    abrirPix,
    copiarPix,
    gerando,
    emitirCarne,
    emitirRecibo,
    offline,
    doCache,
  } = useFinanceiro()
  const somenteLeitura = offline || doCache

  if (aguardandoDependente) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h1 className="text-lg font-bold">Financeiro</h1>
        <p className="mt-2 text-sm text-zinc-600">Selecione um aluno para ver as mensalidades dele.</p>
      </section>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Financeiro</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {consolidado ? 'Mensalidades de todos os dependentes.' : 'Mensalidades, PIX e recibos.'}
          </p>
          {somenteLeitura && (
            <p className="mt-1 text-xs font-semibold text-amber-700">Somente leitura (dados em cache).</p>
          )}
        </div>
        {!consolidado && situacao !== 'pagas' && contas.length > 0 && !somenteLeitura && (
          <button
            type="button"
            onClick={emitirCarne}
            disabled={gerando}
            className="h-9 shrink-0 rounded-full bg-indigo-600 px-3 text-xs font-bold text-white disabled:opacity-60"
          >
            Baixar carnê
          </button>
        )}
      </div>

      {podeConsolidar && (
        <div className="inline-flex w-full rounded-full bg-zinc-100 p-1">
          {[
            { valor: false, label: 'Este aluno' },
            { valor: true, label: 'Todos' },
          ].map((opcao) => (
            <button
              key={opcao.label}
              type="button"
              onClick={() => setConsolidado(opcao.valor)}
              className={`h-8 flex-1 rounded-full text-xs font-bold ${
                consolidado === opcao.valor ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500'
              }`}
            >
              {opcao.label}
            </button>
          ))}
        </div>
      )}

      <div className="inline-flex w-full rounded-full bg-zinc-100 p-1">
        {ABAS.map((aba) => (
          <button
            key={aba.valor}
            type="button"
            onClick={() => setSituacao(aba.valor)}
            className={`h-8 flex-1 rounded-full text-xs font-bold ${
              situacao === aba.valor ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500'
            }`}
          >
            {aba.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-zinc-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Carregando...</span>
        </div>
      ) : contas.length === 0 ? (
        <NoData
          title="Nenhuma conta"
          description="As mensalidades desta aba aparecem aqui."
          icon={<Wallet className="h-8 w-8" />}
          showAddButton={false}
        />
      ) : (
        <div className="space-y-3">
          {contas.map((conta) => (
            <article key={conta.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">{SITUACAO[conta.situacao]}</p>
                  <h2 className="mt-1 text-base font-bold text-zinc-900">{conta.descricao}</h2>
                  {conta.aluno?.nome && <p className="mt-0.5 text-sm text-zinc-600">{conta.aluno.nome}</p>}
                  <p className="mt-0.5 text-sm text-zinc-500">Vence em {dataCurta(conta.data_vencimento)}</p>
                </div>
                <p className="text-base font-bold text-zinc-900">{dinheiro(conta.saldo_devedor > 0 ? conta.saldo_devedor : conta.valor)}</p>
              </div>
              {!somenteLeitura && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {conta.situacao !== 'paga' && (
                    <button
                      type="button"
                      onClick={() => abrirPix(conta.id, conta.aluno?.id)}
                      disabled={abrindoPix}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-zinc-50 px-3 text-xs font-bold text-zinc-700 ring-1 ring-zinc-200"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      PIX
                    </button>
                  )}
                  {conta.pagamentos.map((pagamento) => (
                    <button
                      key={pagamento.id}
                      type="button"
                      onClick={() => emitirRecibo(pagamento.id, conta.aluno?.id)}
                      disabled={gerando}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-zinc-50 px-3 text-xs font-bold text-zinc-700 ring-1 ring-zinc-200"
                    >
                      <Receipt className="h-3.5 w-3.5" />
                      Recibo
                    </button>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <Dialog open={pix !== null} onOpenChange={(aberto) => !aberto && fecharPix()}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle>{pix?.descricao ?? 'PIX'}</DialogTitle>
            <DialogDescription>
              {pix ? dinheiro(pix.valor) : 'Escaneie o QR Code ou copie o código.'}
            </DialogDescription>
          </DialogHeader>
          {pix && (
            <div className="space-y-3">
              <img
                src={`data:image/png;base64,${pix.qr_code}`}
                alt="QR Code PIX"
                className="mx-auto h-52 w-52"
              />
              <p className="break-all rounded-xl bg-zinc-50 p-3 text-[11px] leading-relaxed text-zinc-600">{pix.payload}</p>
              <button
                type="button"
                onClick={copiarPix}
                className="h-10 w-full rounded-full bg-indigo-600 text-sm font-bold text-white"
              >
                Copiar código
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
