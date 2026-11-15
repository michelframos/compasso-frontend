import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Users } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { AtalhosAluno } from './components/AtalhosAluno'
import { PainelCards } from './components/PainelCards'
import { useInicio } from './hooks/useInicio'

function PainelSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl sm:col-span-2" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[4.5rem] rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

export const InicioPage: React.FC = () => {
  const { aluno, painel, painelErro, isLoading, aguardandoDependente } = useInicio()

  if (aguardandoDependente) {
    return (
      <section className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-200 bg-white px-5 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Users className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-lg font-bold text-zinc-900">Selecione um aluno</h1>
        <p className="mt-2 max-w-sm text-sm text-zinc-600">
          Use o seletor no topo da tela para escolher o dependente e ver a área dele.
        </p>
      </section>
    )
  }

  const hoje = painel ? new Date(`${painel.data_referencia}T00:00:00`) : new Date()
  const primeiroNome = aluno?.nome?.split(' ')[0]

  return (
    <div className="space-y-6 pb-2">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Olá{primeiroNome ? ',' : ''} <span className="text-indigo-600">{primeiroNome ?? 'aluno'}</span>
        </h1>
        <p className="mt-1 text-sm capitalize text-zinc-500">{format(hoje, "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
      </div>

      {isLoading ? (
        <PainelSkeleton />
      ) : (
        <>
          {painel ? (
            <PainelCards painel={painel} />
          ) : painelErro ? (
            <section className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/40 px-5 py-8 text-center">
              <p className="text-sm font-semibold text-rose-800">Não foi possível carregar o painel.</p>
              <p className="mt-1 text-sm text-rose-700/80">Tente novamente em instantes ou use os atalhos abaixo.</p>
            </section>
          ) : null}

          <AtalhosAluno />
        </>
      )}
    </div>
  )
}
