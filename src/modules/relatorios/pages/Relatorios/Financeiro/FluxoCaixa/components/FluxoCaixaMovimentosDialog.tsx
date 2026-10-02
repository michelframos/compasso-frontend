import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import type { FluxoCaixaMovimento, FluxoOrigem } from '../hooks/useFluxoCaixa';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FluxoCaixaMovimentosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  movimentos: FluxoCaixaMovimento[];
  periodo: string | null;
  origem: FluxoOrigem | null;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatPeriodo = (periodo: string) => {
  try {
    return format(parseISO(`${periodo}-01`), 'MMMM yyyy', { locale: ptBR });
  } catch {
    return periodo;
  }
};

export const FluxoCaixaMovimentosDialog: React.FC<FluxoCaixaMovimentosDialogProps> = ({
  open,
  onOpenChange,
  isLoading,
  movimentos,
  periodo,
  origem,
}) => {
  const isPrevisto = origem === 'previsto';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="p-6 pb-3">
          <DialogTitle className="text-xl font-bold text-zinc-900 capitalize">
            {isPrevisto ? 'Contas previstas' : 'Pagamentos realizados'}
            {periodo ? ` · ${formatPeriodo(periodo)}` : ''}
          </DialogTitle>
          <DialogDescription>
            {isPrevisto
              ? 'Contas com vencimento neste mês (exceto canceladas).'
              : 'Baixas registradas neste mês.'}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto px-6 pb-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
              <Loader2 className="h-6 w-6 animate-spin mb-2" />
              Carregando movimentos...
            </div>
          ) : movimentos.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-10">Nenhum movimento neste mês.</p>
          ) : (
            <div className="space-y-2">
              {movimentos.map((item) => (
                <div key={`${item.id}-${item.data}`} className="flex items-start justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50/60 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-900 truncate">
                      {item.titular || item.descricao}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate">
                      {item.titular ? item.descricao : item.categoria}
                      {' · '}
                      {item.categoria}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {format(parseISO(String(item.data).slice(0, 10)), 'dd/MM/yyyy')}
                      {item.forma_pagamento ? ` · ${item.forma_pagamento}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${item.tipo === 'receita' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {item.tipo === 'despesa' ? '-' : ''}
                      {formatCurrency(item.valor)}
                    </p>
                    {isPrevisto && item.saldo_devedor != null && (
                      <p className="text-[10px] text-zinc-400">
                        Aberto: {formatCurrency(item.saldo_devedor)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
