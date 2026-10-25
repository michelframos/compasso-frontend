import React from 'react'
import { Loader2, Wallet } from 'lucide-react'
import { NoData } from '@/shared/components/NoData'
import { ExtratoDetalhado } from '../../components/extrato/ExtratoDetalhado'
import { NavegadorMes } from '../../components/extrato/NavegadorMes'
import { useMeusGanhos } from './hooks/useMeusGanhos'

export const MeusGanhosPage: React.FC = () => {
  const { mes, extrato, isLoading, podeAvancar, mudarMes } = useMeusGanhos()

  return (
    <div className="space-y-5 pb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Meus <span className="text-indigo-600">ganhos</span>
        </h1>
        <p className="text-zinc-500 mt-1 text-[14px]">Salário fixo, hora-aula das aulas concluídas e comissão sobre o que seus alunos pagaram.</p>
      </div>

      <NavegadorMes mes={mes} podeAvancar={podeAvancar} onMudar={mudarMes} />

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-zinc-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Carregando extrato...</span>
        </div>
      ) : !extrato ? (
        <NoData
          title="Extrato indisponível"
          description="Não foi possível carregar o extrato deste mês."
          icon={<Wallet className="w-8 h-8" />}
          showAddButton={false}
        />
      ) : (
        <ExtratoDetalhado extrato={extrato} />
      )}
    </div>
  )
}
