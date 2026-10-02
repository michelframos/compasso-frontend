import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { ArrowUpRight, AlertCircle, Pencil, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PagamentoModal } from '@/modules/financeiro';
import type { OverdueAccount } from '@/modules/relatorios/components/Dashboard/hooks/useDashboardData';
import { useHasModulo } from '@/shared/hooks/useHasModulo';

interface OverdueAccountsProps {
  items: OverdueAccount[];
  onPaymentSuccess?: () => void;
}

export const OverdueAccounts: React.FC<OverdueAccountsProps> = ({ items, onPaymentSuccess }) => {
  const navigate = useNavigate();
  const hasFinanceiro = useHasModulo('financeiro');
  const hasRelatorios = useHasModulo('relatorios');
  const [contaIdBaixa, setContaIdBaixa] = useState<number | null>(null);

  return (
    <>
      <div className="bg-white rounded-2xl p-6 border border-zinc-200/50 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Contas em Atraso</h3>
          </div>
          {hasRelatorios && (
          <Button
            onClick={() => navigate('/relatorios/financeiro/inadimplencia')}
            variant="ghost"
            size="sm"
            className="text-indigo-600 font-bold gap-1 text-xs"
          >
            Ver tudo <ArrowUpRight className="w-3 h-3" />
          </Button>
          )}
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-zinc-400 py-1">
            Nenhuma conta em atraso no momento.
          </p>
        ) : (
          <div className="space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 p-3 rounded-xl bg-rose-50/40 hover:bg-rose-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 shrink-0 rounded-full bg-white flex items-center justify-center text-xs font-bold text-rose-600 border border-rose-100">
                    {item.name?.charAt(0) || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-zinc-900 text-sm truncate">{item.name || 'Sem nome'}</p>
                    <p className="text-[10px] text-zinc-500 truncate">
                      {item.description || 'Conta'} · Venc. {item.dueDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <div className="text-right mr-1">
                    <p className="font-bold text-rose-600 text-sm">{item.amount}</p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-rose-500">
                      {item.daysOverdue} {item.daysOverdue === 1 ? 'dia' : 'dias'}
                    </p>
                  </div>
                  {hasFinanceiro && (
                  <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title="Quitar conta"
                    aria-label={`Quitar conta de ${item.name}`}
                    className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-white"
                    onClick={() => setContaIdBaixa(item.id)}
                  >
                    <Banknote className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title="Abrir cadastro da conta"
                    aria-label={`Abrir cadastro de ${item.name}`}
                    className="h-8 w-8 text-zinc-500 hover:text-indigo-600 hover:bg-white"
                    onClick={() => navigate(`/financeiro?conta_id=${item.id}`)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {hasFinanceiro && (
      <PagamentoModal
        open={contaIdBaixa != null}
        onOpenChange={(open) => {
          if (!open) setContaIdBaixa(null);
        }}
        contaId={contaIdBaixa}
        onSuccess={onPaymentSuccess}
      />
      )}
    </>
  );
};
