import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Lock, LockOpen, Wallet } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog'
import { NoData } from '@/shared/components/NoData'
import { useHasModulo } from '@/shared/hooks/useHasModulo'
import { ExtratoDetalhado, NavegadorMes } from '@/modules/professor'
import { FecharMesDialog } from './components/FecharMesDialog'
import { useExtratoProfessorAdmin } from './hooks/useExtratoProfessorAdmin'

export const ExtratoProfessorAdminPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const usaFinanceiro = useHasModulo('financeiro')
  const {
    mes,
    competencia,
    podeAvancar,
    mudarMes,
    extrato,
    isLoading,
    isSaving,
    fecharAberto,
    setFecharAberto,
    reabrirAberto,
    setReabrirAberto,
    fechar,
    reabrir,
  } = useExtratoProfessorAdmin(id)
  const nome = extrato?.professor.nome ?? 'professor'

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-start gap-3">
        <Link
          to={`/remuneracao?mes=${competencia}`}
          className="mt-1 p-2 rounded-full text-zinc-500 hover:bg-white hover:text-indigo-600"
          aria-label="Voltar para a remuneração do mês"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Extrato de <span className="text-indigo-600">{extrato?.professor.nome ?? '...'}</span>
          </h1>
          <p className="text-zinc-500 mt-1 text-[14px]">Base de cálculo, percentuais e valores do mês.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <NavegadorMes mes={mes} podeAvancar={podeAvancar} onMudar={mudarMes} />
        {extrato && !isLoading && extrato.situacao === 'aberto' && (
          <Button onClick={() => setFecharAberto(true)} className="rounded-full bg-indigo-600 hover:bg-indigo-700 font-bold hover:cursor-pointer">
            <Lock className="w-4 h-4" /> Fechar mês
          </Button>
        )}
        {extrato && !isLoading && extrato.situacao === 'fechado' && (
          <Button variant="outline" onClick={() => setReabrirAberto(true)} className="rounded-full font-bold hover:cursor-pointer">
            <LockOpen className="w-4 h-4" /> Reabrir mês
          </Button>
        )}
        {extrato && !isLoading && extrato.situacao === 'em_andamento' && (
          <span className="text-[12px] text-zinc-500">O fechamento fica disponível quando o mês terminar.</span>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-zinc-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Carregando extrato...</span>
        </div>
      ) : !extrato ? (
        <NoData
          title="Extrato indisponível"
          description="Não foi possível carregar o extrato deste professor."
          icon={<Wallet className="w-8 h-8" />}
          showAddButton={false}
        />
      ) : (
        <ExtratoDetalhado extrato={extrato} />
      )}

      {extrato && (
        <FecharMesDialog
          aberto={fecharAberto}
          mes={mes}
          professor={nome}
          total={extrato.resumo.valor_total}
          geraDespesa={usaFinanceiro && extrato.resumo.valor_total > 0}
          isSaving={isSaving}
          onFechar={() => setFecharAberto(false)}
          onConfirmar={fechar}
        />
      )}

      <ConfirmDeleteDialog
        open={reabrirAberto}
        onOpenChange={setReabrirAberto}
        title="Reabrir o mês?"
        description={
          extrato?.fechamento?.conta
            ? 'O extrato volta a ser calculado com os dados atuais e a despesa lançada no financeiro é excluída. Não é possível reabrir se ela já tiver pagamentos.'
            : 'O extrato volta a ser calculado com os dados atuais.'
        }
        confirmLabel="Reabrir"
        isLoading={isSaving}
        onConfirm={reabrir}
      />
    </div>
  )
}
