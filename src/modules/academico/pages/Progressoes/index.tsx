import React from 'react'
import { Search, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { PaginationCustom } from '@/shared/components/ui/pagination-custom'
import { DecisaoProgressaoDialog } from './components/DecisaoProgressaoDialog'
import { SugestaoProgressaoCard } from './components/SugestaoProgressaoCard'
import { useProgressoes } from './hooks/useProgressoes'
import type { FiltroStatusProgressao } from './types'

const FILTROS: { valor: FiltroStatusProgressao; label: string }[] = [
  { valor: 'pendente', label: 'Pendentes' },
  { valor: 'aprovada', label: 'Aprovadas' },
  { valor: 'rejeitada', label: 'Rejeitadas' },
  { valor: 'todas', label: 'Todas' },
]

export const ProgressoesPage: React.FC = () => {
  const {
    sugestoes,
    pagination,
    isLoading,
    status,
    setStatus,
    search,
    setSearch,
    irParaPagina,
    emDecisao,
    isSaving,
    abrirDecisao,
    fecharDecisao,
    decidir,
  } = useProgressoes()

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Progressões de <span className="text-indigo-600">nível</span>
          </h1>
          <p className="text-zinc-500 mt-1 text-[14px]">Analise as sugestões dos professores para mudar alunos de nível.</p>
        </div>

        <div className="relative w-full lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Pesquisar por aluno..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 rounded-full bg-white border-zinc-200 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTROS.map((filtro) => (
          <button
            key={filtro.valor}
            type="button"
            onClick={() => setStatus(filtro.valor)}
            className={`px-4 h-9 rounded-full border text-xs font-bold transition-all hover:cursor-pointer ${
              status === filtro.valor
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
            }`}
          >
            {filtro.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sugestoes.length === 0 ? (
        <Card className="border-dashed border-2 border-zinc-200 shadow-none bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-zinc-100 rounded-full text-zinc-400 mb-4">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">
              {status === 'pendente' ? 'Nenhuma sugestão pendente' : 'Nenhuma sugestão encontrada'}
            </h3>
            <p className="text-zinc-500 max-w-xs mx-auto mt-1">
              As sugestões aparecem aqui quando um professor indica que o aluno está pronto para outro nível.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {sugestoes.map((sugestao) => (
            <SugestaoProgressaoCard key={sugestao.id} sugestao={sugestao} onDecidir={abrirDecisao} />
          ))}
        </div>
      )}

      {pagination && pagination.last_page > 1 && (
        <PaginationCustom
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          onPageChange={irParaPagina}
          isLoading={isLoading}
        />
      )}

      <DecisaoProgressaoDialog
        key={emDecisao ? `${emDecisao.sugestao.id}-${emDecisao.modo}` : 'fechado'}
        sugestao={emDecisao?.sugestao ?? null}
        modo={emDecisao?.modo ?? 'aprovada'}
        isSaving={isSaving}
        onFechar={fecharDecisao}
        onConfirmar={decidir}
      />
    </div>
  )
}

export default ProgressoesPage
