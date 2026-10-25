import React from 'react'
import { CalendarClock, Check, Search, X } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { PaginationCustom } from '@/shared/components/ui/pagination-custom'
import { ResumoSolicitacao } from '@/modules/professor'
import type { FiltroStatusSolicitacao } from '../../api/solicitacoesAulas'
import { DecisaoSolicitacaoDialog } from './components/DecisaoSolicitacaoDialog'
import { useSolicitacoesAulas } from './hooks/useSolicitacoesAulas'

const FILTROS: { valor: FiltroStatusSolicitacao; label: string }[] = [
  { valor: 'pendente', label: 'Pendentes' },
  { valor: 'aprovada', label: 'Aprovadas' },
  { valor: 'rejeitada', label: 'Rejeitadas' },
  { valor: 'todas', label: 'Todas' },
]

export const SolicitacoesAulasPage: React.FC = () => {
  const {
    solicitacoes,
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
  } = useSolicitacoesAulas()

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Solicitações de <span className="text-indigo-600">aula</span>
          </h1>
          <p className="text-zinc-500 mt-1 text-[14px]">
            Cancelamentos, reposições, substituições e novas aulas pedidas pelos professores.
          </p>
        </div>

        <div className="relative w-full lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Pesquisar por professor..."
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
              status === filtro.valor ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
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
      ) : solicitacoes.length === 0 ? (
        <Card className="border-dashed border-2 border-zinc-200 shadow-none bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-zinc-100 rounded-full text-zinc-400 mb-4">
              <CalendarClock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">
              {status === 'pendente' ? 'Nenhuma solicitação pendente' : 'Nenhuma solicitação encontrada'}
            </h3>
            <p className="text-zinc-500 max-w-xs mx-auto mt-1">
              Os pedidos aparecem aqui quando a escola exige aprovação para os professores alterarem aulas
              (Configurações › Professores).
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {solicitacoes.map((solicitacao) => (
            <ResumoSolicitacao key={solicitacao.id} solicitacao={solicitacao} mostrarProfessor>
              {solicitacao.status === 'pendente' && (
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => abrirDecisao(solicitacao, 'rejeitada')}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 hover:cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    Rejeitar
                  </button>
                  <button
                    type="button"
                    onClick={() => abrirDecisao(solicitacao, 'aprovada')}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 hover:cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Analisar e aprovar
                  </button>
                </div>
              )}
            </ResumoSolicitacao>
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

      <DecisaoSolicitacaoDialog
        key={emDecisao ? `${emDecisao.solicitacao.id}-${emDecisao.modo}` : 'fechado'}
        solicitacao={emDecisao?.solicitacao ?? null}
        modo={emDecisao?.modo ?? 'aprovada'}
        isSaving={isSaving}
        onFechar={fecharDecisao}
        onConfirmar={decidir}
      />
    </div>
  )
}

export default SolicitacoesAulasPage
