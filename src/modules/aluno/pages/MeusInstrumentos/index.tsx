import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Guitar, Loader2 } from 'lucide-react'
import { NoData } from '@/shared/components/NoData'
import type { HistoricoInstrumento } from '../../types'
import { useMeusInstrumentos } from './hooks/useMeusInstrumentos'

const ACOES: Record<HistoricoInstrumento['acao'], string> = {
  emprestimo: 'Empréstimo',
  devolucao: 'Devolução',
  manutencao: 'Manutenção',
}

function dataCurta(iso: string | null) {
  if (!iso) return null
  return format(new Date(`${iso.slice(0, 10)}T00:00:00`), "d 'de' MMM 'de' yyyy", { locale: ptBR })
}

export const MeusInstrumentosPage: React.FC = () => {
  const { atuais, historico, isLoading, aguardandoDependente } = useMeusInstrumentos()

  if (aguardandoDependente) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h1 className="text-lg font-bold">Instrumentos</h1>
        <p className="mt-2 text-sm text-zinc-600">Selecione um aluno para ver os instrumentos dele.</p>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Instrumentos</h1>
        <p className="mt-1 text-sm text-zinc-500">O que está com você agora e o histórico de empréstimos.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando...
        </div>
      ) : (
        <>
          {atuais.length === 0 ? (
            <NoData
              title="Nenhum instrumento emprestado"
              description="Quando a escola emprestar um instrumento, ele aparece aqui."
              icon={<Guitar className="h-8 w-8" />}
              showAddButton={false}
            />
          ) : (
            <div className="space-y-3">
              {atuais.map((instrumento) => (
                <article key={instrumento.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-600">{instrumento.tipo}</p>
                  <h2 className="mt-1 text-base font-bold text-zinc-900">{instrumento.nome}</h2>
                  <p className="mt-2 text-sm text-zinc-600">
                    {instrumento.numero_serie ? `Série ${instrumento.numero_serie}` : 'Sem número de série'}
                    {instrumento.data_emprestimo ? ` · desde ${dataCurta(instrumento.data_emprestimo)}` : ''}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {instrumento.data_prevista_devolucao
                      ? `Devolver até ${dataCurta(instrumento.data_prevista_devolucao)}`
                      : 'Sem data prevista de devolução'}
                  </p>
                </article>
              ))}
            </div>
          )}

          {historico.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-zinc-900">Histórico</h2>
              <ul className="divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-white px-4">
                {historico.map((item) => (
                  <li key={item.id} className="py-3">
                    <p className="text-sm font-bold text-zinc-900">{item.instrumento?.nome ?? 'Instrumento'}</p>
                    <p className="text-xs text-zinc-500">
                      {ACOES[item.acao] ?? item.acao}
                      {item.data ? ` · ${dataCurta(item.data)}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}
