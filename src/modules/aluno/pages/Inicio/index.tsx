import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2 } from 'lucide-react'
import { PainelCards } from './components/PainelCards'
import { useInicio } from './hooks/useInicio'

export const InicioPage: React.FC = () => {
  const { aluno, painel, isLoading, aguardandoDependente } = useInicio()

  if (aguardandoDependente) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h1 className="text-lg font-bold">Início</h1>
        <p className="mt-2 text-sm text-zinc-600">Selecione um aluno para ver a área dele.</p>
      </section>
    )
  }

  const hoje = painel ? new Date(`${painel.data_referencia}T00:00:00`) : new Date()
  const primeiroNome = aluno?.nome?.split(' ')[0]

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Olá{primeiroNome ? ',' : ''} <span className="text-indigo-600">{primeiroNome ?? 'aluno'}</span>
        </h1>
        <p className="mt-1 text-sm capitalize text-zinc-500">{format(hoje, "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-zinc-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Carregando...</span>
        </div>
      ) : (
        painel && <PainelCards painel={painel} />
      )}
    </div>
  )
}
