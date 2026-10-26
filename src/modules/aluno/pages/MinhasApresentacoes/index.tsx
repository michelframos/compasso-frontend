import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2, MapPin, Music, Shirt } from 'lucide-react'
import { NoData } from '@/shared/components/NoData'
import type { ApresentacaoDoAluno } from '../../types'
import { useMinhasApresentacoes } from './hooks/useMinhasApresentacoes'

const STATUS: Record<string, string> = {
  planejamento: 'Planejamento',
  ensaios: 'Ensaios',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

function dataLonga(iso: string) {
  return format(new Date(`${iso.slice(0, 10)}T00:00:00`), "d 'de' MMMM", { locale: ptBR })
}

function Card({ apresentacao }: { apresentacao: ApresentacaoDoAluno }) {
  const espetaculo = apresentacao.espetaculo
  const status = espetaculo ? STATUS[espetaculo.status] ?? espetaculo.status : null

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-600">
            {espetaculo?.titulo ?? 'Espetáculo'}
          </p>
          <h2 className="mt-1 text-base font-bold text-zinc-900">{apresentacao.titulo_musica || 'Apresentação'}</h2>
        </div>
        {status && (
          <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-bold text-zinc-600">
            {status}
          </span>
        )}
      </div>

      <dl className="mt-3 space-y-1.5 text-sm text-zinc-600">
        {espetaculo && (
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 shrink-0 text-zinc-400" />
            <dd>{dataLonga(espetaculo.data_evento)}</dd>
          </div>
        )}
        {espetaculo?.local && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-zinc-400" />
            <dd>{espetaculo.local}</dd>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Shirt className="h-4 w-4 shrink-0 text-zinc-400" />
          <dd>
            {apresentacao.papel ? `${apresentacao.papel}` : 'Papel a definir'}
            {apresentacao.tamanho_figurino ? ` · tam. ${apresentacao.tamanho_figurino}` : ''}
            {apresentacao.recebeu_figurino ? ' · figurino entregue' : ''}
          </dd>
        </div>
      </dl>

      {apresentacao.ensaios.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-zinc-100 pt-3">
          {apresentacao.ensaios.map((ensaio) => (
            <li key={ensaio.id} className="text-xs text-zinc-500">
              Ensaio {dataLonga(ensaio.data)}, {ensaio.hora_inicio}–{ensaio.hora_termino}
              {ensaio.local ? ` · ${ensaio.local}` : ''}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

export const MinhasApresentacoesPage: React.FC = () => {
  const { apresentacoes, isLoading, aguardandoDependente } = useMinhasApresentacoes()

  if (aguardandoDependente) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h1 className="text-lg font-bold">Apresentações</h1>
        <p className="mt-2 text-sm text-zinc-600">Selecione um aluno para ver as apresentações dele.</p>
      </section>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Apresentações</h1>
        <p className="mt-1 text-sm text-zinc-500">Espetáculos em que você está escalado, com local e figurino.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando...
        </div>
      ) : apresentacoes.length === 0 ? (
        <NoData
          title="Nenhuma apresentação"
          description="Quando a escola escalar você, a data e o figurino aparecem aqui."
          icon={<Music className="h-8 w-8" />}
          showAddButton={false}
        />
      ) : (
        <div className="space-y-3">
          {apresentacoes.map((apresentacao) => (
            <Card key={apresentacao.id} apresentacao={apresentacao} />
          ))}
        </div>
      )}
    </div>
  )
}
