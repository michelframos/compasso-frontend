import React from 'react'
import { CalendarClock, CalendarPlus, Inbox, Loader2, X } from 'lucide-react'
import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog'
import { Button } from '@/shared/components/ui/button'
import { PaginationCustom } from '@/shared/components/ui/pagination-custom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { ResumoSolicitacao } from '../../components/solicitacoes/ResumoSolicitacao'
import { SolicitarAlteracaoDialog } from '../../components/solicitacoes/SolicitarAlteracaoDialog'
import { DisponibilidadeTab } from './components/DisponibilidadeTab'
import { EscolherAulaDialog } from './components/EscolherAulaDialog'
import { NovaAulaDialog } from './components/NovaAulaDialog'
import { useMinhasSolicitacoes, type FiltroSolicitacoes } from './hooks/useMinhasSolicitacoes'

const FILTROS: { valor: FiltroSolicitacoes; label: string }[] = [
  { valor: 'todas', label: 'Todas' },
  { valor: 'pendente', label: 'Pendentes' },
  { valor: 'aprovada', label: 'Aprovadas' },
  { valor: 'rejeitada', label: 'Rejeitadas' },
]

export const SolicitacoesPage: React.FC = () => {
  const {
    solicitacoes,
    pagina,
    status,
    setStatus,
    isLoading,
    permissoes,
    irParaPagina,
    recarregar,
    emCancelamento,
    setEmCancelamento,
    cancelando,
    confirmarCancelamento,
    escolhendoAula,
    setEscolhendoAula,
    escolherAula,
    emAlteracao,
    fecharAlteracao,
    criandoAula,
    setCriandoAula,
  } = useMinhasSolicitacoes()

  const podeAlterar = !permissoes || permissoes.editar !== 'bloqueado' || permissoes.excluir !== 'bloqueado'
  const podeCriar = !!permissoes && permissoes.criar !== 'bloqueado'

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Minhas <span className="text-indigo-600">solicitações</span>
          </h1>
          <p className="text-zinc-500 mt-1 text-[14px]">Cancelamentos, reposições, substituições, novas aulas e sua disponibilidade.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {podeAlterar && (
            <Button
              type="button"
              onClick={() => setEscolhendoAula(true)}
              className="h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 font-bold gap-2 px-5 hover:cursor-pointer"
            >
              <CalendarClock className="w-4 h-4" />
              Alterar uma aula
            </Button>
          )}
          {podeCriar && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setCriandoAula(true)}
              className="h-10 rounded-full font-bold gap-2 px-5 border-zinc-200 hover:cursor-pointer"
            >
              <CalendarPlus className="w-4 h-4" />
              Nova aula
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="solicitacoes" className="w-full">
        <TabsList className="h-auto p-1 rounded-2xl bg-zinc-100">
          <TabsTrigger value="solicitacoes" className="rounded-xl text-sm font-bold px-4 py-1.5 hover:cursor-pointer">
            Solicitações
          </TabsTrigger>
          <TabsTrigger value="disponibilidade" className="rounded-xl text-sm font-bold px-4 py-1.5 hover:cursor-pointer">
            Disponibilidade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="solicitacoes" className="mt-4 space-y-4">
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
            <div className="flex items-center justify-center py-16 gap-2 text-zinc-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Carregando...</span>
            </div>
          ) : solicitacoes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border-2 border-dashed border-zinc-200">
              <Inbox className="w-8 h-8 text-zinc-300 mb-3" />
              <p className="font-bold text-zinc-900">Nenhuma solicitação</p>
              <p className="text-sm text-zinc-500 max-w-xs mt-1">
                Use “Alterar uma aula” para cancelar, repor ou pedir um substituto.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {solicitacoes.map((solicitacao) => (
                <ResumoSolicitacao key={solicitacao.id} solicitacao={solicitacao}>
                  {solicitacao.pode_cancelar && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setEmCancelamento(solicitacao)}
                        className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 hover:cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        Cancelar solicitação
                      </button>
                    </div>
                  )}
                </ResumoSolicitacao>
              ))}
            </div>
          )}

          {pagina.ultima > 1 && (
            <PaginationCustom currentPage={pagina.atual} lastPage={pagina.ultima} onPageChange={irParaPagina} isLoading={isLoading} />
          )}
        </TabsContent>

        <TabsContent value="disponibilidade" className="mt-4">
          <DisponibilidadeTab />
        </TabsContent>
      </Tabs>

      <EscolherAulaDialog aberto={escolhendoAula} onFechar={() => setEscolhendoAula(false)} onEscolher={escolherAula} />
      <SolicitarAlteracaoDialog aula={emAlteracao} onFechar={fecharAlteracao} onConcluido={recarregar} />
      <NovaAulaDialog aberto={criandoAula} modo={permissoes?.criar ?? null} onFechar={() => setCriandoAula(false)} onConcluido={recarregar} />
      <ConfirmDeleteDialog
        open={emCancelamento !== null}
        onOpenChange={(open) => !open && !cancelando && setEmCancelamento(null)}
        title="Cancelar solicitação?"
        description="A secretaria deixa de ver este pedido. A aula continua como está."
        confirmLabel="Cancelar solicitação"
        isLoading={cancelando}
        onConfirm={confirmarCancelamento}
      />
    </div>
  )
}

export default SolicitacoesPage
