import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHasModulo } from '@/shared/hooks/useHasModulo';

interface Payment {
  id?: number;
  name: string;
  date: string;
  amount: string;
  status: 'Pago' | 'Pendente';
}

interface RecentPaymentsProps {
  payments: Payment[];
}

export const RecentPayments: React.FC<RecentPaymentsProps> = ({ payments }) => {
  const navigate = useNavigate();
  const hasFinanceiro = useHasModulo('financeiro');

  return (
    <div className="bg-white rounded-2xl p-6 border border-zinc-200/50 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-zinc-900">Histórico de Mensalidades</h3>
        {hasFinanceiro && (
        <Button onClick={() => navigate('/financeiro')} variant="ghost" size="sm" className="text-indigo-600 font-bold gap-1 text-xs">
          Ver tudo <ArrowUpRight className="w-3 h-3" />
        </Button>
        )}
      </div>
      {payments.length === 0 ? (
        <p className="text-sm text-zinc-400 py-1">Nenhum pagamento registrado recentemente.</p>
      ) : (
        <div className="space-y-4">
          {payments.map((payment, i) => (
            <div key={payment.id ?? i} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-xs font-bold text-indigo-600 border border-zinc-200">
                  {payment.name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-bold text-zinc-900 text-sm">{payment.name || 'Sem nome'}</p>
                  <p className="text-[10px] text-zinc-500">{payment.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-zinc-900 text-sm">{payment.amount}</p>
                <p className={`text-[9px] font-bold uppercase tracking-wider ${payment.status === 'Pago' ? 'text-emerald-600' : 'text-amber-600'}`}>{payment.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
