import type { FC, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { AulaForm, type AulaFormInitialData } from './AulaForm';

interface AulaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: AulaFormInitialData;
  defaultTurmaId?: number;
  defaultProfessorId?: number;
  title?: ReactNode;
  description?: string;
  onSuccess?: () => void;
}

export const AulaModal: FC<AulaModalProps> = ({
  open,
  onOpenChange,
  initialData,
  defaultTurmaId,
  defaultProfessorId,
  title,
  description,
  onSuccess,
}) => {
  const isEditing = Boolean(initialData?.id);

  const handleClose = () => onOpenChange(false);

  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl p-0 rounded-[32px] border-none shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onInteractOutside={(e) => {
          if ((e.target as HTMLElement | null)?.closest?.('[data-sonner-toaster]')) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="text-2xl font-bold text-zinc-900">
            {title ?? (
              <>
                {isEditing ? 'Editar' : 'Novo'}{' '}
                <span className="text-indigo-600">Agendamento</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            {description ??
              (isEditing
                ? 'Altere as informações deste agendamento.'
                : 'Preencha as informações para agendar uma nova aula.')}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <AulaForm
            key={`${initialData?.id ?? 'new'}-${defaultTurmaId ?? ''}-${defaultProfessorId ?? ''}-${initialData?.tipo ?? ''}-${initialData?.id_aluno_especifico ?? ''}-${initialData?.data ?? ''}`}
            initialData={initialData}
            defaultTurmaId={defaultTurmaId}
            defaultProfessorId={defaultProfessorId}
            onClose={handleClose}
            onSuccess={handleSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
