import type { FC, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { ContaForm } from './ContaForm';
import type { Conta } from '../types';

interface ContaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conta?: Conta | null;
  tipoFluxo?: 'receita' | 'despesa';
  id_aluno?: number;
  id_matricula?: number;
  title?: ReactNode;
  description?: string;
  onSuccess?: (id?: number) => void;
}

export const ContaModal: FC<ContaModalProps> = ({
  open,
  onOpenChange,
  conta,
  tipoFluxo = 'despesa',
  id_aluno,
  id_matricula,
  title,
  description,
  onSuccess,
}) => {
  const tipoLabel = tipoFluxo === 'receita' ? 'Receita' : 'Despesa';
  const tipoColor = tipoFluxo === 'receita' ? 'text-emerald-600' : 'text-rose-600';
  const isEditing = Boolean(conta?.id);

  const handleClose = () => onOpenChange(false);

  const handleSuccess = (id?: number) => {
    onOpenChange(false);
    onSuccess?.(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 rounded-[32px] border-none shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="text-2xl font-bold text-zinc-900">
            {title ?? (
              <>
                {isEditing ? 'Editar' : 'Nova'} <span className={tipoColor}>{tipoLabel}</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            {description ??
              (isEditing
                ? 'Altere os dados da movimentação financeira selecionada.'
                : 'Preencha as informações para adicionar um novo registro.')}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <ContaForm
            key={`${conta?.id ?? 'new'}-${tipoFluxo}-${id_aluno ?? ''}-${id_matricula ?? ''}`}
            conta={conta ?? undefined}
            tipoFluxo={tipoFluxo}
            id_aluno={id_aluno}
            id_matricula={id_matricula}
            onClose={handleClose}
            onSuccess={handleSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
