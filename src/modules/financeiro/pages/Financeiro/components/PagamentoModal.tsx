import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/lib/utils';
import { PagamentoForm } from './PagamentoForm';
import { getConta } from '@/modules/financeiro/api/contas';
import type { Conta } from '../types';

interface PagamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conta?: Conta | null;
  contaId?: number | null;
  onSuccess?: () => void;
}

function unwrapConta(response: unknown): Conta | undefined {
  const payload = response as { data?: Conta } | Conta | null | undefined;
  if (!payload || typeof payload !== 'object') return undefined;

  const conta = 'data' in payload && payload.data ? payload.data : (payload as Conta);
  return conta?.id ? conta : undefined;
}

export const PagamentoModal: React.FC<PagamentoModalProps> = ({
  open,
  onOpenChange,
  conta,
  contaId,
  onSuccess,
}) => {
  const [contaCarregada, setContaCarregada] = useState<Conta | undefined>(undefined);
  const [isLoadingConta, setIsLoadingConta] = useState(false);
  const onOpenChangeRef = useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  const contaAtual = conta?.id ? conta : contaCarregada;

  useEffect(() => {
    if (!open) {
      setContaCarregada(undefined);
      setIsLoadingConta(false);
      return;
    }

    if (conta?.id || !contaId) return;

    let cancelled = false;

    const loadConta = async () => {
      setIsLoadingConta(true);
      try {
        const response = await getConta(contaId);
        const loaded = unwrapConta(response);

        if (!loaded) {
          toast.error('Não foi possível carregar a conta para quitação.');
          onOpenChangeRef.current(false);
          return;
        }

        if (!cancelled) setContaCarregada(loaded);
      } catch (error) {
        toast.error(getErrorMessage(error, 'Não foi possível abrir a quitação da conta.'));
        onOpenChangeRef.current(false);
      } finally {
        if (!cancelled) setIsLoadingConta(false);
      }
    };

    void loadConta();

    return () => {
      cancelled = true;
    };
  }, [open, conta?.id, contaId]);

  const handleClose = () => onOpenChange(false);

  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 rounded-[24px] border-none shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="text-2xl font-bold text-zinc-900">
            Registrar <span className="text-emerald-600">Pagamento</span>
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            {contaAtual?.descricao
              ? `Quite a conta: ${contaAtual.descricao}`
              : 'Preencha os dados do pagamento para esta conta.'}
          </DialogDescription>
        </DialogHeader>

        {isLoadingConta ? (
          <div className="flex items-center justify-center gap-2 py-16 text-zinc-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando conta...
          </div>
        ) : contaAtual ? (
          <PagamentoForm
            key={contaAtual.id}
            conta={contaAtual}
            onClose={handleClose}
            onSuccess={handleSuccess}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
